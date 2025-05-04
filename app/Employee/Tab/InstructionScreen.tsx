import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/EmployeeComponents/Header';
import TaskList from '../../components/EmployeeComponents/EmployeeTaskList';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  number: string;
  date: string;
}
interface EmployeeTaskListProps {
  tasks: Task[];
}

const EmployeeScreen: React.FC<EmployeeTaskListProps> = ({ tasks }) => {


// const EmployeeScreen: React.FC = () => {
//   const [tasks, setTasks] = useState<Task[]>([
//     { number: '001', date: '2023.3.31' }
//   ]);

  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const handleDownloadReport = () => {
    // Энд тайлан татах логик бичих эсвэл Alert гаргаж болно
    Alert.alert('Тайлан татах', 'Тайлан амжилттай татагдлаа!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWithButton}>
        <Header />
        <TouchableOpacity style={styles.reportButton} onPress={handleDownloadReport}>
          <Ionicons name="download-outline" size={24} color="#2F487F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Сонгосон огноо + Сумнууд */}
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

        <TaskList/>
      </ScrollView>

      {/* Огноо сонгох */}
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
  headerWithButton: {
    position: 'relative',
  },
  reportButton: {
    position: 'absolute',
    top: 140, // Header-ийн дээр тааруулах
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 70,
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
