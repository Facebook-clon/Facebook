import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import api from '../api/api';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (cursor = null, isRefresh = false) => {
    if (loading || (!hasMore && !isRefresh && cursor)) return;
    setLoading(true);
    try {
      const response = await api.get('/posts', { params: { cursor, limit: 10 } });
      const { posts: newPosts, nextCursor: newNextCursor, hasMore: moreAvailable } = response.data;

      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setNextCursor(newNextCursor);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Fetch posts error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setHasMore(true);
      fetchPosts(null, true);
    }, [])
  );

  // تم إصلاح مشكلة الـ Race Condition: بناخد نسخة من البيانات القديمة
  // *قبل* ما نعدل الحالة، مش من جوه الـ callback
  const handleLike = async (postId, currentIsLiked, currentLikesCount) => {
    const previousPosts = posts;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLikedByMe: !currentIsLiked,
            likesCount: currentIsLiked ? currentLikesCount - 1 : currentLikesCount + 1,
          };
        }
        return post;
      })
    );

    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      setPosts(previousPosts);
    }
  };

  const renderPostItem = useCallback(({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.fullName}>{item.users?.full_name}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => handleLike(item.id, item.isLikedByMe, item.likesCount)}>
          <Text style={item.isLikedByMe ? styles.likedText : styles.unlikedText}>
            {item.isLikedByMe ? '❤️' : '🤍'} {item.likesCount || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CommentsScreen', { postId: item.id })}>
          <Text style={styles.unlikedText}>💬 التعليقات ({item.commentsCount || 0})</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPostItem}
        onEndReached={() => hasMore && !loading && nextCursor && fetchPosts(nextCursor)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(null, true); }} />
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  postCard: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8 },
  fullName: { fontWeight: 'bold', fontSize: 15 },
  content: { marginVertical: 8, fontSize: 14 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  likedText: { color: '#e41e3f', fontWeight: 'bold' },
  unlikedText: { color: '#65676b' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1877f2', justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  fabIcon: { color: '#fff', fontSize: 24 },
});
