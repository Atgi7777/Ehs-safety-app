import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/EmployeeComponents/Header'; 
import DateFilter from '../../../app/components/DateFilter'; // Огнооны сонгогч нэмсэн гэж бодлоо
import TaskList from '../../components/EmployeeComponents/EmployeeTaskList'; // Зааварчилгааны жагсаалт

const ReportScreen = () => {
  const tasks = [
    { number: '001', date: '2023.3.31' },
    { number: '001', date: '2023.3.31' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зааварчилгаа</Text>
       
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Date Filter хэсэг */}
        <Text style={styles.dateTitle}>Огноо</Text>
        <View style={styles.dateFilterContainer}>
        
          <DateFilter />
        </View>

        {/* Task list хэсэг */}
        <View style={styles.section}>

          <TaskList tasks={tasks} />
        </View>
      </ScrollView>
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
