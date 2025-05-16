import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetail();
  }, []);

  const fetchGroupDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/group/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGroup(data);
    } catch (error) {
      console.error('Group дэлгэрэнгүй татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmployeeItem = ({ item }: any) => (
    <View style={styles.employeeCard}>
      <Ionicons name="person-circle-outline" size={40} color="#2F487F" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.employeeName}>{item.employee.name}</Text>
        <Text style={styles.employeeInfo}>{item.employee.email}</Text>
        <Text style={styles.employeeInfo}>{item.employee.phone}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Бүлэг олдсонгүй.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Group image */}
      {group.profile?.image ? (
        <Image
          source={{ uri: `${BASE_URL}${group.profile.image}` }}
          style={styles.groupImage}
        />
      ) : (
        <View style={styles.groupImagePlaceholder}>
          <Ionicons name="image-outline" size={80} color="#ccc" />
        </View>
      )}

      {/* Group detail */}
      <View style={styles.detailContainer}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupActivity}>🚀 Үйл ажиллагаа: {group.activity}</Text>
        <Text style={styles.groupDescription}>📝 Тайлбар: {group.work_description}</Text>
        <Text style={styles.groupDescription}>📋 Дэлгэрэнгүй: {group.work_detail}</Text>
        <Text style={styles.groupStatus}>
          📌 Төлөв: {group.status === 'active' ? 'Идэвхтэй' : 'Идэвхгүй'}
        </Text>
      </View>

      {/* Members */}
      <Text style={styles.subHeader}>👥 Гишүүд</Text>
      {group.members.length > 0 ? (
        <FlatList
          data={group.members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEmployeeItem}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          scrollEnabled={false}
        />
      ) : (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, color: '#888' }}>Одоогоор гишүүн байхгүй байна.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  groupImage: { width: '100%', height: 200 },
  groupImagePlaceholder: { width: '100%', height: 200, backgroundColor: '#eaeaea', justifyContent: 'center', alignItems: 'center' },
  detailContainer: { padding: 16 },
  groupName: { fontSize: 24, fontWeight: '700', color: '#2F487F', marginBottom: 10 },
  groupActivity: { fontSize: 16, color: '#6c757d', marginBottom: 8 },
  groupDescription: { fontSize: 16, color: '#555', marginBottom: 8 },
  groupStatus: { fontSize: 16, color: '#28a745', marginTop: 8 },
  subHeader: { fontSize: 20, fontWeight: '600', marginLeft: 16, marginTop: 24, marginBottom: 10, color: '#2F487F' },
  employeeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginBottom: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  employeeName: { fontSize: 16, fontWeight: '600', color: '#333' },
  employeeInfo: { fontSize: 13, color: '#777' },
});
