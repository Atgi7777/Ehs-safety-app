import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'; // ✅ Text импорт нэмсэн
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '@/app/components/EngineerComponents/Header';
import IssueListScreen from '@/app/components/EngineerComponents/IssueListScreen';

const ReportScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Ажлын байрны осол, зөрчил</Text>
      </View>
      <IssueListScreen />
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#EFF5FF',
  },
  sectionHeaderText: {
    fontSize: 20,
    color: '#2F487F',
    textAlign: 'center',
    fontWeight: '500', // ✅ string болгоно!
  },
});
