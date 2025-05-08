import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/EngineerComponents/Header';

const BASE_URL = 'http://localhost:5050';

const AddInstructionScreen = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [instructionNumber, setInstructionNumber] = useState('');
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handlePickDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setCreatedDate(selectedDate);
  };

  const handlePickEndDate = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!title || !instructionNumber || !description || !createdDate || !endDate) {
      return Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү.');
    }
  
    // ✅ Дугаар талбарт зөвхөн тоо оруулсан эсэхийг шалгана
    const number = parseInt(instructionNumber, 10);
    if (isNaN(number)) {
      return Alert.alert('Анхааруулга', 'Зааварчилгааны дугаар талбарт зөвхөн тоо оруулна уу.');
    }
  
    if (new Date(endDate) < new Date(createdDate)) {
      return Alert.alert('Огнооны алдаа', 'Дуусах огноо нь эхлэхээс өмнө байж болохгүй.');
    }
  
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('TOKEN:', token);
  
      const payload = {
        title,
        number,
        description,
        start_date: createdDate?.toISOString(),
        end_date: endDate?.toISOString(),
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const res = await axios.post(
        `${BASE_URL}/api/safety-engineer/creat-instruction`,
        payload,
        config
      );
  
      if (res.status === 201) {
        const instructionId = res.data.id;
        router.push({
          pathname: '/Engineer/Instruction/AddInstructionDetail',
          params: { instructionId: instructionId.toString() },
        });
      } else {
        Alert.alert('Алдаа', 'Хадгалах үед алдаа гарлаа.');
      }
    } catch (err) {
      console.error('Хүсэлт амжилтгүй:', err);
      Alert.alert('Алдаа', 'Сервертэй холбогдож чадсангүй.');
    }
  };
  

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2F487F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Зааварчилгаа үүсгэх</Text>
        </View>

        {/* Title */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Гарчиг</Text>
          <TextInput
            style={styles.input}
            placeholder="Гарчиг оруулах"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Number */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Дугаар</Text>
          <TextInput
            style={styles.input}
            placeholder="Дугаар оруулах"
            value={instructionNumber}
            onChangeText={setInstructionNumber}
            keyboardType="numeric"
          />
        </View>

        {/* Created Date */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Эхлэх огноо</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectButtonText}>
              {createdDate ? format(createdDate, 'yyyy.MM.dd') : 'Сонгох'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={createdDate || new Date()}
              onChange={handlePickDate}
            />
          )}
        </View>

        {/* End Date */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Дуусах огноо</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.selectButtonText}>
              {endDate ? format(endDate, 'yyyy.MM.dd') : 'Сонгох'}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              mode="date"
              value={endDate || new Date()}
              onChange={handlePickEndDate}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Тайлбар</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Тайлбар оруулах"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Хадгалах</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddInstructionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F487F',
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  selectButton: {
    backgroundColor: '#2F487F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2F487F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
