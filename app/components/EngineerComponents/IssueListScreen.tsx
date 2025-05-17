import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

export default function IssueListScreen() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/getIssue`, {
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
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FFF6CC', color: '#988100', label: 'Хүлээгдэж байна' };
      case 'in_progress':
        return { bg: '#D4F0FF', color: '#007CC3', label: 'Засвар хийж байна' };
      case 'resolved':
        return { bg: '#D6F9D0', color: '#269A43', label: 'Шийдэгдсэн' };
      default:
        return { bg: '#E0E0E0', color: '#666', label: 'Тодорхойгүй' };
    }
  };

const changeIssueStatus = async (id: number, newStatus: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
   await fetch(`${BASE_URL}/api/issues/${id}/update`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ status: newStatus }), // <= ЭНЭ байгаа эсэхээ шалга!
});

    setIssues((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
    );
  } catch (e) {
    alert('Төлөв солиход алдаа гарлаа!');
  }
};


  const statusItems = [
    { label: 'Хүлээгдэж байна', value: 'pending' },
    { label: 'Засвар хийж байна', value: 'in_progress' },
    { label: 'Шийдэгдсэн', value: 'resolved' },
  ];

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const status = getStatusStyle(item.status);
    const isDropdownOpen = openDropdownId === item.id;

    return (
      <View style={[styles.card, { zIndex: isDropdownOpen ? 1000 : issues.length - index }]}>
      
<TouchableOpacity
  style={styles.headerRow}
  activeOpacity={0.8}
  onPress={() => router.push(`/Engineer/Issue/IssueDetailScreen?id=${item.id}`)}
>
  <Ionicons name="warning-outline" size={20} color="#4169E1" style={{ marginRight: 6 }} />
  <Text style={styles.title}>{item.title}</Text>
</TouchableOpacity>



        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          {/* Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={18} color="#E74C3C" />
            <Text style={styles.dateText}> {formatDate(item.created_at)}</Text>
          </View>

          {/* Status Dropdown */}
          <View style={{ width: 160 }}>
            <DropDownPicker
              open={isDropdownOpen}
              value={item.status}
              items={statusItems}
              setOpen={(open) => {
                const realOpen = typeof open === 'function' ? open(isDropdownOpen) : open;
                if (realOpen) setOpenDropdownId(item.id);
                else setOpenDropdownId(null);
              }}
              setValue={() => { }}
              setItems={() => { }}
              onSelectItem={(selectedItem) => {
                if (selectedItem.value !== item.status) {
                  changeIssueStatus(item.id, selectedItem.value);
                }
              }}
              style={{
                backgroundColor: status.bg,
                borderColor: 'transparent',
                minHeight: 38,
                paddingLeft: 5,
                paddingRight: 5,
              }}
              textStyle={{
                color: status.color,
                fontWeight: '600',
                fontSize: 14,
              }}
              dropDownContainerStyle={{
                backgroundColor: '#fff',
                borderColor: '#ddd',
                zIndex: 2000,
                elevation: 10,
              }}
              placeholder="Төлөв сонгох"
              dropDownDirection="BOTTOM"
              showArrowIcon
              listMode="FLATLIST"
              ArrowDownIconComponent={() => (
                <Ionicons name="chevron-down" size={18} color={status.color} style={{ marginLeft: 2 }} />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons name="chevron-up" size={18} color={status.color} style={{ marginLeft: 2 }} />
              )}
            />
          </View>
        </View>
      </View>
    );
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
        contentContainerStyle={{ padding: 14, paddingBottom: 50 }}
        extraData={openDropdownId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF5FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#3A5DF4',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
    // zIndex-ийг дээд талын пропсоор өгч байна!
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#284A88',
    marginLeft: 4,
    flex: 1,
  },
  description: { fontSize: 14, color: '#222', marginBottom: 12, marginLeft: 2 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: { fontSize: 14, color: '#E74C3C', marginLeft: 3, fontWeight: '500' },
});
