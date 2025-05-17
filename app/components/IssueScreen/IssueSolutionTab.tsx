import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
  Image, RefreshControl, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { BASE_URL } from '../../../src/config';

const screenWidth = Dimensions.get('window').width;
const SOCKET_URL = 'http://192.168.174.160:5050';

export type UserType = 'engineer' | 'employee';
export type IssueCommentUser = {
  name: string;
  profile?: { image?: string; };
};
export type IssueComment = {
  id: number;
  content: string;
  user_type: UserType;
  user: IssueCommentUser | null;
  created_at: string;
};
type IssueSolutionTabProps = {
  id: string | number;
  title?: string;
  user: {
    id: number;
    type: UserType;
    name: string;
  };
};

const getProfileImage = (user: IssueCommentUser | null) => {
  const img = user?.profile?.image;
  if (!img) return null;
  return img.startsWith('http')
    ? img
    : `${BASE_URL.replace('/api', '')}/uploads/${img}`;
};

const IssueSolutionTab: React.FC<IssueSolutionTabProps> = ({ id, title, user }) => {
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 30;
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  // SOCKET
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('joinIssue', id);
    socketRef.current.on('receiveComment', (comment: IssueComment) => {
      setComments(prev => [comment, ...prev]);
    });
    return () => { socketRef.current?.disconnect(); };
  }, [id]);

  // COMMENTS API
  const fetchComments = useCallback(async (reset = false) => {
    try {
      if (reset) setPage(1);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(
        `${BASE_URL}/api/issues/${id}/comments?limit=${PAGE_SIZE}&page=${reset ? 1 : page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data: IssueComment[] = await res.json();
      // Шинэ ирсэн comment-уудыг хамгийн доод талд харуулахын тулд ORDER REVERSE хийнэ
      setComments(prev =>
        reset ? data.reverse() : [...prev, ...data.reverse()]
      );
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      if (reset) setComments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, page]);

  useEffect(() => { fetchComments(true); }, [fetchComments]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComments(true);
  }, [fetchComments]);

  // Дээш гүйлгэхэд loadMore
  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    setPage(prev => prev + 1);
    await fetchComments();
    setLoading(false);
  };

  // Send
  const sendComment = async () => {
    if (!commentInput.trim() || sending) return;
    setSending(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      await fetch(`${BASE_URL}/api/issues/${id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentInput,
          user_type: user?.type,
          user_id: user?.id,
        })
      });
      setCommentInput('');
      fetchComments(true);
    } catch (e) {
      fetchComments(true);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d: string) => d?.slice(0, 16).replace('T', ' ') || '';

  // RENDER
  const renderMessage = ({ item, index }: { item: IssueComment; index: number; }) => {
    const isEmployee = item.user_type === 'engineer';
    const avatarImg = getProfileImage(item.user);
    return (
      <View
        key={item.id || index}
        style={[
          styles.messageRow,
          isEmployee ? styles.leftRow : styles.rightRow
        ]}
      >
        {isEmployee &&
          <View style={styles.avatarBox}>
            {avatarImg
              ? <Image source={{ uri: avatarImg }} style={styles.avatarImg} />
              : <View style={styles.avatarLetter}><Text>{item.user?.name[0]}</Text></View>
            }
          </View>
        }
        <View>
          <Text style={[styles.msgName, { color: '#294478' }]}>{item.user?.name}</Text>
          <View style={styles.msgBubble}>
            <Text style={styles.msgText}>{item.content}</Text>
          </View>
          <Text style={styles.msgDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8faff' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
    >
      <Text style={styles.issueTitle}>{title || `Асуудал #${id}`}</Text>
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        inverted={true} // Гол тохиргоо!
        contentContainerStyle={styles.chatScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#294478"
            colors={['#294478']}
          />
        }
        ListEmptyComponent={() =>
          loading
            ? <ActivityIndicator size="small" color="#294478" style={{ marginTop: 16 }} />
            : <Text style={{ color: '#bbb', alignSelf: 'center', marginTop: 20 }}>Одоогоор мессеж алга</Text>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading && comments.length > 0 ? <ActivityIndicator size="small" color="#294478" /> : null}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputBarContainer}>
        <View style={styles.inputBar}>
          <Feather name="plus" size={22} color="#B6BBC7" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.chatInput}
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Шийдийн талааp бичих..."
            placeholderTextColor="#B6BBC7"
            returnKeyType="send"
            onSubmitEditing={sendComment}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendComment} disabled={sending}>
            <Feather name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default IssueSolutionTab;





const AVATAR_SIZE = 38;
const styles = StyleSheet.create({
  issueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#294478',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  chatScroll: { flexGrow: 1, justifyContent: 'flex-end', padding: 14, paddingBottom: 20 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    maxWidth: '90%',
  },
  leftRow: { alignSelf: 'flex-start' },
  rightRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatarBox: {
    marginRight: 9,
    marginBottom: -4,
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#c7daff',
    borderWidth: 1.5,
    borderColor: '#e4e8f2'
  },
  avatarLetter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#d4e0f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgName: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 4,
  },
  msgBubble: {
    backgroundColor: '#2F487F',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 2,
    maxWidth: screenWidth * 0.66,
  },
  msgText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  msgDate: {
    color: '#b9bfd0',
    fontSize: 13,
    marginLeft: 5,
    marginTop: 2,
  },
  inputBarContainer: {
    backgroundColor: '#f8faff',
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingTop: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#fff',
    marginHorizontal: 13,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  chatInput: {
    flex: 1,
    borderRadius: 18,
    borderColor: '#f3f6fc',
    borderWidth: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 16,
    fontSize: 16,
    marginLeft: 9,
    marginRight: 7,
    height: 42,
    color: "#233154"
  },
  sendBtn: {
    backgroundColor: '#2F487F',
    borderRadius: 17,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  }
});
