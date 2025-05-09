import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';


import { BASE_URL } from '../../../../src/config';
export type EmailAddModalRef = {
  open: (groupId: number) => void;
};

const EmailAddModal = forwardRef<EmailAddModalRef>((_, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [email, setEmail] = useState('');
  const [groupId, setGroupId] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    open: (id: number) => {
      setGroupId(id);
      setEmail('');
      modalRef.current?.open();
    },
  }));

  const handleAdd = async () => {
    if (!groupId) return Alert.alert('Алдаа', 'Group ID байхгүй байна.');
    if (!email || !email.includes('@')) return Alert.alert('Алдаа', 'Зөв имэйл хаяг оруулна уу.');

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return Alert.alert('Алдаа', 'Token олдсонгүй');

      await axios.post(
        `${BASE_URL}/api/group/group/${groupId}/add-by-email`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Амжилттай', 'Ажилтан амжилттай нэмэгдлээ!');
      modalRef.current?.close();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Алдаа', err.response?.data?.message || 'Серверийн алдаа');
    }
  };

  return (
    <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
      <View style={styles.modalContent}>
        {/* Буцах товч */}
        <TouchableOpacity style={styles.backButton} onPress={() => modalRef.current?.close()}>
          <Ionicons name="arrow-back" size={24} color="#2F487F" />
          
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Ionicons name="mail-outline" size={28} color="#2F487F" />
        </View>
        <Text style={styles.title}>Имэйл хаягаар ажилтан нэмэх</Text>
        <TextInput
          style={styles.input}
          placeholder="Имэйл хаяг"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Нэмэх</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default EmailAddModal;

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: '#2F487F',
    fontSize: 16,
    marginLeft: 6,
  },
  iconBox: {
    backgroundColor: '#E3EAF8',
    borderRadius: 50,
    padding: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#2F487F',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F4F9',
    textAlign: 'center',
    fontSize: 14,
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
    fontWeight: '400',
    fontSize: 16,
  },
});
