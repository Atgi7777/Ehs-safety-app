import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle-outline" size={44} color="#2F487F" />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
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

  const statusColor = group.status === 'active' ? '#22b573' : '#d9534f';

  return (
    <View style={{ flex: 1 }}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={30} color="#2F487F" />
      </TouchableOpacity>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Group image */}
        <View style={styles.groupImageWrapper}>
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
        </View>

        {/* Group detail */}
        <View style={styles.detailContainer}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="briefcase-outline" size={18} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.groupActivity}>{group.activity}</Text>
          </View>
          <Text style={styles.groupDescription}>{group.work_description}</Text>
          <Text style={styles.groupDetail}>{group.work_detail}</Text>
          <Text style={[styles.groupStatus, { color: statusColor }]}>
            <Ionicons name={group.status === 'active' ? "checkmark-circle" : "close-circle"} size={17} color={statusColor} /> 
            {group.status === 'active' ? ' Идэвхтэй' : ' Идэвхгүй'}
          </Text>
        </View>

        {/* Members */}
        <Text style={styles.subHeader}>Гишүүд</Text>
        {group.members.length > 0 ? (
          <FlatList
            data={group.members}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEmployeeItem}
            contentContainerStyle={styles.membersList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noMembersBox}>
            <Ionicons name="people-outline" size={34} color="#BBB" style={{ marginBottom: 5 }} />
            <Text style={{ fontSize: 16, color: '#888' }}>Одоогоор гишүүн байхгүй байна.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB', paddingTop: 90 },
  backButton: {
    position: 'absolute',
    top: 36,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 20
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  groupImageWrapper: {
    margin: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2F487F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#fff'
  },
  groupImage: { width: '100%', height: 190, resizeMode: 'cover' },
  groupImagePlaceholder: { width: '100%', height: 190, backgroundColor: '#eaeaea', justifyContent: 'center', alignItems: 'center' },
  detailContainer: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 18
  },
  groupName: { fontSize: 25, fontWeight: 'bold', color: '#25396F', marginBottom: 2 },
  groupActivity: { fontSize: 15, color: '#666', fontWeight: '500' },
  groupDescription: { fontSize: 15, color: '#444', marginTop: 8 },
  groupDetail: { fontSize: 14, color: '#888', marginTop: 3, marginBottom: 8 },
  groupStatus: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  subHeader: {
    fontSize: 21, fontWeight: '700',
    marginLeft: 20, marginTop: 18, marginBottom: 7,
    color: '#2F487F', letterSpacing: 0.2
  },
  membersList: { paddingHorizontal: 14, paddingBottom: 10 },
  employeeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    padding: 13, marginBottom: 12,
    borderRadius: 13,
    shadowColor: '#2F487F', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F1F2F6'
  },
  avatarContainer: {
    backgroundColor: '#f1f3fa',
    borderRadius: 30,
    padding: 2,
    marginRight: 6,
  },
  employeeName: { fontSize: 17, fontWeight: '600', color: '#213469', marginBottom: 2 },
  employeeInfo: { fontSize: 13, color: '#78819A', marginBottom: 1 },
  noMembersBox: {
    padding: 30, alignItems: 'center', justifyContent: 'center'
  }
});
