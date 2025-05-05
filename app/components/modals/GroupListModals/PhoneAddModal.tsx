import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = Platform.OS === 'ios' ? 'http://localhost:5050' : 'http://10.0.2.2:5050';

export type PhoneNumberModalRef = {
  open: (groupId: number) => void;
};

const PhoneAddModal = forwardRef<PhoneNumberModalRef>((_, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [groupId, setGroupId] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    open: (id: number) => {
      setGroupId(id);
      setPhoneNumber('');
      modalRef.current?.open();
    },
  }));

  const handleAdd = async () => {
    if (!groupId) return Alert.alert('Алдаа', 'Group ID олдсонгүй');
    if (phoneNumber.length !== 8) return Alert.alert('Алдаа', 'Утасны дугаар 8 оронтой байх ёстой!');
    
    console.log('📦 Group ID:', groupId);
    console.log('📦 Full URL:', `${BASE_URL}/api/safety-engineer/group/${groupId}/add-by-phone`);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return Alert.alert('Алдаа', 'Token олдсонгүй');

      await axios.post(
        `${BASE_URL}/api/safety-engineer/group/${groupId}/add-by-phone`,
        { phone: phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Амжилттай', 'Ажилтан амжилттай нэмэгдлээ');
      modalRef.current?.close();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Алдаа', err.response?.data?.message || 'Серверийн алдаа');
    }

  };

  return (
    <Modalize ref={modalRef} snapPoint={820} modalHeight={820}>
      <View style={styles.modalContent}>
        {/* Буцах товч */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => modalRef.current?.close()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#2F487F" />
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Ionicons name="call-outline" size={28} color="#2F487F" />
        </View>

        <Text style={styles.title}>Утасны дугаараар ажилтан нэмэх</Text>

        <TextInput
          style={styles.phoneInput}
          placeholder="Ажилтны дугаар оруулна уу"
          value={phoneNumber}
          onChangeText={(text) =>
            setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 8))
          }
          keyboardType="numeric"
          maxLength={8}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Нэмэх</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default PhoneAddModal;

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  iconBox: {
    backgroundColor: '#E3EAF8',
    borderRadius: 50,
    padding: 14,
    marginBottom: 10,
    marginTop: 50, // буцах товчны зайг нөхөх
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2F487F',
    textAlign: 'center',
    marginBottom: 24,
  },
  phoneInput: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F4F9',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
    borderColor: '#DCE4F2',
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: '#2F487F',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
