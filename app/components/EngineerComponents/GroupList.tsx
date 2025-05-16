//GroupList.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';

import GroupDetailModal, { GroupDetailModalRef } from '@/app/components/modals/GroupListModals/GroupDetailModal';
import PhoneNumberModal, { PhoneNumberModalRef } from '@/app/components/modals/GroupListModals/PhoneAddModal';
import EmailAddModal, { EmailAddModalRef } from '@/app/components/modals/GroupListModals/EmailAddModal';
import GroupAddModal, { GroupAddModalRef } from '@/app/components/modals/GroupListModals/GroupAddModal';
import { BASE_URL } from '../../../src/config'; // ← config зөв

export default function GroupList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const groupDetailRef = useRef<GroupDetailModalRef>(null);
  const phoneModalRef = useRef<PhoneNumberModalRef>(null);
  const emailAddModalRef = useRef<EmailAddModalRef>(null);
  const groupAddModalRef = useRef<GroupAddModalRef>(null);

  const { refresh } = useLocalSearchParams(); // ✅
  const router = useRouter(); // ✅ хэрэгтэй бол хэрэглэнэ

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${BASE_URL}/api/safety-engineer/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedGroups = res.data;

      const finalGroups = [
        ...fetchedGroups,
        {
          id: 'add',
          name: 'Add Group',
          image: require('@/assets/images/add-group.png'),
        },
      ];

      setGroups(finalGroups);
    } catch (err) {
      console.error('Бүлэг татах алдаа:', err);
      Alert.alert('Алдаа', 'Бүлэг татаж чадсангүй');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

useFocusEffect(
  React.useCallback(() => {
    fetchGroups(); 
  }, [refresh])
);

  const openGroupDetail = (group: any) => {
    if (group.id === 'add') {
      groupAddModalRef.current?.open();
    } else {
      setSelectedGroup(group);
      groupDetailRef.current?.open();
    }
  };

  const openPhoneModal = () => {
    if (selectedGroup?.id) {
      phoneModalRef.current?.open(selectedGroup.id);
    } else {
      Alert.alert('Анхаар', 'Бүлэг сонгогдоогүй байна.');
    }
  };

  const openEmailModal = () => {
    if (selectedGroup?.id) {
      emailAddModalRef.current?.open(selectedGroup.id);
    } else {
      Alert.alert('Анхаар', 'Бүлэг сонгогдоогүй байна.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Бүлэг</Text>

      <ScrollView


        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupItem} onPress={() => openGroupDetail(group)}>
            <Image
              source={
                group.id === 'add'
                  ? group.image
                  : group.profile?.image
                    ? { uri: `${BASE_URL}${group.profile.image}` }
                    : require('@/assets/images/people.png')
              }
              style={[
                styles.groupImage,
                group.id === 'add' && styles.addGroupImage,
                !group.profile?.image && group.id !== 'add' && styles.defaultGroupImage,
              ]}
            />
<Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">
  {group.name}
</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Модалууд */}
      <GroupDetailModal
        ref={groupDetailRef}
        group={selectedGroup}
        openPhoneModal={openPhoneModal}
        openEmailModal={openEmailModal}
      />
      <PhoneNumberModal ref={phoneModalRef} />
      <EmailAddModal ref={emailAddModalRef} />
      <GroupAddModal ref={groupAddModalRef} onGroupCreated={fetchGroups} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#EFF5FF', padding: 20, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: '400', marginBottom: 10, color: '#000' },
  scrollContainer: { flexDirection: 'row', alignItems: 'center' },
  groupItem: { marginRight: 15, alignItems: 'center' , width: 70 },
  groupImage: { width: 70, height: 70, borderRadius: 80, backgroundColor: '#fff' },
 groupName: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    
  },  addGroupImage: { padding: 25 },
  defaultGroupImage: { width: 70, height: 70, borderRadius: 80, padding: 10 }, // ✅ default зурагт тусгай хэмжээ
});
