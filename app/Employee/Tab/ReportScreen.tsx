import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import Header from '../../components/EmployeeComponents/Header';
import EmployeeIssueListScreen from '../../components/EmployeeComponents/EmployeeIssueListScreen';

const ReportScreen = () => {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Bold': require('../../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }
 
  return (
    <View style={styles.container}>
      <Header />

      {/* 🆕 Ажлын байрны осол, зөрчил гарчиг */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Ажлын байрны осол, зөрчил</Text>
      </View>

      <EmployeeIssueListScreen />
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
    fontWeight: 500,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
