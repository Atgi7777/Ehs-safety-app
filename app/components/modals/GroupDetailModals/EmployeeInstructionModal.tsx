import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Modalize } from 'react-native-modalize';

export type EmployeeInstructionModalRef = {
  open: (employee: any) => void;
};

type EmployeeInstructionModalProps = {};

const EmployeeInstructionModal = forwardRef<EmployeeInstructionModalRef, EmployeeInstructionModalProps>((props, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [employee, setEmployee] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    open: (employeeData: any) => {
      setEmployee(employeeData);
      modalRef.current?.open();
    },
  }));

  if (!employee) return null;

  return (
    <Modalize ref={modalRef} snapPoint={700} modalHeight={700}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={() => modalRef.current?.close()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{employee.name} - Зааварчилгаа</Text>

        <ScrollView style={{ marginTop: 20 }}>
          {/* Энд зааварчилгаа жагсаалт оруулах */}
          <Text style={styles.instructionItem}>✅ Ажлын хувцас өмсөх</Text>
          <Text style={styles.instructionItem}>✅ Хамгаалалтын малгай өмсөх</Text>
          <Text style={styles.instructionItem}>✅ Бээлий хэрэглэж ажиллах</Text>
          <Text style={styles.instructionItem}>✅ Аюулгүй ажиллагааны дүрэм мөрдөх</Text>
          <Text style={styles.instructionItem}>✅ Шат ашиглахдаа 2 гараараа барих</Text>
          {/* Хүсвэл олон заавар нэмээрэй */}
        </ScrollView>
      </View>
    </Modalize>
  );
});

export default EmployeeInstructionModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20 },
  cancelText: { color: '#2F487F', alignSelf: 'flex-start' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  instructionItem: { fontSize: 16, marginVertical: 8 },
});
