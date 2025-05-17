import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, FlatList,
  Dimensions, TouchableOpacity, Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_IMAGE_URL = BASE_URL.replace(/\/api$/, '/');
const screenWidth = Dimensions.get('window').width;

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    fetchIssueDetail();
  }, []);

  const fetchIssueDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIssue(data);
    } catch (error) {
      console.error('Issue дэлгэрэнгүй татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const statusColors = {
    pending: { color: '#988100', bg: '#FFF6CC', label: 'Хүлээгдэж байна', icon: 'time-outline' },
    in_progress: { color: '#007CC3', bg: '#D4F0FF', label: 'Засвар хийж байна', icon: 'hammer-outline' },
    resolved: { color: '#269A43', bg: '#D6F9D0', label: 'Шийдэгдсэн', icon: 'checkmark-done-outline' },
    default: { color: '#666', bg: '#E0E0E0', label: 'Тодорхойгүй', icon: 'help-outline' },
  } as const;

  type StatusKey = keyof typeof statusColors;
  const statusData =
    statusColors[(issue?.status as StatusKey) || 'default'] || statusColors.default;

  // Header
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
        <Ionicons name="arrow-back" size={26} color="#2F487F" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        Асуудал дэлгэрэнгүй
      </Text>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={() => router.push(`/Engineer/Issue/ChatScreen?id=${id}`)}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={25} color="#2F487F" />
      </TouchableOpacity>
    </View>
  );

  // Modal for image preview
  const ImageModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable style={styles.modalBg} onPress={() => setModalVisible(false)}>
        <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
      </Pressable>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Header />
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.centered}>
        <Header />
        <Text>Асуудал олдсонгүй.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
      <Header />
      <ImageModal />

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
        {/* Title */}
        <Text style={styles.title}>{issue.title}</Text>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#E74C3C" />
          <Text style={styles.dateText}> {formatDate(issue.created_at)}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusData.bg }]}>
            <Ionicons name={statusData.icon} size={16} color={statusData.color} style={{ marginRight: 5 }} />
            <Text style={[styles.statusText, { color: statusData.color }]}>{statusData.label}</Text>
          </View>
        </View>

        {/* Images */}
        {issue.images && issue.images.length > 0 && (
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={styles.label}>Хавсралт зургууд:</Text>
            <FlatList
              data={issue.images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={img => img.id.toString()}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => {
                let uri = item.image_url;
                if (!/^https?:\/\//.test(uri)) {
                  uri = BASE_IMAGE_URL.replace(/\/$/, "") + "/" + uri.replace(/^\/+/, "");
                }
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setModalImage(uri);
                      setModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.issueImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.imageSkeleton} />
              }
            />
          </View>
        )}

        {/* Main Fields */}
        <View style={styles.infoBox}>
          <InfoRow icon="location-outline" label="Байршил" value={issue.location || 'Тодорхойгүй'} />
          <InfoRow icon="git-branch-outline" label="Учир шалтгаан" value={issue.cause || 'Тодорхойгүй'} />
          <InfoRow icon="person-circle-outline" label="Мэдээлсэн ажилтан"
            value={issue.reporter?.name || issue.reporter_id || 'Тодорхойгүй'}
          />
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.label}>Тайлбар:</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// InfoRow helper
function InfoRow({ icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBg}>
        <Ionicons name={icon} size={17} color="#5A6EDB" />
      </View>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    paddingHorizontal: 14,
    backgroundColor: '#F6F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6F1',
    zIndex: 10,
    shadowColor: '#4d6fe4',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    marginTop: 50,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    marginHorizontal: 1,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 19,
    color: '#1d2445',
    letterSpacing: 0.05,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F8FF' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#294478',
    marginBottom: 12,
    letterSpacing: 0.03,
    textShadowColor: '#e3eaff',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 15, color: '#E74C3C', marginLeft: 4, fontWeight: '600', marginRight: 7 },
  statusPill: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginLeft: 10,
    minWidth: 125,
    shadowColor: '#a6c9ff',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 2,
  },
  statusText: { fontWeight: '700', fontSize: 14 },
  infoBox: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#9cb4ec',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 3,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  infoIconBg: {
    backgroundColor: '#eff2fe',
    borderRadius: 16,
    padding: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: '#555',
    fontWeight: '700',
    minWidth: 82,
    fontSize: 15,
    marginRight: 2,
  },
  infoValue: {
    color: '#223',
    fontWeight: '500',
    fontSize: 15,
    flexShrink: 1,
    flexWrap: 'wrap',
    flex: 1,
  },
  label: { fontWeight: '700', marginBottom: 2, fontSize: 15, color: '#374151', marginLeft: 2 },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 15,
    marginTop: 16,
    shadowColor: '#b2b9dd',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  description: {
    fontSize: 15.5,
    color: '#2d3756',
    lineHeight: 22,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.03,
  },
  issueImage: {
    width: screenWidth * 0.38,
    height: 95,
    borderRadius: 11,
    marginRight: 12,
    backgroundColor: '#eaeaea',
    borderWidth: 1,
    borderColor: '#f6f8ff',
  },
  imageSkeleton: {
    width: screenWidth * 0.38,
    height: 95,
    borderRadius: 11,
    backgroundColor: '#f2f3f6',
    marginRight: 12,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.93)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalImage: {
    width: screenWidth * 0.94,
    height: screenWidth * 0.94,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#fff'
  },
});
