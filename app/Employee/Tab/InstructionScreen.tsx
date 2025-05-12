import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/EmployeeComponents/Header';
import TaskList from '../../components/EmployeeComponents/EmployeeTaskList';
import InstructionListScreen from '../../components/EmployeeComponents/EmployeeTaskList';

const EmployeeScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        
        <InstructionListScreen />
      </View>
    </View>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5FE',
  },
  body: {
    flex: 1,
    paddingBottom: 100,
  },
});
