// EmployeeDetailModal.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import EmployeeInstructionModal, { EmployeeInstructionModalRef } from '@/app/components/modals/GroupDetailModals/EmployeeInstructionModal';
import { BASE_URL } from '../../../../src/config'; 


export type EmployeeDetailModalRef = {
  open: (employeeId: number, groupId: number) => void;
};

const EmployeeDetailModal = forwardRef<EmployeeDetailModalRef>((_, ref) => {
  const modalRef = useRef<Modalize>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);

  const instructionModalRef = useRef<EmployeeInstructionModalRef>(null);

  useImperativeHandle(ref, () => ({
    open: async (employeeId: number, groupId: number) => {
      setLoading(true);
      setGroupId(groupId);
      modalRef.current?.open();

      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(`${BASE_URL}/api/group/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(res.data);
      } catch (err) {
        console.error('❌ Ажилтны мэдээлэл татаж чадсангүй:', err );
        

        setEmployee(null);
      } finally {
        setLoading(false);
      }
    },
  }));

  const openInstructionModal = () => {
    if (employee) {
      instructionModalRef.current?.open(employee);
    }
  };

  const handleRemove = async () => {
    if (!employee?.id || !groupId) {
      return Alert.alert('Алдаа', 'Ажилтан болон бүлгийн мэдээлэл бүрэн биш байна.');
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
     
      await axios.delete(`${BASE_URL}/api/group/${groupId}/remove/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Амжилттай', 'Ажилтан бүлгээс хасагдлаа.');
      modalRef.current?.close();
    } catch (err: any) {
      console.error('❌ Хасах алдаа:', err);
      Alert.alert('Алдаа', err.response?.data?.message || 'Бүлгээс хасахад алдаа гарлаа.');
    }
  };

  return (
    <>
      <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => modalRef.current?.close()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Ажилтны мэдээлэл</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2F487F" />
          ) : employee ? (
            <>
              <Image
                source={
                  employee.profile?.image
                    ? { uri: `${BASE_URL}/uploads/${employee.profile.image}` }
                    : require('@/assets/images/user-avatar.png')
                }
                style={styles.avatar}
              />

              <View style={styles.infoRow}>
                <Text style={styles.label}>Нэр:</Text>
                <Text style={styles.value}>{employee.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Нас:</Text>
                <Text style={styles.value}>{employee.age || 'Тодорхойгүй'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Албан тушаал:</Text>
                <Text style={styles.value}>{employee.position || 'Тодорхойгүй'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Имэйл:</Text>
                <Text style={styles.value}>{employee.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Утас:</Text>
                <Text style={styles.value}>{employee.phone}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Хаяг:</Text>
                <Text style={styles.value}>{employee.address || 'Тодорхойгүй'}</Text>
              </View>
                {/* // зааварчилгаа хөтлөлтыг харуулдаг болгоноооо */}
              <TouchableOpacity style={styles.instructionButton} onPress={openInstructionModal}>
                <Text style={styles.instructionButtonText}>Зааварчилгаа хөтлөлт</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <Text style={styles.removeButtonText}>Бүлгээс хасах</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ marginTop: 20, color: '#999' }}>Ажилтны мэдээлэл олдсонгүй.</Text>
          )}
        </View>
      </Modalize>

      <EmployeeInstructionModal ref={instructionModalRef} />
    </>
  );
});

export default EmployeeDetailModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20 },
  cancelText: { color: '#2F487F', alignSelf: 'flex-start' },
  title: { fontSize: 18, fontWeight: '500', marginVertical: 10, textAlign: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginVertical: 10, alignSelf: 'center' },
  infoRow: { flexDirection: 'row', marginVertical: 5 },
  label: { fontWeight: '600', marginRight: 5 },
  value: { flexShrink: 1 },
  instructionButton: {
    borderWidth: 1,
    borderColor: '#2F487F',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  instructionButtonText: { color: '#2F487F', fontWeight: '500' },
  removeButton: {
    backgroundColor: '#2F487F',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: { color: 'white', fontWeight: '500' },
});
