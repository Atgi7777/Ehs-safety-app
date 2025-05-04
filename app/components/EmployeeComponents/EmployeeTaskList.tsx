import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal'; // Заавал суусан байх хэрэгтэй
import { useRouter } from 'expo-router';



const InstructionListScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const openDetail = () => {
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
  };
  

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Зааварчилгаа</Text>

        {/* Demo */}
        <View style={styles.instructionBlock}>
          <View style={styles.topRow}>
            <Text style={styles.subTitle}>Зааварчилгааны дугаар: 001</Text>
            <TouchableOpacity onPress={openDetail}>
              <Text style={{ color: '#2F487F', fontSize: 13 }}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusWrapper}>
              <Ionicons name="checkbox-outline" size={18} color="#2F5AA8" />
              <Text style={styles.statusText}>Идэвхитэй</Text>
            </View>
            <Text style={styles.instructionDate}>2023.3.31</Text>
          </View>

          <Text style={styles.instructionTitle}>
            Бетон зуурмаг цутгах аюулгүйн ажиллагааны зааварчилгаа
          </Text>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeDetail}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Дугаар: 0001</Text>
            <TouchableOpacity onPress={closeDetail}>
  <Text style={{ color: '#2F487F', fontWeight: 'bold' }}>Done</Text>
</TouchableOpacity>

          </View>

          <Text style={{ marginBottom: 8 }}>Үүсгэсэн: Ariunaa Tuguldur</Text>

          <TouchableOpacity
  style={styles.instructionButton}
  onPress={() => {
    closeDetail(); // эхлээд modal-ийг хаана
    router.push('/Employee/Instruction/InstructionSlideScreen'); // дараа нь шинэ дэлгэц рүү шилжинэ
  }}
>
  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
    Бетон зуурмаг цутгах аюулгүйн ажиллагааны зааварчилгаа
  </Text>
</TouchableOpacity>



          <View style={styles.commentBox}>
            <Text style={{ fontSize: 13 }}>
              Тайлбар: Энэ ажлыг 7 хоногийн турш гүйцэтгэж, аюулгүй ажиллагааг бүрэн хангана
            </Text>
          </View>

          <Text style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
            By Ariunaa on 2024.10.02 at 2:19
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5FE',
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionBlock: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 6,
  },
  subTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#2F5AA8',
    fontSize: 14,
    marginLeft: 4,
  },
  instructionDate: {
    color: '#C0392B',
    fontSize: 14,
  },
  instructionTitle: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F487F',
  },
  instructionButton: {
    backgroundColor: '#2F487F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  commentBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
});

export default InstructionListScreen;
