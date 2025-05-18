import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../src/config';

const ProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<{ instructionsCount: number, trainingCount: number }>({
    instructionsCount: 0,
    trainingCount: 0, 
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Профайл татах
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Алдаа', 'Токен олдсонгүй. Та дахин нэвтэрнэ үү.');
          router.replace('/LoginScreen');
          return;
        }
        const res = await axios.get(`${BASE_URL}/api/employee/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err: any) {
        console.error('Профайл татаж чадсангүй:', err);
        Alert.alert(
          'Алдаа',
          err?.response?.status === 403
            ? 'Нэвтрэх эрх дууссан байна. Дахин нэвтэрнэ үү.'
            : 'Мэдээлэл татаж чадсангүй'
        );
        router.replace('/LoginScreen');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Заавар, сургалтын тоо татах
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const res = await axios.get(`${BASE_URL}/api/employee/me-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        // optional: handle error
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Гарах
  const handleLogout = async () => {
    Alert.alert('Системээс гарах', 'Та гарахдаа итгэлтэй байна уу?', [
      { text: 'Цуцлах', style: 'cancel' },
      {
        text: 'Гарах',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken'); // Токен нэрийг шалгаарай!
          router.replace('/LoginScreen');
        },
      },
    ]);
  };

  // Засах
  const handleEdit = () => {
    router.push('/Employee/Profile/ProfileEditScreen');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#2F487F" />
      </TouchableOpacity>

      <Text style={styles.title}>Профайл</Text>

      <View style={styles.card}>
        <Image
          source={
            profile?.profile
              ? { uri: `${BASE_URL}${profile.profile}` }
              : require('@/assets/images/user-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.role}>Ажилтан</Text>
        <Text style={styles.company}>{profile?.organization?.name || '---'}</Text>
        <Text style={styles.date}>
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('mn-MN') : ''} элссэн
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-done-circle" size={28} color="#2F487F" />
          {statsLoading ? (
            <ActivityIndicator size="small" color="#2F487F" />
          ) : (
            <Text style={styles.statNumber}>{stats.instructionsCount}</Text>
          )}
          <Text style={styles.statLabel}>Үзсэн заавар</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="school" size={28} color="#2F487F" />
          {statsLoading ? (
            <ActivityIndicator size="small" color="#2F487F" />
          ) : (
            <Text style={styles.statNumber}>{stats.trainingCount}</Text>
          )}
          <Text style={styles.statLabel}>Сургалт</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editButtonText}>Мэдээлэл засах</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#2F487F" />
        <Text style={styles.logoutButtonText}>Системээс гарах</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FE',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#2F487F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    width: '100%',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2F487F',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F487F',
  },
  role: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  company: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F487F',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#2F487F',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    borderColor: '#2F487F',
    borderWidth: 1.2,
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  logoutButtonText: {
    color: '#2F487F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
