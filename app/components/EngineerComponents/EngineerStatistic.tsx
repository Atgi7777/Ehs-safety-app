import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
      {/* Сургалт блок (дараагүй) */}
      <View style={styles.statItem}>
        <View style={styles.topRightIcon}>
          <Ionicons name="chevron-forward-outline" size={40} color="#B0B0B0" />
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

      {/* Асуудал блок (дарахад route хийнэ) */}
      <TouchableOpacity style={styles.statItem} onPress={() => router.push('/Engineer/Tabs/ReportScreen')}>
        <View style={styles.topRightIcon}>
          <Ionicons name="chevron-forward-outline" size={40} color="#B0B0B0" />
        </View>
        <View style={styles.iconRow}>
          <Image 
            source={require('../../../assets/images/info.png')} 
            style={styles.logo2} 
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
    marginBottom: 20,
    padding: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  logo2: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  statItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 120,
    paddingLeft: 10,
    borderRadius: 12,
    alignItems: 'flex-start',
    position: 'relative', // ← icon байрлуулахад хэрэгтэй
  },
  statNumber: {
    fontSize: 30,
    fontFamily: 'AlumniSans-Bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 26,
    fontFamily: 'AlumniSans-Bold',
    color: '#000000',
  },
  topRightIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    marginTop: 20,
  },
});

export default Statistics;
