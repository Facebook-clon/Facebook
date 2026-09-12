import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/storageService';

export default function AuthScreen({ navigation }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('خطأ', 'من فضلك أدخل البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        if (!fullName.trim() || !username.trim()) {
          Alert.alert('خطأ', 'من فضلك أدخل الاسم واسم المستخدم');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;

        // ننشئ صف في جدول users المرتبط بالحساب في auth.users
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            full_name: fullName.trim(),
            username: username.trim(),
          });
        }

        if (data.session) {
          await AsyncStorage.setItem('userToken', data.session.access_token);
          navigation.replace('Feed');
        } else {
          Alert.alert('تم إنشاء الحساب', 'تحقق من بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await AsyncStorage.setItem('userToken', data.session.access_token);
        navigation.replace('Feed');
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</Text>

      {isSignUp && (
        <>
          <TextInput style={styles.input} placeholder="الاسم الكامل" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="اسم المستخدم" value={username} onChangeText={setUsername} autoCapitalize="none" />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>{isSignUp ? 'إنشاء حساب' : 'دخول'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchTxt}>
          {isSignUp ? 'عندك حساب بالفعل؟ سجّل دخول' : 'مفيش حساب؟ اعمل واحد'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#1877f2' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  submitBtn: { backgroundColor: '#1877f2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchTxt: { color: '#1877f2', textAlign: 'center', marginTop: 16 },
});
