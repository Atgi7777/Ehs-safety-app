import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../src/config';
import { useRouter } from 'expo-router';
export default function GroupListScreen({ navigation }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(`${BASE_URL}/api/employee/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (error) {
        console.error('Бүлгүүдийг татахад алдаа:', error);
      }
    };
    fetchGroups();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/Employee/Group/GroupDetailScreen?groupId=${item.id}`)}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image source={{ uri: `${BASE_URL}${item.image}` }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
        <Text style={styles.subtext}>{item.members} гишүүн</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Харьяалагдах бүлгүүд</Text>
      <FlatList 
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 120,  // flex: 1 болон height устгасан
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#2F487F',
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarPlaceholder: {
    backgroundColor: '#2F487F',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  subtext: {
    color: '#6c757d',
    marginTop: 6,
    fontSize: 14,
  },
});
