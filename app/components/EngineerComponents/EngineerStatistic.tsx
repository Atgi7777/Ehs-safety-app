import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Dimensions
} from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../src/config';

const { width } = Dimensions.get('window');

const Statistics: React.FC = () => {
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [inquiryCount, setInquiryCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [fontsLoaded] = useFonts({
    'AlumniSans-Bold': require('../../../assets/fonts/AlumniSans-Regular.ttf'),
  });

  const router = useRouter();

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        // 1. Хэрэглэгчийн ID-г авч сургалтын тоогоо авна
        const idStr = await AsyncStorage.getItem('userId');
        if (!idStr) throw new Error('userId not found');
        const userId = Number(idStr);

        const tRes = await fetch(`${BASE_URL}/api/safety-trainings/count/created-by/${userId}`);
        const tData = await tRes.json();
        setTrainingCount(tData.count ?? 0);

        // 2. Байгууллагын ID-г авч inquiry/issue-ийн тоогоо авна
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) throw new Error('user not found');
        const user = JSON.parse(userJson);
        const organizationId = user.organization_id;
        const iRes = await fetch(`${BASE_URL}/api/count/org/${organizationId}`);
        const iData = await iRes.json();
        setInquiryCount(iData.count ?? 0);

      } catch (e) {
        setTrainingCount(0);
        setInquiryCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.statsContainer}>
      {/* Сургалт */}
      <TouchableOpacity style={styles.statItem} onPress={() => router.push('/Engineer/Tabs/InstructionScreen')}>
        <View style={styles.topRightIcon}>
          <Ionicons name="chevron-forward-outline" size={30} color="#B0B0B0" />
        </View>
        <View style={styles.iconRow}>
          <Image
            source={require('../../../assets/images/graduation-cap.png')}
            style={styles.logo}
          />
          <Text style={styles.statNumber}>{trainingCount}</Text>
        </View>
        <Text style={styles.statLabel}>Сургалт</Text>
      </TouchableOpacity>

      {/* Асуудал */}
      <TouchableOpacity style={styles.statItem} onPress={() => router.push('/Engineer/Tabs/ReportScreen')}>
        <View style={styles.topRightIcon}>
          <Ionicons name="chevron-forward-outline" size={30} color="#B0B0B0" />
        </View>
        <View style={styles.iconRow}>
          <Image
            source={require('../../../assets/images/info.png')}
            style={styles.logo}
          />
          <Text style={styles.statNumber}>{inquiryCount}</Text>
        </View>
        <Text style={styles.statLabel}>Асуудал</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: width * 0.07,
    height: width * 0.07,
    marginRight: 8,
    resizeMode: 'contain',
  },
  statItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    width: '48%',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
  },
  statNumber: {
    fontSize: width * 0.08,
    fontFamily: 'AlumniSans-Bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: width * 0.07,
    fontFamily: 'AlumniSans-Bold',
    color: '#000000',
  },
  topRightIcon: {
    position: 'absolute',
    top: 45,
    right: 10,
  },
});

export default Statistics;
