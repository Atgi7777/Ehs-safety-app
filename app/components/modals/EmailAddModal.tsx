import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';

export type EmailAddModalRef = {
  open: () => void;

}

type EmailAddModalProps = {};

const EmailAddModal = forwardRef<EmailAddModalRef, EmailAddModalProps>((props, ref ) => {
  const modalRef = useRef<Modalize>(null);
  const [email, setEmail] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => {
      setEmail('');
      modalRef.current?.open();
    },
  }));

  const validateEmail = (email: string) => {
    // Энгийн имэйл шалгалтын regex
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleAddEmail = () => {
    if (!validateEmail(email)) {
      Alert.alert('Алдаа', 'Буруу email хаяг байна!');
      return;
    }

    Alert.alert('Амжилттай', `Email нэмэгдлээ: ${email}`);
    modalRef.current?.close();
  };

  return (
    <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
      <View style={styles.modalContent}>
        {/* Cancel */}
        <TouchableOpacity style={styles.cancelContainer} onPress={() => modalRef.current?.close()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Email хаягаар нэмэх</Text>

        {/* Email Input */}
        <TextInput
          style={styles.emailInput}
          placeholder="mail@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Other Email Link */}
        <TouchableOpacity>
          <Text style={styles.otherEmailLink}>Өөр email хаяг</Text>
        </TouchableOpacity>

        {/* Нэмэх товч */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddEmail}>
          <Text style={styles.addButtonText}>Нэмэх</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default EmailAddModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20, alignItems: 'center', backgroundColor: '#fff', minHeight: '100%' },
  cancelContainer: { alignSelf: 'flex-start' },
  cancelText: { color: '#2F487F', fontSize: 16, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  emailInput: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  otherEmailLink: { color: '#2F487F', textDecorationLine: 'underline', marginBottom: 20 },
  addButton: { backgroundColor: '#2F487F', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
