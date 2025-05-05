import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GroupDetailModal, { GroupDetailModalRef } from '@/app/components/modals/GroupListModals/GroupDetailModal';
import PhoneNumberModal, { PhoneNumberModalRef } from '@/app/components/modals/GroupListModals/PhoneAddModal';
import EmailAddModal, { EmailAddModalRef } from '@/app/components/modals/GroupListModals/EmailAddModal';
import GroupAddModal, { GroupAddModalRef } from '@/app/components/modals/GroupListModals/GroupAddModal';

export default function GroupList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const groupDetailRef = useRef<GroupDetailModalRef>(null);
  const phoneModalRef = useRef<PhoneNumberModalRef>(null);
  const emailAddModalRef = useRef<EmailAddModalRef>(null);
  const groupAddModalRef = useRef<GroupAddModalRef>(null);

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get('http://localhost:5050/api/safety-engineer/groups', {
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
      phoneModalRef.current?.open(selectedGroup.id); // ✅ groupId дамжууллаа
    } else {
      Alert.alert('Анхаар', 'Бүлэг сонгогдоогүй байна.');
    }
  };
  

  const openEmailModal = () => {
    if (selectedGroup?.id) {
      emailAddModalRef.current?.open(selectedGroup.id); // ✅ ID дамжуулж байна
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
                    ? { uri: `http://localhost:5050${group.profile.image}` }
                    : require('@/assets/images/add-group.png') // default зураг fallback
              }
              style={[
                styles.groupImage,
                group.id === 'add' && styles.addGroupImage,
              ]}
            />
            <Text style={styles.groupName}>{group.name}</Text>
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
      <GroupAddModal ref={groupAddModalRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#EFF5FF', padding: 20, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#000' },
  scrollContainer: { flexDirection: 'row', alignItems: 'center' },
  groupItem: { marginRight: 15, alignItems: 'center' },
  groupImage: { width: 70, height: 70, borderRadius: 80, backgroundColor: '#fff'},
  groupName: { marginTop: 5, fontSize: 14, color: '#333' },
  addGroupImage: { padding: 25},
});
