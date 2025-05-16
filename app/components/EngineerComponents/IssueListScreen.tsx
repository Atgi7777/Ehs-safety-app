import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IssueListScreen() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/issues/assigned-to-me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      console.error('Issues татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="warning-outline" size={22} color="#E74C3C" />
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.reporterName}>{item.reporter?.name}</Text>
          <Text style={styles.dateText}>Огноо: {formatDate(item.created_at)}</Text>
        </View>

        <Text style={styles.status}>{renderStatusText(item.status)}</Text>
      </View>
    </View>
  );

  const renderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Хүлээгдэж байна';
      case 'in_progress': return 'Засварлаж байна';
      case 'resolved': return 'Шийдэгдсэн';
      default: return 'Тодорхойгүй';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#2F487F', marginLeft: 8 },
  description: { fontSize: 14, color: '#555', marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reporterName: { fontSize: 14, fontWeight: '600', color: '#333' },
  dateText: { fontSize: 12, color: '#999' },
  status: { fontSize: 14, fontWeight: '600', color: '#2F487F' },
});
