import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/EmployeeComponents/Header'; 
import EmployeeIssueListScreen from '../../components/EmployeeComponents/EmployeeIssueListScreen';
const ReportScreen = () => {
 

  return (
    <View style={styles.container}>
     
      <Header />
    
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#EFF5FF',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F487F',
    position: 'absolute', // 🔥
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  
  scrollContent: {
    paddingHorizontal: 16,
  },
  dateFilterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});
