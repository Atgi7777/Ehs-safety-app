import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

import { BASE_URL } from '../../../src/config';

const { width } = Dimensions.get('window');

type StatisticsProps = {
  trainingCount: number;
  inquiryCount: number;
};
const Statistics: React.FC<StatisticsProps> = ({ trainingCount, inquiryCount }) => {
  const router = useRouter();
  return (
    <View style={styles.statsContainer}>
      {/* Сургалт */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => router.push('/Employee/Training/UpcomingTrainings')}
        activeOpacity={0.8}
      >
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
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => router.push('/Employee/Tab/ReportScreen')}
        activeOpacity={0.8}
      >
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

const StatisticsContainer: React.FC<{ id: number }> = ({ id }) => {
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [inquiryCount, setInquiryCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [fontsLoaded] = useFonts({
    'AlumniSans-Regular': require('../../../assets/fonts/AlumniSans-Regular.ttf'),
  });

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // 1. Сургалтын тоо
      const res1 = await fetch(`${BASE_URL}/api/safety-trainings/count/org-by-employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data1 = await res1.json();
      setTrainingCount(data1.count || 0);

      // 2. Асуудлын тоо
      const res2 = await fetch(`${BASE_URL}/api/count/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data2 = await res2.json();
      setInquiryCount(data2.count || 0);

    } catch (e) {
      setTrainingCount(0);
      setInquiryCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Statistics trainingCount={trainingCount} inquiryCount={inquiryCount} />
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
  },
  statNumber: {
    fontSize: width * 0.08,
    fontFamily: 'AlumniSans-Regular',
    color: '#000000',
  },
  statLabel: {
    fontSize: width * 0.07,
    fontFamily: 'AlumniSans-Regular',
    color: '#000000',
  },
  topRightIcon: {
    position: 'absolute',
    top: 35,
    right: 10,
  },
});

export default StatisticsContainer;
