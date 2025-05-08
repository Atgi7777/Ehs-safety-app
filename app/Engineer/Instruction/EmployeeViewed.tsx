import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BASE_URL = 'http://localhost:5050';

const hardcodedEmployees = [
  {
    id: 1,
    name: 'Батмөнх',
    email: 'batmunkh@example.com',
    viewed_at: '2025-05-05T10:00:00Z',
    profile: {
      image: '/uploads/batmunkh.jpg',
    },
  },
  {
    id: 2,
    name: 'Сараа',
    email: 'saraa@example.com',
    viewed_at: '2025-05-06T09:30:00Z',
    profile: null,
  },
  {
    id: 3,
    name: 'Төгөлдөр',
    email: 'tuguldur@example.com',
    viewed_at: '2025-05-07T08:45:00Z',
    profile: {
      image: '/uploads/tuguldur.jpg',
    },
  },
];

const ViewedEmployeesScreen = () => {
  const [employees] = useState(hardcodedEmployees);
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image
        source={
          item.profile?.image
            ? { uri: `${BASE_URL}${item.profile.image}` }
            : require('@/assets/images/user-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>Имэйл: {item.email}</Text>
        <Text style={styles.meta}>
          Үзсэн: {new Date(item.viewed_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
     <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={28} color="#2F487F" />
  </TouchableOpacity>
  <Text style={styles.header}>Үзсэн ажилтнууд</Text>
  <View style={{ width: 28 }} /> {/* spacer for header alignment */}
</View>

 

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default ViewedEmployeesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
