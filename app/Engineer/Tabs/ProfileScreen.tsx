import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '@/app/components/EngineerComponents/Header';

const BASE_URL =  'http://localhost:5050' ;

const ProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get(`${BASE_URL}/api/safety-engineer/me`, config);
        const avatar = res.data.avatar ? `${BASE_URL}${res.data.avatar}` : null;
        setProfile({ ...res.data, avatar });
      } catch (err) {
        console.error('Профайл татахад алдаа:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    router.push('/Engineer/Profile/ProfileEditScreen');
  };

  const handleLogout = async () => {
    Alert.alert('Системээс гарах уу?', '', [
      { text: 'Цуцлах', style: 'cancel' },
      {
        text: 'Тийм',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace('/LoginScreen');
          } catch (error) {
            console.error('Logout алдаа:', error);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#EFF5FF' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2F487F" />
            </TouchableOpacity>


        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={
              profile?.avatar
                ? { uri: profile.avatar }
                : require('@/assets/images/user-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || '—'}</Text>
          <Text style={styles.role}>ХАБЭА инженер</Text>
          <Text style={styles.company}>{profile?.organization?.name || '—'}</Text>
          <Text style={styles.date}>
            Ажилд орсон огноо:{' '}
            {profile?.assigned_at
              ? new Date(profile.assigned_at).toLocaleDateString('mn-MN')
              : '—'} 
           </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Ionicons name="checkbox-outline" size={24} color="#2F487F" />
            <Text style={styles.cardValue}>120</Text>
            <Text style={styles.cardLabel}>Өгсөн зааварчилгааны тоо</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="school-outline" size={24} color="#2F487F" />
            <Text style={styles.cardValue}>6</Text>
            <Text style={styles.cardLabel}>Хамрагдсан сургалт</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="people-outline" size={24} color="#2F487F" />
            <Text style={styles.cardValue}>120</Text>
            <Text style={styles.cardLabel}>Нийт ажилчид</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="alert-circle-outline" size={24} color="#2F487F" />
            <Text style={styles.cardValue}>5</Text>
            <Text style={styles.cardLabel}>Бүртгэсэн зөрчил осол</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.createButton} onPress={handleEditProfile}>
          <Text style={styles.createButtonText}>Мэдээлэл засах</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Системээс гарах</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="reader-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="shirt-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="book-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-circle-outline" size={24} color="#2F487F" />
          <Text style={{ color: '#2F487F', fontSize: 12 }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    color: '#555',
  },
  company: {
    fontSize: 16,
    color: '#777',
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#2F487F',
  },
  cardLabel: {
    fontSize: 13,
    textAlign: 'center',
    color: '#555',
  },
  createButton: {
    backgroundColor: '#2F487F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#2F487F',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#2F487F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2F487F',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
  },
});
