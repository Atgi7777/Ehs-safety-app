import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/EmployeeComponents/Header'; 
import EmployeeHeader from '../../components/EmployeeComponents/EmployeeHeader';
import Statistics from '../../components/EmployeeComponents/EmployeeStatistics';
import TaskList from '../../components/EmployeeComponents/EmployeeTaskList';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const EmployeeScreen = () => {
  const [tasks, setTasks] = useState([
    { number: '001', date: '2023.3.31' }
  ]);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  return (
    <View style={styles.container}>
      <Header />
      <EmployeeHeader groupName="Astra link бүлэг" date={format(selectedDate, 'yyyy.MM.dd')} />

      

      <ScrollView style={styles.content}>
        <Statistics trainingCount={0} inquiryCount={0} />

{/* === Сонгосон огноо + Сумнууд === */}
<View style={styles.dateSelector}>
        <TouchableOpacity onPress={goToPreviousDay}>
          <Ionicons name="chevron-back" size={28} color="#2F487F" />
        </TouchableOpacity>

        <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
          <Text style={styles.dateText}>{format(selectedDate, 'yyyy.MM.dd')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay}>
          <Ionicons name="chevron-forward" size={28} color="#2F487F" />
        </TouchableOpacity>
      </View>



        <TaskList tasks={tasks} />
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    
  },
  dateButton: {
    
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  dateText: {
    fontSize: 18,
    color: '#2F487F',
    fontWeight: 'bold',
  },
});
