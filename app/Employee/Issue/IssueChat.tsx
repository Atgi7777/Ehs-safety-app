import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../../../src/config';

const screenWidth = Dimensions.get('window').width;
const SAFE_TOP = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 16;

const IssueChat = () => {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // comments fetch
  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/api/issues/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComments(data);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // comment send
  const sendComment = async () => {
    if (!commentInput.trim()) return;
    setSending(true);
    const token = await AsyncStorage.getItem('userToken');
    await fetch(`${BASE_URL}/api/issues/${id}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentInput,
        user_type: 'engineer', // employee эсвэл engineer, хэрэгцээнээсээ ав
      })
    });
    setCommentInput('');
    setSending(false);
    fetchComments();
  };

  useEffect(() => { fetchComments(); }, [id]);

  const formatDate = (d: string) => d?.slice(0, 16).replace('T', ' ') || '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8faff' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
    >
      {/* --- Header --- */}
      <View style={[styles.headerWrapper, { paddingTop: SAFE_TOP }]}>
        <View style={styles.topBarRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeText}>Хаах</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => router.back()} // EditIssueScreen рүү буцаах
            activeOpacity={0.9}
          >
            <Text style={[styles.tab, styles.tabInactive]}>Дэлгэрэнгүй</Text>
          </TouchableOpacity>
          <View style={[styles.tabBtn, styles.tabActiveBtn]}>
            <Text style={[styles.tab, styles.tabActive]}>Шийдэл</Text>
          </View>
        </View>
      </View>

      {/* --- Title --- */}
      <Text style={styles.issueTitle}>{title || `Issue #${id}`}</Text>

      {/* --- Chat --- */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatScroll}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#294478" />
        ) : (
          comments.length === 0 ?
            <Text style={{ color: '#bbb', alignSelf: 'center', marginTop: 20 }}>Одоогоор мессеж алга</Text>
            :
            comments.map((msg, idx) => (
              <View
                key={msg.id || idx}
                style={[
                  styles.chatBubble,
                  msg.user_type === 'engineer' ? styles.myMessage : styles.otherMessage
                ]}
              >
                {msg.user_type !== 'engineer' && (
                  <Image source={{ uri: msg.avatar || 'https://randomuser.me/api/portraits/men/11.jpg' }} style={styles.avatar} />
                )}
                <View>
                  <Text style={styles.chatText}>{msg.content}</Text>
                  <Text style={styles.chatDate}>{formatDate(msg.created_at)}</Text>
                </View>
              </View>
            ))
        )}
      </ScrollView>

      {/* --- Input bar --- */}
      <View style={styles.inputBarContainer}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusBtn}>
            <Feather name="plus" size={22} color="#2F487F" />
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Add a comment...."
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

export default IssueChat;

// --- STYLES ---
const CARD_RADIUS = 18;
const styles = StyleSheet.create({
  // Header
  headerWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 18,
    marginBottom: 1,
    marginTop: 0,
  },
  closeText: {
    color: '#294478',
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: 0.2,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f6f8ff',
    borderRadius: CARD_RADIUS,
    padding: 3,
    marginHorizontal: 12,
    marginTop: 2,
    marginBottom: 1,
    alignSelf: 'stretch',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: CARD_RADIUS - 4,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  tabActiveBtn: {
    backgroundColor: '#fff',
    shadowColor: '#294478',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  tab: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.04,
    textAlign: 'center',
    color: '#294478',
  },
  tabInactive: {
    color: '#294478',
    fontWeight: '600',
  },
  tabActive: {
    color: '#294478',
    fontWeight: '700',
  },
  // Issue Title
  issueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#294478',
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center'
  },
  // Chat
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
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, marginBottom: -6 },
  // Input bar
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
