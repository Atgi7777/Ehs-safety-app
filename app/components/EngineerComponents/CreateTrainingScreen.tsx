import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../../../src/config';
// zasnadaa hh 
const CreateTrainingScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!title || !location || !date) {
      Alert.alert('Мэдээлэл дутуу байна', 'Бүх талбарыг бөглөнө үү.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(`${BASE_URL}/api/trainings`, {
        title,
        description,
        location,
        training_date: date.toISOString(),
        duration_hours: Number(duration),
      }, config);

      Alert.alert('Амжилттай', 'Сургалт амжилттай үүслээ.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Алдаа', error?.response?.data?.message || 'Сургалт үүсгэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Сургалт үүсгэх</Text>

      <TextInput
        placeholder="Сургалтын нэр"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Тайлбар"
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        placeholder="Байршил"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: date ? '#222' : '#888' }}>
          {date ? date.toLocaleDateString() : 'Сургалтын огноо'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      <TextInput
        placeholder="Үргэлжлэх хугацаа (цаг)"
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#aaa' }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Уншиж байна...' : 'Үүсгэх'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateTrainingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
