import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { addDays, subMonths } from 'date-fns';

const DateFilter = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const openStartPicker = () => setStartPickerVisible(true);
  const openEndPicker = () => setEndPickerVisible(true);
  const closePicker = () => {
    setStartPickerVisible(false);
    setEndPickerVisible(false);
  };

  const handlePeriodSelect = (period: '7days' | '1month' | '3months') => {
    const today = new Date();
    let newStartDate = new Date();
    if (period === '7days') {
      newStartDate = addDays(today, -7);
    } else if (period === '1month') {
      newStartDate = subMonths(today, 1);
    } else if (period === '3months') {
      newStartDate = subMonths(today, 3);
    }
    setStartDate(newStartDate);
    setEndDate(today);
  };

  return (
    <View style={styles.container}>
      {/* Огнооны сонголт */}
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBox} onPress={openStartPicker}>
          <Ionicons name="calendar-outline" size={25} color="#999" style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>

        <Text style={styles.dash}> - </Text>

        <TouchableOpacity style={styles.dateBox} onPress={openEndPicker}>
          <Ionicons name="calendar-outline" size={20} color="#999" style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {/* 7 хоног, 1 сар, 3 сар товчлуурууд */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.periodButton} onPress={() => handlePeriodSelect('7days')}>
          <Text style={styles.periodText}>7 хоног</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.periodButton} onPress={() => handlePeriodSelect('1month')}>
          <Text style={styles.periodText}>1 сар</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.periodButton} onPress={() => handlePeriodSelect('3months')}>
          <Text style={styles.periodText}>3 сар</Text>
        </TouchableOpacity>
      </View>

      {/* Start Date Picker */}
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={(date) => {
          setStartDate(date);
          closePicker();
        }}
        onCancel={closePicker}
      />

      {/* End Date Picker */}
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={(date) => {
          setEndDate(date);
          closePicker();
        }}
        onCancel={closePicker}
      />
    </View>
  );
};

export default DateFilter;

const styles = StyleSheet.create({
  container: {
    
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 17,
    color: '#333',
  },
  dash: {
    marginHorizontal: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 20,
    color: '#555',
  },
});
