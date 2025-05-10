import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text , Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';

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
        const name = res.data.name;
        setProfile({ ...res.data, avatar, name });
      } catch (err) {
        console.error('ХАБ инженерийн профайл татахад алдаа:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePress = () => {
    router.push('/Engineer/Tabs/ProfileScreen');
  };
  const handleHomePress = () => {
    router.push('/Engineer/Tabs/EngineerScreen');
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        
        <TouchableOpacity onPress={handleHomePress} style={styles.logoContainer}>
  <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
  
</TouchableOpacity>


        
        <View style={styles.spacer} />
        <Ionicons name="notifications-outline" size={27} color="#2F487F" style={{ marginRight: 20 }} />
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
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 0, // ✅ ялгаа
    paddingBottom: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 60,
    marginRight: 8,
  },
  
  spacer: {
    flex: 1,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 50,
  },
});

export default Header;
