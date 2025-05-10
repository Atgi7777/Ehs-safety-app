import React from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Dimensions
} from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

type StatisticsProps = {
  trainingCount: number;
  inquiryCount: number;
};

const Statistics: React.FC<StatisticsProps> = ({ trainingCount, inquiryCount }) => {
  const [fontsLoaded] = useFonts({
    'AlumniSans-Bold': require('../../../assets/fonts/AlumniSans-Regular.ttf'),
  });

  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
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
      </View>

      <TouchableOpacity style={styles.statItem} onPress={() => router.push('/Employee/Tab/ReportScreen')}>
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
    top: 35,
    right: 10,
  },
});

export default Statistics;
