import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useEffect, useState } from 'react';

const BASE_URL = Platform.OS === 'ios' ? 'http://localhost:5050' : 'http://10.0.2.2:5050';

const GroupModals = () => {
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/safety-engineer/groups/${groupId}`);
        setGroup(res.data);
      } catch (err) {
        console.error('Группийн мэдээлэл татахад алдаа:', err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetail();
    }
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.centered}><Text>Уншиж байна...</Text></View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centered}><Text>Групп олдсонгүй.</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={group.profile?.image ? { uri: `${BASE_URL}${group.profile.image}` } : require('@/assets/images/add-group.png')}
        style={styles.groupImage}
      />
      <Text style={styles.groupName}>{group.name}</Text>
      <Text style={styles.groupDescription}>{group.description || 'Тайлбар байхгүй'}</Text>
      {/* Нэмэлт мэдээллүүдийг энд харуулж болно */}
    </ScrollView>
  );
};

export default GroupModals;

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  groupImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  groupName: { fontSize: 22, fontWeight: 'bold', color: '#2F487F', marginBottom: 10 },
  groupDescription: { fontSize: 16, color: '#444', textAlign: 'center' },
});
