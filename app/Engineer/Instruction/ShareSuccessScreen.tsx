import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const BASE_URL = 'http://localhost:5050';

export default function InstructionGroupSelectScreen() {
  const { instructionId } = useLocalSearchParams();
  const router = useRouter();

  const [sharedGroupIds, setSharedGroupIds] = useState<number[]>([]);
  const [sharedGroups, setSharedGroups] = useState<any[]>([]);
  const [unsharedGroups, setUnsharedGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // ✴️ Fetch shared group IDs
  const fetchSharedGroups = async (): Promise<number[]> => {
    try {
      const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/shared-groups`);
      return Array.isArray(res.data.groupIds) ? res.data.groupIds : [];
    } catch (err) {
      console.error('Илгээгдсэн бүлэг татах алдаа:', err);
      return [];
    }
  };

  // ✴️ Fetch all groups and split
  const fetchGroups = async (sharedIds: number[]) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${BASE_URL}/api/safety-engineer/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allGroups = res.data;
      const shared = allGroups.filter((g: any) => sharedIds.includes(g.id));
      const unshared = allGroups.filter((g: any) => !sharedIds.includes(g.id));

      setSharedGroupIds(sharedIds);
      setSharedGroups(shared);
      setUnsharedGroups(unshared);
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

  const renderItem = ({ item }: any) => {
    const isSelected = selectedGroupIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.groupItem, isSelected && styles.selectedItem]}
        onPress={() => toggleGroupSelection(item.id)}
      >
        <Image
          source={item.profile?.image ? { uri: `${BASE_URL}${item.profile.image}` } : require('@/assets/images/add-group.png')}
          style={styles.groupImage}
        />
        <Text style={styles.groupName}>{item.name}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#2F487F" />
        )}
      </TouchableOpacity>
    );
  };

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
        <>
          {sharedGroups.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Илгээгдсэн бүлгүүд</Text>
              <FlatList
                data={sharedGroups}
                renderItem={({ item }) => (
                  <View style={[styles.groupItem, { backgroundColor: '#f0f0f0' }]}>
                    <Image
                      source={item.profile?.image ? { uri: `${BASE_URL}${item.profile.image}` } : require('@/assets/images/add-group.png')}
                      style={styles.groupImage}
                    />
                    <Text style={styles.groupName}>{item.name}</Text>
                    <Ionicons name="checkmark-done-circle" size={24} color="gray" />
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </>
          )}
          <Text style={styles.sectionLabel}>Илгээгээгүй бүлгүүд</Text>
          <FlatList
            data={unsharedGroups}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
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
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
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
