import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { BASE_URL } from '../../../src/config';

const InstructionListScreen = () => {
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isGroupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId !== null) {
      fetchInstructions(selectedGroupId);
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token олдсонгүй');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/employee/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroups(response.data);
      if (response.data.length > 0) {
        setSelectedGroupId(response.data[0].id);
      }
    } catch (error) {
      console.error('Бүлгүүдийг татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructions = async (groupId: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token олдсонгүй');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/group/${groupId}/instructions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredData = response.data.filter((item: any) => {
        if (!item) return false;
        const itemStart = item.start_date ? new Date(item.start_date) : null;
        const itemEnd = item.end_date ? new Date(item.end_date) : null;
        if (!itemStart || !itemEnd) return false;

        // Сонгосон интервалд багтаж байгааг шалгана
        return itemStart <= toDate && itemEnd >= fromDate;
      });

      setInstructions(filteredData);
    } catch (error) {
      console.error('Зааварчилгааг татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (instruction: any) => {
    setSelectedInstruction(instruction);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setSelectedInstruction(null);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>Бүлэг сонгох:</Text>
            <TouchableOpacity style={styles.groupSelectButton} onPress={() => setGroupModalVisible(true)}>
              <Text style={styles.groupSelectButtonText}>
                {groups.find((g) => g.id === selectedGroupId)?.name || 'Бүлэг сонгоно уу'}
              </Text>
              <Ionicons name="chevron-down" size={22} color="#2F487F" />
            </TouchableOpacity>

            <View style={styles.dateRangeSelector}>
              <TouchableOpacity onPress={() => setFromDatePickerVisibility(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>Эхлэх: {format(fromDate, 'yyyy.MM.dd')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setToDatePickerVisibility(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>Дуусах: {format(toDate, 'yyyy.MM.dd')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => {
                  if (selectedGroupId) fetchInstructions(selectedGroupId);
                }}
              >
                <Text style={styles.searchButtonText}>Шүүх</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Зааварчилгаа</Text>
          </View>
        }
        renderItem={({ item }) => (
          item ? (
            <View style={styles.instructionBlock}>
              <View style={styles.topRow}>
                <Text style={styles.subTitle}>Дугаар: {item.number}</Text>
                <TouchableOpacity onPress={() => openDetail(item)}>
                  <Text style={styles.viewAllText}>Дэлгэрэнгүй</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusWrapper}>
                  <Ionicons name="checkbox-outline" size={18} color="#2F5AA8" />
                  <Text style={styles.statusText}>{item.status === 'active' ? 'Идэвхтэй' : 'Архивлагдсан'}</Text>
                </View>
                <Text style={styles.instructionDate}>{item.start_date?.split('T')[0]}</Text>
              </View>
              <Text style={styles.instructionTitle}>{item.title}</Text>
            </View>
          ) : null
        )}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#2F487F" /> : <Text style={{ padding: 20 }}>Зааварчилгаа байхгүй</Text>}
      />

      {/* Group сонгох Modal */}
      <Modal isVisible={isGroupModalVisible} onBackdropPress={() => setGroupModalVisible(false)}>
        <View style={styles.groupModal}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupItem}
              onPress={() => {
                setSelectedGroupId(group.id);
                setGroupModalVisible(false);
              }}
            >
              <Text style={styles.groupName}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Instruction дэлгэрэнгүй Modal */}
      <Modal isVisible={isModalVisible} onBackdropPress={closeDetail} style={styles.modal}>
        <View style={styles.modalContent}>
          {selectedInstruction ? (
            <>
              <Text style={styles.modalTitle}>{selectedInstruction.title}</Text>
              <View style={styles.infoRow}><Text style={styles.label}>Дугаар:</Text><Text style={styles.value}>{selectedInstruction.number}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>Эхлэх огноо:</Text><Text style={styles.value}>{selectedInstruction.start_date?.split('T')[0]}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>Дуусах огноо:</Text><Text style={styles.value}>{selectedInstruction.end_date?.split('T')[0]}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>Төлөв:</Text><Text style={styles.value}>{selectedInstruction.status === 'active' ? 'Идэвхтэй' : 'Архивлагдсан'}</Text></View>
              <Text style={styles.sectionLabel}>Тайлбар:</Text>
              <Text style={styles.commentBox}>{selectedInstruction.description}</Text>
              <TouchableOpacity style={styles.instructionButton} onPress={() => {closeDetail();router.push({pathname: '/Employee/Instruction/InstructionSlideScreen',params: { instructionId: selectedInstruction.id , groupId: selectedGroupId },});}}>
                <Text style={styles.instructionButtonText}>Дэлгэрэнгүй үзэх</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color="#2F487F" />
          )}
        </View>
      </Modal>

      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={isFromDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setFromDate(date);
          setFromDatePickerVisibility(false);
        }}
        onCancel={() => setFromDatePickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isToDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setToDate(date);
          setToDatePickerVisibility(false);
        }}
        onCancel={() => setToDatePickerVisibility(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100 },
  container: { padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '400', marginBottom: 10, color: '#2F487F' },
  groupSelectButton: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, justifyContent: 'space-between', marginBottom: 16 },
  groupSelectButtonText: { fontSize: 16, color: '#2F487F' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 6, borderBottomWidth: 1, borderColor: '#e0e0e0', marginBottom: 6 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statusWrapper: { flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 6, color: '#2F5AA8', fontWeight: '500' },
  instructionDate: { color: '#C0392B', fontSize: 13 },
  instructionTitle: { fontSize: 15, fontWeight: '500' },
  subTitle: { fontSize: 14, fontWeight: '500' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#333' },
  value: { fontSize: 14, color: '#555' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#2F487F' },
  commentBox: { fontSize: 14, color: '#333', marginBottom: 12 },
  instructionButton: { backgroundColor: '#2F487F', padding: 12, borderRadius: 8, alignItems: 'center' },
  instructionButtonText: { color: '#fff', fontWeight: '600' },
  dateRangeSelector: { 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  marginBottom: 16,
  gap: 10,
},
dateButtonRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
},
dateButton: { 
  paddingVertical: 10, 
  paddingHorizontal: 20, 
  backgroundColor: '#fff', 
  borderRadius: 30, 
  borderColor: '#2F487F', 
  borderWidth: 1,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},
dateText: { fontSize: 16, color: '#2F487F', fontWeight: '600' },
searchButton: { 
  marginTop: 10,
  paddingVertical: 12, 
  paddingHorizontal: 32, 
  backgroundColor: '#2F487F', 
  borderRadius: 30,
  elevation: 3,
},
searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

groupModal: { 
  backgroundColor: '#fff', 
  borderRadius: 12, 
  padding: 20, 
  elevation: 5,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 5,
},
groupItem: { 
  paddingVertical: 14, 
  borderBottomWidth: 1, 
  borderBottomColor: '#eee',
},
groupName: { fontSize: 17, color: '#2F487F', fontWeight: '600' },

instructionBlock: { 
  backgroundColor: '#fff', 
  padding: 16, 
  borderRadius: 16, 
  marginHorizontal: 10, 
  marginBottom: 18,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 6,
},

viewAllText: { color: '#2F487F', fontSize: 14, fontWeight: '700' },

});

export default InstructionListScreen;
