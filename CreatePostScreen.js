import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import { uploadImageToSupabase } from '../services/storageService';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setSelectedImage(res.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) return;
    setLoading(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImageToSupabase(selectedImage, 'post-images');
      }
      await api.post('/posts', { content: content.trim(), image_url: imageUrl });
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'تعذر نشر المنشور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="بم تفكر؟"
        multiline
      />
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.preview} />}
      <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
        <Text style={styles.attachTxt}>📷 إضافة صورة</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>نشر</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: { fontSize: 16, minHeight: 100 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginVertical: 10 },
  attachBtn: { padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  attachTxt: { color: '#45bd62', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#1877f2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitTxt: { color: '#fff', fontWeight: 'bold' },
});
