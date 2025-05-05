import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

const BASE_URL = Platform.OS === 'ios' ? 'http://localhost:5050' : 'http://10.0.2.2:5050';

const Header = () => {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get(`${BASE_URL}/api/safety-engineer/me`, config);
        const avatar = res.data.avatar ? `${BASE_URL}${res.data.avatar}` : null;
        setProfile({ ...res.data, avatar });
      } catch (err) {
        console.error('ХАБ инженерийн профайл татахад алдаа:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePress = () => {
    router.push('/Engineer/Tabs/ProfileScreen'); // ← Энэ нь tab доторх профайл руу шилжинэ
  };
  const handleHomePress = () => {
    router.push('/Engineer/Tabs/EngineerScreen');
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
      <TouchableOpacity onPress={handleHomePress}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Ionicons name="notifications-outline" size={30} color="#2F487F" style={{ marginRight: 10 }} />
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={
              profile?.avatar
                ? { uri: profile.avatar }
                : require('../../../assets/images/user-avatar.png')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
   
  
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  spacer: {
    flex: 1,
  },
});

export default Header;
