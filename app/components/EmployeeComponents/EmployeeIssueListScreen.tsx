import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Picker ашиглаж байна
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const EmployeeIssueListScreen = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('pending'); // Dropdown-д сонгосон шинэ төлөв

  useEffect(() => {
    fetchIssues();
  }, []);

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

  const openModal = (issue: any) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setComment('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedIssue) return;
    if (!newStatus) {
      Alert.alert('Алдаа', 'Төлөв сонгоно уу!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/issues/${selectedIssue.id}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comment,
        }),
      });

      if (res.ok) {
        Alert.alert('Амжилттай', 'Төлөв амжилттай шинэчлэгдлээ!');
        setModalVisible(false);
        setComment('');
        fetchIssues();
      } else {
        const error = await res.json();
        Alert.alert('Алдаа', error.message || 'Төлөв шинэчлэхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Төлөв шинэчлэхэд алдаа:', error);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openModal(item)}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="alert-circle-outline" size={24} color="#2F487F" />
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <Ionicons name="ellipse" size={10} style={statusIconStyle(item.status)} />
          <Text style={[styles.statusText, statusTextStyle(item.status)]}>{translateStatus(item.status)}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Хүлээгдэж байна';
      case 'in_progress': return 'Шийдвэрлэж байна';
      case 'resolved': return 'Шийдэгдсэн';
      default: return 'Тодорхойгүй';
    }
  };

  const statusTextStyle = (status: string) => {
    switch (status) {
      case 'pending': return { color: '#F39C12' };
      case 'in_progress': return { color: '#3498DB' };
      case 'resolved': return { color: '#2ECC71' };
      default: return { color: '#7F8C8D' };
    }
  };

  const statusIconStyle = (status: string) => ({
    marginRight: 6,
    color: statusTextStyle(status).color,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  if (issues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#999', fontSize: 16 }}>Мэдэгдэл олдсонгүй</Text>
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

      {/* Modal: Төлөв өөрчлөх + Сэтгэгдэл бичих */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Мэдэгдэл засах</Text>

            <Text style={styles.label}>Шинэ төлөв сонгох</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newStatus}
                onValueChange={(itemValue) => setNewStatus(itemValue)}
              >
                <Picker.Item label="Хүлээгдэж байна" value="pending" />
                <Picker.Item label="Шийдвэрлэж байна" value="in_progress" />
                <Picker.Item label="Шийдэгдсэн" value="resolved" />
              </Picker>
            </View>

            <Text style={styles.label}>Сэтгэгдэл</Text>
            <TextInput
              style={styles.input}
              placeholder="Сэтгэгдэл бичих..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Хадгалах</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5FE' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#2F487F' },
  description: { fontSize: 14, color: '#555', marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 13, color: '#7F8C8D' },

  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2F487F', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#2F487F', marginBottom: 8 },
  pickerContainer: { backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 16 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, minHeight: 80, marginBottom: 16, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#2F487F', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { backgroundColor: '#f5f5f5', padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#333', fontWeight: '600', fontSize: 16 },
});

export default EmployeeIssueListScreen;
