import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';

export type PhoneNumberModalRef = {
  open: () => void;
};

type PhoneAddModalProps = {};

const PhoneAddModal = forwardRef<PhoneNumberModalRef, PhoneAddModalProps>((props, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current?.open();
      setPhoneNumber(''); // Нээхэд оролт цэвэрлэх
    },
  }));

  const handleAdd = () => {
    if (phoneNumber.length !== 8) {
      Alert.alert('Алдаа', 'Утасны дугаар 8 оронтой байх ёстой!');
      return;
    }

    // Амжилттай нэмэгдлээ
    Alert.alert('Амжилттай', `Утасны дугаар нэмэгдлээ: ${phoneNumber}`);
    modalRef.current?.close();
  };

  return (
    <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
      <View style={styles.modalContent}>
        
        {/* Cancel товч */}
        <TouchableOpacity style={styles.cancelContainer} onPress={() => modalRef.current?.close()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Гарчиг */}
        <Text style={styles.title}>Утасны дугаараар нэмэх</Text>

        {/* Утасны дугаарын input */}
        <TextInput
          style={styles.phoneInput}
          placeholder="Утасны дугаар оруулна уу"
          value={phoneNumber}
          onChangeText={(text) => {
            const cleanText = text.replace(/[^0-9]/g, ''); // зөвхөн тоо
            setPhoneNumber(cleanText.slice(0, 8)); // 8 оронтой болгоно
          }}
          keyboardType="numeric"
          maxLength={8}
        />

        {/* Email хаягруу шилжих */}
        <TouchableOpacity>
          <Text style={styles.emailLink}>Email хаяг</Text>
        </TouchableOpacity>

        {/* Нэмэх товч */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Нэмэх</Text>
        </TouchableOpacity>

      </View>
    </Modalize>
  );
});

export default PhoneAddModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20, alignItems: 'center', backgroundColor: '#fff', minHeight: '100%' },
  cancelContainer: { alignSelf: 'flex-start' },
  cancelText: { color: '#2F487F', fontSize: 16, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  phoneInput: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  emailLink: { color: '#2F487F', textDecorationLine: 'underline', marginBottom: 20 },
  addButton: { backgroundColor: '#2F487F', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
