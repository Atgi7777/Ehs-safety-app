import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import EmployeeInstructionModal, { EmployeeInstructionModalRef } from '@/app/components/modals/EmployeeInstructionModal'; // 🛠 зөв импорт

export type EmployeeDetailModalRef = {
  open: (employee: any) => void;
};

type EmployeeDetailModalProps = {};

const EmployeeDetailModal = forwardRef<EmployeeDetailModalRef, EmployeeDetailModalProps>((props, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [employee, setEmployee] = useState<any>(null);

  const instructionModalRef = useRef<EmployeeInstructionModalRef>(null); // 🛠 заавар modal ref

  useImperativeHandle(ref, () => ({
    open: (employeeData: any) => {
      setEmployee(employeeData);
      modalRef.current?.open();
    },
  }));

  const openInstructionModal = () => {
    if (employee) {
      instructionModalRef.current?.open(employee);
    }
  };

  if (!employee) return null;

  return (
    <>
      <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => modalRef.current?.close()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Ажилтны мэдээлэл</Text>

          <Image source={employee.avatar} style={styles.avatar} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Нэр:</Text>
            <Text style={styles.value}>{employee.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Нас:</Text>
            <Text style={styles.value}>{employee.age}</Text>
          </View>

          <Text style={styles.position}>Албан тушаал: {employee.position}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Gmail:</Text>
            <Text style={styles.value}>{employee.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Утас:</Text>
            <Text style={styles.value}>{employee.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Гэрийн хаяг:</Text>
            <Text style={styles.value}>{employee.address}</Text>
          </View>

          <TouchableOpacity style={styles.instructionButton} onPress={openInstructionModal}>
            <Text style={styles.instructionButtonText}>Зааварчилгаа хөтлөлт</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Бүлгээс хасах</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      {/* Instruction Modal дуудаж өгнө */}
      <EmployeeInstructionModal ref={instructionModalRef} />
    </>
  );
});

export default EmployeeDetailModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20 },
  cancelText: { color: '#2F487F', alignSelf: 'flex-start' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginVertical: 10 },
  infoRow: { flexDirection: 'row', marginVertical: 5 },
  label: { fontWeight: 'bold', marginRight: 5 },
  value: { flexShrink: 1 },
  position: { marginVertical: 10 },
  instructionButton: { borderWidth: 1, borderColor: '#2F487F', padding: 12, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  instructionButtonText: { color: '#2F487F', fontWeight: 'bold' },
  removeButton: { backgroundColor: '#2F487F', padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  removeButtonText: { color: 'white', fontWeight: 'bold' },
});
