import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';

const InstructionListScreen = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [instructionsByGroup, setInstructionsByGroup] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      fetchAllInstructions();
    }
  }, [groups, selectedDate]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('Token олдсонгүй');

      const response = await axios.get(`${BASE_URL}/api/employee/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroups(response.data);
    } catch (error) {
      console.error('Бүлэг татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInstructions = async () => {
    try {
      setRefreshing(true);
      setInstructionsByGroup({});
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('Token олдсонгүй');

      let tempInstructions: any = {};

      await Promise.all(
        groups.map(async (group: any) => {
          const res = await axios.get(`${BASE_URL}/api/group/${group.id}/instructions`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const filtered = res.data.filter((item: any) => {
            if (!item) return false;
            const start = item.start_date ? new Date(item.start_date) : null;
            const end = item.end_date ? new Date(item.end_date) : null;
            if (!start || !end) return false;
            return selectedDate >= start && selectedDate <= end;
          }).map((item: any) => ({
            ...item,
            group_id: group.id,
          }));

          tempInstructions[group.name] = filtered;
        })
      );

      setInstructionsByGroup(tempInstructions);
    } catch (error) {
      console.error('Зааварчилгаа татахад алдаа:', error);
    } finally {
      setRefreshing(false);
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

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'yyyy.MM.dd');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllInstructions} />}
      >
        <View style={styles.headerWrapper}>
          <TouchableOpacity 
            onPress={() => router.push('/Employee/Instruction/InstructionHistoryScreen')} 
            style={styles.historyButton}
          >
            <Text style={styles.historyButtonText}>Зааварчилгаа хөтлөлт</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousDay}>
              <Ionicons name="chevron-back-outline" size={28} color="#2F487F" />
            </TouchableOpacity>

            <Text style={styles.headerDate}>{format(selectedDate, 'yyyy.MM.dd')}</Text>

            <TouchableOpacity onPress={goToNextDay}>
              <Ionicons name="chevron-forward-outline" size={28} color="#2F487F" />
            </TouchableOpacity>
          </View>
        </View>

        {refreshing ? (
          <ActivityIndicator size="large" color="#2F487F" style={{ marginTop: 50 }} />
        ) : (
          <>
            {Object.values(instructionsByGroup).flat().length === 0 ? (
              <View style={styles.noInstructionContainer}>
                <Text style={styles.noInstructionText}>Зааварчилгаа олдсонгүй</Text>
              </View>
            ) : (
              Object.keys(instructionsByGroup).map((groupName) => (
                instructionsByGroup[groupName].length > 0 && (
                  <View key={groupName} style={styles.groupSection}>
                    <View style={styles.groupTitleWrapper}>
                      <Text style={styles.groupTitle}>{groupName}</Text>
                    </View>

                  {instructionsByGroup[groupName].map((ins: any) => (
  <TouchableOpacity
    key={ins.id}
    style={styles.instructionCard}
    activeOpacity={0.8}
    onPress={() => openDetail(ins)}
  >
    {/* Дээд талын мөр: Зааварчилгааны дугаар */}
    <View style={styles.topRow}>
      <Text style={styles.cardNumber}>Зааварчилгааны дугаар: {ins.number.toString().padStart(3, '0')}</Text>
      <Text style={styles.viewAll}>View all</Text>
    </View>

    {/* Статус ба Огноо */}
    <View style={styles.middleRow}>
      <View style={styles.statusContainer}>
        <Ionicons name="checkbox-outline" size={18} color="#2F487F" />
        <Text style={styles.statusText}>Идэвхтэй</Text>
      </View>
      <Text style={styles.dateText}>{format(ins.start_date, 'yyyy.M.d')}</Text>
    </View>

    {/* Зааварчилгааны нэр */}
    <Text style={styles.titleText}>{ins.title}</Text>
  </TouchableOpacity>
))}

                  </View>
                )
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Modal дэлгэрэнгүй */}
      <Modal isVisible={isModalVisible} onBackdropPress={closeDetail}>
        <View style={styles.modalContent}>
          {selectedInstruction ? (
            <>
              <Text style={styles.modalTitle}>{selectedInstruction.title}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Дугаар:</Text>
                <Text style={styles.value}>{selectedInstruction.number}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Эхлэх огноо:</Text>
                <Text style={styles.value}>{formatDate(selectedInstruction.start_date)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Дуусах огноо:</Text>
                <Text style={styles.value}>{formatDate(selectedInstruction.end_date)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Төлөв:</Text>
                <Text style={styles.value}>{selectedInstruction.status === 'active' ? 'Идэвхтэй' : 'Архивлагдсан'}</Text>
              </View>

              <Text style={styles.sectionLabel}>Тайлбар:</Text>
              <Text style={styles.commentBox}>{selectedInstruction.description}</Text>

              <TouchableOpacity
                style={styles.instructionButton}
                onPress={() => {
                  closeDetail();
                  router.push({
                    pathname: '/Employee/Instruction/InstructionSlideScreen',
                    params: { instructionId: selectedInstruction.id, groupId: selectedInstruction.group_id },
                  });
                }}
              >
                <Text style={styles.instructionButtonText}>Дэлгэрэнгүй үзэх</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color="#2F487F" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { marginTop: 20, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 12 },
  headerDate: { fontSize: 20, fontWeight: '700', color: '#2F487F' },
  historyButton: { backgroundColor: '#2F487F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-end', marginTop: 12 },
  historyButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  noInstructionContainer: { marginTop: 50, alignItems: 'center' },
  noInstructionText: { fontSize: 16, color: '#999999', fontWeight: '600' },

  groupSection: { marginBottom: 24 },
  groupTitleWrapper: { backgroundColor: '#fff', padding: 8, marginHorizontal: 46, marginBottom: 10, borderRadius: 8, alignItems: 'center', shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,},
  groupTitle: { fontSize: 17, fontWeight: '600', color: '#2F487F' },

 instructionCard: {
  backgroundColor: '#fff',
  marginHorizontal: 16,
  marginBottom: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
},

cardNumber: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},

viewAll: {
  fontSize: 14,
  fontWeight: '500',
  color: '#2F487F',
},

middleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
},

statusContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},

statusText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#2F487F',
},

dateText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#C0392B',
},

titleText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#000',
  marginTop: 8,
},

  modalContent: { backgroundColor: '#fff', padding: 20, marginHorizontal: 10, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#2F487F' },
  instructionButton: { marginTop: 20, backgroundColor: '#2F487F', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 30, alignItems: 'center', elevation: 3 },
  instructionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#2F487F' },
  value: { fontSize: 14, color: '#333' },
  sectionLabel: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#2F487F', alignSelf: 'flex-start' },
  commentBox: { fontSize: 14, color: '#555', marginTop: 6, textAlign: 'justify' },
});


export default InstructionListScreen;
