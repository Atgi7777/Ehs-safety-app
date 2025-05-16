import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../src/config';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native'; 
import { useCallback } from 'react';

const EmployeeIssueListScreen = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  useFocusEffect(
  useCallback(() => {
    fetchIssues();
  }, [])
);

  const fetchIssues = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/issues/my-issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setIssues(data);
    } catch (error) {
      console.error('Issue татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string, issueId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/issues/${issueId}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchIssues(); 
      } else {
        const error = await res.json();
        Alert.alert('Алдаа', error.message || 'Төлөв солиход алдаа гарлаа');
      }
    } catch (error) {
      console.error('Төлөв солиход алдаа:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

const renderItem = ({ item }: { item: any }) => {
  const isDropdownOpen = openDropdownId === item.id;
  const statusColor = getStatusColor(item.status);

  return (
   <TouchableOpacity
  activeOpacity={0.8}
  onPress={() => router.push({
    pathname: '/Employee/Issue/IssueDetailScreen',
    params: { id: item.id },   // ✨ ИНГЭЖ ДАМЖУУЛ
  })} 
  style={[styles.card, { zIndex: isDropdownOpen ? 1000 : 0 }]}
>

      <View style={styles.headerRow}>
        <Ionicons name="warning-outline" size={22} color="#2F487F" />
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.bottomRow}>
        <View style={styles.dateRow}>
          <MaterialIcons name="calendar-month" size={18} color="#E74C3C" />
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={{ width: 190 }}>
          <DropDownPicker
            open={isDropdownOpen}
            value={item.status}
            items={[
              { label: 'Хүлээгдэж байна', value: 'pending' },
              { label: 'Засвар хийгдэж байгаа', value: 'in_progress' },
              { label: 'Шийдэгдсэн', value: 'resolved' },
            ]}
            setOpen={(open) => {
              const realOpen = typeof open === 'function' ? open(isDropdownOpen) : open;
              if (realOpen) {
                setOpenDropdownId(item.id);
              } else {
                setOpenDropdownId(null);
              }
            }}
            setValue={() => {}}
            setItems={() => {}}
            onSelectItem={(selectedItem) => {
              handleStatusChange(selectedItem.value, item.id);
            }}
            style={{
              backgroundColor: statusColor.backgroundColor,
              borderColor: 'transparent',
              minHeight: 40,
            }}
            textStyle={{
              color: statusColor.textColor,
              fontWeight: '600',
              fontSize: 14,
            }}
            dropDownContainerStyle={{
              backgroundColor: '#fff',
              borderColor: '#ddd',
              zIndex: 1000, 
            }}
            placeholder="Төлөв сонгох"
            dropDownDirection="BOTTOM"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#FFF6D1', textColor: '#C39D00' };
      case 'in_progress':
        return { backgroundColor: '#DFF5FF', textColor: '#00A3FF' };
      case 'resolved':
        return { backgroundColor: '#E5F8E8', textColor: '#2ECC71' };
      default:
        return { backgroundColor: '#eee', textColor: '#777' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/Employee/Issue/ReportIssueScreen')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,  zIndex: 0, marginBottom: 100},
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#2F487F' },
  description: { fontSize: 14, color: '#555', marginBottom: 16 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, color: '#E74C3C', fontWeight: '400' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2F487F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
});

export default EmployeeIssueListScreen;
