import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const BASE_URL = 'http://localhost:5050';

type Group = {
  id: number;
  name: string;
  profile?: { image?: string };
};

type Section = {
  title: string;
  data: Group[];
};

export default function InstructionGroupSelectScreen() {
  const { instructionId } = useLocalSearchParams();
  const router = useRouter();

  const [sharedGroups, setSharedGroups] = useState<Group[]>([]);
  const [unsharedGroups, setUnsharedGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedGroups = async (): Promise<number[]> => {
    try {
      const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/shared-groups`);
      return Array.isArray(res.data.groupIds) ? res.data.groupIds : [];
    } catch (err) {
      console.error('Илгээгдсэн бүлэг татах алдаа:', err);
      return [];
    }
  };

  const fetchGroups = async (sharedIds: number[]) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${BASE_URL}/api/safety-engineer/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allGroups: Group[] = res.data;
      setSharedGroups(allGroups.filter((g) => sharedIds.includes(g.id)));
      setUnsharedGroups(allGroups.filter((g) => !sharedIds.includes(g.id)));
    } catch (err) {
      console.error('Бүлгийн жагсаалт татах алдаа:', err);
      Alert.alert('Алдаа', 'Бүлгүүдийг татаж чадсангүй');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const sharedIds = await fetchSharedGroups();
      await fetchGroups(sharedIds);
    };
    init();
  }, []);

  const toggleGroupSelection = (groupId: number) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSend = async () => {
    if (selectedGroupIds.length === 0) {
      Alert.alert('Анхааруулга', 'Хамгийн багадаа 1 бүлэг сонгоно уу');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`${BASE_URL}/api/instruction/${instructionId}/share-to-group`, {
        groupIds: selectedGroupIds,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Амжилттай', 'Зааварчилгаа амжилттай илгээгдлээ');
      router.replace('/Engineer/Tabs/EngineerScreen');
    } catch (err) {
      console.error('Илгээх алдаа:', err);
      Alert.alert('Алдаа', 'Илгээхэд алдаа гарлаа');
    }
  };

  const handleUnshare = async (groupId: number) => {
    Alert.alert('Баталгаажуулах', 'Энэ бүлгээс зааварчилгааг хасах уу?', [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Тийм', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${BASE_URL}/api/instruction/${instructionId}/unshare-group/${groupId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setSharedGroups(prev => prev.filter((g) => g.id !== groupId));
            const removed = sharedGroups.find((g) => g.id === groupId);
            if (removed) setUnsharedGroups(prev => [...prev, removed]);

            Alert.alert('Амжилттай', 'Бүлэг хасагдлаа');
          } catch (err) {
            console.error('Хасахад алдаа:', err);
            Alert.alert('Алдаа', 'Хасах үед алдаа гарлаа');
          }
        }
      },
    ]);
  };

  const sections: Section[] = [
    { title: 'Илгээгдсэн бүлгүүд', data: sharedGroups },
    { title: 'Илгээгээгүй бүлгүүд', data: unsharedGroups },
  ];

  const renderItem = ({ item }: { item: Group }) => {
    const isSelected = selectedGroupIds.includes(item.id);
    const isShared = sharedGroups.some((g) => g.id === item.id);

    return (
      <View style={[styles.groupItem, isSelected && styles.selectedItem]}>
        <Image
          source={item.profile?.image ? { uri: `${BASE_URL}${item.profile.image}` } : require('@/assets/images/add-group.png')}
          style={styles.groupImage}
        />
        <Text style={styles.groupName}>{item.name}</Text>
        {isShared ? (
          <TouchableOpacity onPress={() => handleUnshare(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#2F487F" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => toggleGroupSelection(item.id)}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isSelected ? '#2F487F' : '#2F487F'}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionLabel}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#2F487F" />
        </TouchableOpacity>
        <Text style={styles.title}>Бүлэг сонгоно уу</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2F487F" />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Илгээх ({selectedGroupIds.length})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF', paddingHorizontal: 16, paddingTop: 70 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#2F487F' },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#2F487F', marginTop: 16, marginBottom: 8 },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  selectedItem: {
    borderColor: '#2F487F',
    borderWidth: 2,
    backgroundColor: '#E8EEFF',
  },
  groupImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#2F487F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});
