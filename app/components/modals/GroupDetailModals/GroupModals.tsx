//GroupModals.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '../../../../src/config';

const GroupModals = () => {
  const { groupId  , refresh} = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

 useEffect(() => {
  const fetchGroupDetail = async () => {
    setLoading(true); // loading true болгох нь зөв
    try {
      const res = await axios.get(`${BASE_URL}/api/group/${groupId}`);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (groupId) {
    fetchGroupDetail();
  }
}, [groupId, refresh]);

 const handleDelete = async () => {
  Alert.alert('Баталгаажуулах', 'Энэ бүлгийг устгах уу?', [
    { text: 'Болих', style: 'cancel' },
    {
      text: 'Устгах',
      style: 'destructive',
      onPress: async () => {
        try {
          await axios.delete(`${BASE_URL}/api/group/${groupId}`);
          Alert.alert('Амжилттай', 'Бүлэг амжилттай устлаа.');
          router.push('/Engineer/Tabs/EngineerScreen'); // ✅ энд шууд буцахдаа refresh хийнэ
        } catch (err) {
          console.error('Устгахад алдаа:', err);
          Alert.alert('Алдаа', 'Устгаж чадсангүй.');
        }
      },
    },
  ]);
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F487F" />
        <Text>Уншиж байна...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Групп олдсонгүй.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back & Edit */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#2F487F" />
        </TouchableOpacity>
        <TouchableOpacity
  onPress={() => {
    router.push({
      pathname: '/components/modals/GroupDetailModals/GroupEdit',
      params: { groupId: group?.id.toString() }, // ID-г string болгоно
    });
  }}
>
  <Ionicons name="create-outline" size={30} color="#2F487F" />
</TouchableOpacity>

      </View>
      
      <Image
        source={
          group.profile?.image
            ? { uri: `${BASE_URL}${group.profile.image}` ,  params: { groupId: groupId?.toString() }, }
            : require('@/assets/images/people.png')
        }
            style={[
    styles.groupImage,
    !group?.profile?.image && styles.defaultImage, // 🔥 Default зурган дээр нэмэлт стиль
  ]}
      />
<Text style={styles.groupName}>{group.name}</Text>
      

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Ажлын чиглэл:</Text>
        <Text style={styles.infoValue}>{group.activity || '—'}</Text>

        <Text style={styles.infoLabel}>Ажлын товч тайлбар:</Text>
        <Text style={styles.infoValue}>{group.work_description || '—'}</Text>

        <Text style={styles.infoLabel}>Ажлын дэлгэрэнгүй:</Text>
        <Text style={styles.infoValue}>{group.work_detail || '—'}</Text>

        <Text style={styles.infoLabel}>Статус:</Text>
        <Text style={styles.infoValue}>{group.status || '—'}</Text>

        <Text style={styles.infoLabel}>ХАБ инженер:</Text>
        <Text style={styles.infoValue}>
          {group.safetyEngineer?.name || '—'}
        </Text>

        <Text style={styles.infoLabel}>Байгууллага:</Text>
        <Text style={styles.infoValue}>
          {group.organization?.name || '—'}
        </Text>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.deleteBtnText}>Бүлэг устгах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GroupModals;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 100,
    alignItems: 'center',
    minHeight: '100%',
   
  },

   defaultImage: {
  backgroundColor: '#f1f5f9',  // Default цайвар саарал фон
padding: 20,
},
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  groupImage: {
    width: 140,
    height: 140,
    borderRadius: 100,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#f1f5f9',
    // padding: 20,
  },
  groupName: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 14,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#374151',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    marginTop: 4,
    lineHeight: 22,
  },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#2F487F',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  deleteBtnText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: '400',
    fontSize: 16,
  },
});
