import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../api/api';

export default function CommentsScreen({ route }) {
  const { postId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data.comments || response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const text = newComment.trim();
    setNewComment('');
    const tempId = Date.now().toString();

    setComments((prev) => [...prev, { id: tempId, content: text, users: { full_name: 'أنت' } }]);

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      setComments((prev) => prev.map((c) => (c.id === tempId ? (res.data.comment || res.data) : c)));
    } catch (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={styles.author}>{item.users?.full_name}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="اكتب تعليق..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
          <Text style={styles.sendTxt}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  commentItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  author: { fontWeight: 'bold' },
  inputBar: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16 },
  sendBtn: { marginLeft: 8, backgroundColor: '#1877f2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendTxt: { color: '#fff', fontWeight: 'bold' },
});
