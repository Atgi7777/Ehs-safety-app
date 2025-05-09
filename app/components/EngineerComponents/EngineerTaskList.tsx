import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert , ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../../../src/config'; // ← шинэчлэгдсэн
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const baseFontSize = width * 0.04;

const InstructionListScreen = () => {
  const router = useRouter();
  const [instructions, setInstructions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const [engineerName, setEngineerName] = useState<string>('...');

  const fetchInstructions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('❌ Token байхгүй байна');
        return;
      } 

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${BASE_URL}/api/safety-engineer/instructions`, config);
      setInstructions(res.data);
    } catch (err) {
      console.error('Алдаа:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEngineerName = async (id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/safety-engineer/${id}`);
      const { name } = res.data;
      setEngineerName(name);
    } catch (err) {
      console.error('⚠️ Инженерийн нэр авахад алдаа:', err);
      setEngineerName('Тодорхойгүй');
    }
  };
  const handleEditInstruction = () => {
    closeDetail();
    router.push({
      pathname: '/Engineer/Instruction/EditInstructionScreen',
      params: { instructionId: selectedInstruction.id },
    });
  };
  
  const handleDeleteInstruction = async () => {
    Alert.alert('Баталгаажуулах', 'Та энэ зааварчилгааг устгахдаа итгэлтэй байна уу?', [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Тийм', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${BASE_URL}/api/instruction/${selectedInstruction.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Амжилттай', 'Зааварчилгаа устгагдлаа');
            closeDetail();
            fetchInstructions(); // жагсаалтыг дахин татна
          } catch (err) {
            console.error('Устгах үед алдаа:', err);
            Alert.alert('Алдаа', 'Устгах үед алдаа гарлаа');
            console.log('selectedId' , selectedInstruction.id);
          }
        }
      }
    ]);
  };
  

  const shareToGroup = async (instructionId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('❌ Token байхгүй байна');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.post(`${BASE_URL}/api/instructions/${instructionId}/share-to-group`, {}, config);
    } catch (err) {
      console.error('❌ Бүлэгт илгээхэд алдаа:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInstructions();
  }, []);

  useEffect(() => {
    if (selectedInstruction?.safetyEngineer_id) {
      fetchEngineerName(selectedInstruction.safetyEngineer_id);
    }
  }, [selectedInstruction]);

  const openDetail = (instruction: any) => {
    setSelectedInstruction(instruction);
  };

  const closeDetail = () => {
    setSelectedInstruction(null);
  };

  const handleAddInstruction = () => {
    router.push('/Engineer/Instruction/AddInstructionScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Зааварчилгаа</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#2F487F" />
          ) : instructions.length === 0 ? (
            <Text>Зааварчилгаа олдсонгүй</Text>
          ) : (
            instructions.map((item) => (
              <View key={item.id} style={styles.instructionBlock}>
                <View style={styles.topRow}>
                  <Text style={styles.subTitle}>Зааварчилгааны дугаар: {item.number}</Text>
                  <TouchableOpacity onPress={() => openDetail(item)}>
                    <Text style={{ color: '#2F487F', fontSize: 13 }}>Дэлгэрэнгүй</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statusRow}>
                  <View style={styles.statusWrapper}>
                    <Ionicons name="checkbox-outline" size={18} color="#2F5AA8" />
                    <Text style={styles.statusText}>
                      {item.status === 'active' ? 'Идэвхтэй' : 'Архивлагдсан'}
                    </Text>
                  </View>
                  <Text style={styles.instructionDate}>
                    {item.start_date?.split('T')[0] ?? 'Огноо байхгүй'}
                  </Text>
                </View>

                <Text style={styles.instructionTitle}>{item.title}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddInstruction}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal isVisible={!!selectedInstruction} onBackdropPress={closeDetail} style={styles.modal}>
        <View style={styles.modalContent}>
          {selectedInstruction && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Дугаар: {selectedInstruction.number}</Text>
                <TouchableOpacity onPress={closeDetail}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.createdBy}>Үүсгэгч: {engineerName}</Text>

              <TouchableOpacity style={styles.instructionButton} onPress={() => {
                closeDetail();
                router.push({
                  pathname: '/Engineer/Instruction/InstructionSlideScreen',
                  params: { instructionId: selectedInstruction.id },
                });
              }}>
                <Text style={styles.instructionButtonText}>{selectedInstruction.title}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Тайлбар:</Text>
              <View style={styles.descriptionBox}>
                <Text>{selectedInstruction.description}</Text>
              </View>

              <View style={styles.shareSection}>
                <Text style={styles.shareTitle}>Share and invite</Text>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={async () => {
                    try {
                      closeDetail();
                      router.push({
                        pathname: '/Engineer/Instruction/ShareSuccessScreen',
                        params: { instructionId: selectedInstruction.id },
                      });
                    } catch {
                      alert('⚠️ Илгээхэд алдаа гарлаа.');
                    }
                  }}
                >
                  <Text style={styles.shareButtonText}>Бүлгэт илгээх</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.editRow} onPress={handleEditInstruction}>
  <Ionicons name="pencil-outline" size={18} />
  <Text style={styles.editText}>Зааварчилгаа засах</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.deleteRow} onPress={handleDeleteInstruction}>
  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
  <Text style={styles.deleteText}>Зааварчилгаа устгах</Text>
</TouchableOpacity>


              <Text style={styles.metaText}>
                Үүсгэсэн огноо: By {engineerName} on {new Date(selectedInstruction.createdAt).toLocaleDateString()} at {new Date(selectedInstruction.createdAt).toLocaleTimeString()}
              </Text>
              <Text style={styles.metaText}>
                Засварласан огноо: By {engineerName} on {new Date(selectedInstruction.updatedAt).toLocaleDateString()} at {new Date(selectedInstruction.updatedAt).toLocaleTimeString()}
              </Text>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  

  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2F487F',
  },
  doneButton: {
    fontSize: 16,
    color: '#2F487F',
    fontWeight: '400',
  },
  createdBy: {
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#555',
  },
  instructionButton: {
    backgroundColor: '#2F487F',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  instructionButtonText: {
    color: '#fff',
    fontWeight: '400',
  },
  label: {
    fontWeight: '400',
    marginBottom: 4,
  },
  descriptionBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  shareSection: {
    marginBottom: 16,
  },
  shareTitle: {
    fontWeight: '400',
    marginBottom: 8,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#2F487F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#2F487F',
    fontWeight: '400',
    
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  editText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteText: {
    marginLeft: 8,
    color: '#e74c3c',
    fontWeight: '600',
  },
  metaText: {
    marginTop: 10,
    fontSize: 12,
    color: '#777',
  },
  scrollContent: { paddingBottom: 100 },
  container: { padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '400', marginBottom: 12 },
  instructionBlock: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4, marginBottom: 6, borderBottomWidth: 1, borderColor: '#ddd' },
  subTitle: { fontWeight: '400', fontSize: 14 ,  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusWrapper: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#2F5AA8', fontSize: 14, marginLeft: 4 },
  instructionDate: { color: '#C0392B', fontSize: 14 },
  instructionTitle: { fontSize: 15, lineHeight: 20, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2F487F',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InstructionListScreen;
