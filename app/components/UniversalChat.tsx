import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../src/config';

const screenWidth = Dimensions.get('window').width;
const SAFE_TOP = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 16;
const PAGE_SIZE = 20;

type RoleType = 'employee' | 'engineer';
type ChatMessage = {
  id: number;
  content: string;
  user_type: RoleType;
  user_id: number;
  user: {
    name: string;
    profile: {
      image?: string;
      avatar?: string;
      image_url?: string;
    };
  };
  created_at: string;
};

const getAvatarUrl = (msg: ChatMessage) => {
  if (msg?.user?.profile?.image) {
    return `${BASE_URL.replace('/api', '')}/uploads/${msg.user.profile.image}`;
  }
  if (msg?.user?.profile?.avatar) {
    return msg.user.profile.avatar.startsWith('http')
      ? msg.user.profile.avatar
      : `${BASE_URL.replace('/api', '')}/${msg.user.profile.avatar}`;
  }
  if (msg?.user?.profile?.image_url) {
    return msg.user.profile.image_url.startsWith('http')
      ? msg.user.profile.image_url
      : `${BASE_URL.replace('/api', '')}/${msg.user.profile.image_url}`;
  }
  return 'https://randomuser.me/api/portraits/men/11.jpg';
};

const getUserName = (msg: ChatMessage) =>
  msg?.user?.name || (msg.user_type === 'engineer' ? 'Инженер' : 'Ажилтан');

const formatDate = (d: string) => d?.slice(0, 16).replace('T', ' ') || '';

type UniversalChatProps = {
  issueId: string | number;
  userId: number;
  role: RoleType;
  title?: string;
};

const UniversalChat: React.FC<UniversalChatProps> = ({ issueId, userId, role, title }) => {
  const router = useRouter();

  const [comments, setComments] = useState<ChatMessage[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Коммент татах (хуудсаар)
  const fetchComments = async (_page = 1, concat = false) => {
    try {
      if (_page === 1) setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/api/issues/${issueId}/comments?page=${_page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ChatMessage[] = await res.json();

      if (concat) {
        setComments((prev) => [...data, ...prev]);
      } else {
        setComments(data);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      if (_page === 1) setComments([]);
    } finally {
      if (_page === 1) setLoading(false);
    }
  };

  // Хамгийн сүүлийн comment-уудыг татах (refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchComments(1, false);
    setRefreshing(false);
  };

  // Дээш шивэхэд хуучин comment-уудыг татах
  const onEndReached = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  // Шинэ comment илгээх
  const sendComment = async () => {
    if (!commentInput.trim() || !userId) return;
    setSending(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      await fetch(`${BASE_URL}/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentInput,
          user_type: role,
          user_id: userId,
        }),
      });
      setCommentInput('');
      onRefresh();
    } catch (error) {
      console.error('Send comment error:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line
  }, [issueId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8faff' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
    >
      {/* Header */}
      <View style={[styles.headerWrapper, { paddingTop: SAFE_TOP }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={24} color="#294478" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || (role === 'engineer' ? 'Асуудал чат' : 'Шийдэл чат')}</Text>
          <View style={{ width: 38 }} />
        </View>
      </View>

      {/* FlatList Chat */}
      <FlatList
        data={comments}
        inverted
        keyExtractor={(item, idx) => (item.id || idx).toString()}
        renderItem={({ item }) => {
          const isMe = item.user_id === userId;
          // Инженерийн мессежийг онцолж харуулах
          const isEngineerMsg = item.user_type === 'engineer';
          return (
            <View
              style={[
                styles.chatBubble,
                isMe ? styles.myMessage : styles.otherMessage
              ]}
            >
              {/* Зөвхөн бусдын зургыг харуулах */}
              {!isMe && (
                <Image source={{ uri: getAvatarUrl(item) }} style={styles.avatar} />
              )}
              <View>
                <Text style={{
                  color: isEngineerMsg ? '#297bb8' : '#6576bb',
                  fontWeight: isEngineerMsg ? 'bold' : '600',
                  fontSize: 13,
                  marginBottom: 2
                }}>
                  {getUserName(item)}
                </Text>
                <Text style={[
                  styles.chatText,
                  isEngineerMsg && { backgroundColor: '#297bb8' }
                ]}>{item.content}</Text>
                <Text style={styles.chatDate}>{formatDate(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.01}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#294478" /> : null}
        contentContainerStyle={styles.chatScroll}
      />

      {/* Input bar */}
      <View style={styles.inputBarContainer}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusBtn}>
            <Feather name="plus" size={22} color="#2F487F" />
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder={role === 'engineer' ? 'Шийдлийн талаар бичих...' : 'Add a comment...'}
            placeholderTextColor="#B6BBC7"
            returnKeyType="send"
            onSubmitEditing={sendComment}
            editable={!sending}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendComment} disabled={sending}>
            <Feather name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UniversalChat;

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6F1',
    paddingBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.03,
  },
  chatScroll: { flexGrow: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 20 },
  chatBubble: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  myMessage: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  otherMessage: { alignSelf: 'flex-start' },
  chatText: {
    backgroundColor: '#2F487F',
    color: '#fff',
    borderRadius: 14,
    fontSize: 16,
    padding: 14,
    paddingHorizontal: 22,
    marginBottom: 2,
    maxWidth: screenWidth * 0.66,
  },
  chatDate: { color: '#e1e7f5', fontSize: 11, marginTop: 2, textAlign: 'right', marginLeft: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, marginBottom: -6, backgroundColor: '#e5eaff' },
  inputBarContainer: {
    backgroundColor: '#f8faff',
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 7,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    marginHorizontal: 13,
    paddingVertical: 2,
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  plusBtn: { marginRight: 2 },
  chatInput: {
    flex: 1,
    borderRadius: 16,
    borderColor: '#f3f6fc',
    borderWidth: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 7,
    height: 38
  },
  sendBtn: {
    backgroundColor: '#2F487F',
    borderRadius: 13,
    padding: 8,
    alignItems: 'center'
  }
});
