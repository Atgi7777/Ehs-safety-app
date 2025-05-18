import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator
} from 'react-native';
import Header from '../../components/EmployeeComponents/Header';
import StatisticsContainer from '../../components/EmployeeComponents/EmployeeStatistics';
import GroupListScreen from '../../components/EmployeeComponents/GroupListScreen';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../src/config';
import { useNavigation } from '@react-navigation/native';

const EmployeeScreen = () => {
  const [organizationName, setOrganizationName] = useState<string>(''); // Байгууллагын нэр
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
const navigation = useNavigation();

  // 1. Байгууллагын нэр авах
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(`${BASE_URL}/api/employee/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganizationName(res.data.organization?.name || '');
      } catch (error) {
        console.error('Ажилтны профайл татахад алдаа:', error);
      }
    };
    fetchEmployeeProfile();
  }, []);

  // 2. UserId авах
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const idString = await AsyncStorage.getItem('userId');
        if (idString) setUserId(Number(idString));
      } catch (e) {
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.orgBox}>
        <Ionicons name="business-outline" size={20} color="#2F487F" />
        <Text style={styles.orgName}>
          {organizationName || 'Байгууллага'}
        </Text>
      </View>
      <View style={styles.content}>
        {userId ? (
          <StatisticsContainer id={userId} />
        ) : (
          <Text>Хэрэглэгч олдсонгүй.</Text>
        )}
  <GroupListScreen navigation={navigation} />
      </View>
    </View>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 25,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orgName: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: '600',
    color: '#2F487F',
  },
});
