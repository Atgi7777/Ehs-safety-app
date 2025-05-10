import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../../../src/config';


const Header = () => {
const [user, setProfile] = useState<{ name: string; avatar: string | null }>({ name: '', avatar: null });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

       const res = await axios.get(`${BASE_URL}/api/employee/me`, config);
     const avatar = res.data.profile ? `${BASE_URL}${res.data.profile}` : '';
const name = res.data.name;
setProfile({ name, avatar: avatar });

      } catch (err) {
        console.error('ХАБ инженерийн профайл татахад алдаа:', err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <Image 
          source={require('../../../assets/images/logo.png')} 
          style={styles.logo} 
        />
        <View style={styles.spacer} />

        <View style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={30} color="#2F487F" style={styles.icon} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </View>

       
        <Image 
          source={user.avatar ? { uri: user.avatar} : require('../../../assets/images/user-avatar.png')} 
          style={styles.avatar} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 37,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    width: 38,
    height: 38,
    borderRadius: 50,
  },
  icon: {
    marginRight: 10,
  },
  notificationContainer: {
    position: 'relative',
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;
