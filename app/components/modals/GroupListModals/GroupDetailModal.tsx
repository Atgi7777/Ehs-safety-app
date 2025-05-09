import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmployeeDetailModal, { EmployeeDetailModalRef } from '@/app/components/modals/GroupDetailModals/EmployeeDetailModal';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../../src/config';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const dynamicFontSize = width < 360 ? 12 : width < 400 ? 14 : 16;


export type GroupDetailModalRef = {
  open: () => void;
};

type GroupDetailModalProps = {
  group: any;
  openPhoneModal: () => void;
  openEmailModal: () => void;
};

const GroupDetailModal = forwardRef<GroupDetailModalRef, GroupDetailModalProps>(
  ({ group, openPhoneModal, openEmailModal }, ref) => {
    const modalRef = useRef<Modalize>(null);
    const employeeDetailRef = useRef<EmployeeDetailModalRef>(null);
    const [activeTab, setActiveTab] = useState<'members' | 'instructions'>('members');
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [organizationEmployees, setOrganizationEmployees] = useState<any[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [instructions, setInstructions] = useState<any[]>([]);
    const router = useRouter();

    useImperativeHandle(ref, () => ({ open: () => modalRef.current?.open() }));

    const fetchData = async () => {
      if (!group || !group.id) return;
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const groupRes = await axios.get(`${BASE_URL}/api/safety-engineer/groups/${group.id}/members`, config);
        const groupMembers = groupRes.data;
        setGroupMembers(groupMembers);

        const orgRes = await axios.get(`${BASE_URL}/api/safety-engineer/organization/members`, config);
        const allOrgEmployees = orgRes.data;

        const newEmployees = allOrgEmployees.filter(
          (emp: any) => !groupMembers.some((member: any) => member.id === emp.id)
        );

        setOrganizationEmployees(newEmployees);
      } catch (err) {
        console.error('Ажилчдыг татах үед алдаа:', err);
      }
    };

    const fetchInstructions = async () => {
      if (!group || !group.id) return;
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${BASE_URL}/api/instruction/groups/${group.id}/instructions`, config);
        setInstructions(Array.isArray(res.data) ? res.data.filter(Boolean) : []);
      } catch (err) {
        console.error('Зааварчилгаа татах үед алдаа:', err);
      }
    };

    useEffect(() => {
      fetchData();
      fetchInstructions();
    }, [group]);

    const toggleSelect = (id: number) => {
      setSelectedEmployees((prev) =>
        prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
      );
    };

    const handleGroupOpen = (groupId: number) => {
      router.push({
        pathname: '/components/modals/GroupDetailModals/GroupModals',
        params: { groupId: groupId.toString() },
      });
    };

    const handleDone = async () => {
      if (!group || !selectedEmployees.length) return;
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(
          `${BASE_URL}/api/safety-engineer/groups/${group.id}/addmembers`,
          { employeeIds: selectedEmployees },
          config
        );
        modalRef.current?.close();
        setSelectedEmployees([]);
        fetchData();
      } catch (err) {
        console.error('Гишүүн нэмэх үед алдаа:', err);
      }
    };

    const openEmployeeDetail = (employeeId: number, groupId: number) => {
      employeeDetailRef.current?.open(employeeId, groupId);
    };

    return (
      <>
        <Modalize ref={modalRef} snapPoint={800} modalHeight={800}>
          {group && (
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <TouchableOpacity onPress={() => handleGroupOpen(group.id)}>
                    <Image
                      source={
                        group.id === 'add'
                          ? group.image
                          : group.profile?.image
                          ? { uri: `${BASE_URL}${group.profile.image}` }
                          : require('@/assets/images/add-group.png')
                      }
                      style={styles.groupLogo}
                    />
                  </TouchableOpacity>
                  <Text style={styles.groupTitle}>{group.name}</Text>
                </View>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.searchInput} placeholder="Search" />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={openPhoneModal}>
                  <Ionicons name="call-outline" size={20} color="#2F487F" />
                  <Text style={styles.actionText}>Утасны дугаараар нэмэх</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={openEmailModal}>
                  <Ionicons name="mail-outline" size={20} color="#2F487F" />
                  <Text style={styles.actionText}>Email хаягаар нэмэх</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabRow}>
  <TouchableOpacity onPress={() => setActiveTab('members')} style={styles.tabButton}>
    <View style={activeTab === 'members' ? styles.activeTabContainer : styles.inactiveTabContainer}>
      <Text
        style={activeTab === 'members' ? styles.activeTabText : styles.inactiveTabText}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        Гишүүд
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setActiveTab('instructions')} style={styles.tabButton}>
    <View style={activeTab === 'instructions' ? styles.activeTabContainer : styles.inactiveTabContainer}>
      <Text
        style={activeTab === 'instructions' ? styles.activeTabText : styles.inactiveTabText}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        Зааварчилгаа
      </Text>
    </View>
  </TouchableOpacity>
</View>


              {activeTab === 'instructions' ? (
                <FlatList
                  data={instructions}
                  keyExtractor={(item, index) => `instruction-${index}`}
                  contentContainerStyle={{ paddingBottom: 30, marginTop: 30 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        router.push({
                          pathname: '/Engineer/Instruction/EmployeeViewed',
                          params: { instructionId: item.id },
                        });
                      }}
                      style={{
                        marginBottom: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 20,
                        padding: 20,
                        shadowColor: '#2F487F',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        elevation: 5,
                        borderWidth: 0.8,
                        borderColor: '#D8E2F5',
                        position: 'relative',
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          top: -15,
                          left: 15,
                          backgroundColor: '#2F487F',
                          borderRadius: 50,
                          padding: 10,
                          elevation: 4,
                        }}
                      >
                        <Ionicons name="document-text-outline" size={20} color="#fff" />
                      </View>

                      <View style={{ paddingLeft: 36 }}>
                        <Text
                          style={{ fontSize: 17, fontWeight: '500', color: '#2F487F', marginBottom: 6 }}
                        >
                          {item?.title ?? 'Гарчиг байхгүй'}
                        </Text>
                        <View
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: '#E3E9F4',
                            marginVertical: 6,
                          }}
                        />
                        <Text style={{ color: '#444', fontSize: 15, lineHeight: 20 }}>
                          {item?.description ?? 'Тайлбар байхгүй'}
                        </Text>
                      </View>

                      {item?.createdAt && (
                        <View style={{ position: 'absolute', bottom: 12, right: 16 }}>
                          <Text style={{ fontSize: 12, color: '#999' }}>
                            🕒 {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <FlatList
  data={organizationEmployees}
  keyExtractor={(item) => `org-${item.id}`}
  ListHeaderComponent={() => (
    <>
      <Text style={styles.sectionTitle}>Бүлгийн гишүүд</Text>
      {groupMembers.map((member) => (
        <View key={`member-${member.id}`} style={styles.memberRow}>
          <Image
            source={
              member.avatar
                ? { uri: `${BASE_URL}${member.avatar}` }
                : require('@/assets/images/user-avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
          <TouchableOpacity onPress={() => openEmployeeDetail(member.id, group.id)}>
            <Ionicons name="pencil-outline" size={20} color="#2F487F" />
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ marginTop: 20, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 10 }}>
        <Text style={styles.sectionTitle}>Байгууллагын бусад ажилчид</Text>
      </View>
    </>
  )}
  renderItem={({ item }) => (
    <View style={styles.memberRow}>
      <Image
        source={
          item.avatar
            ? { uri: `${BASE_URL}${item.avatar}` }
            : require('@/assets/images/user-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Ionicons
          name={selectedEmployees.includes(item.id) ? 'checkbox-outline' : 'square-outline'}
          size={20}
          color="#2F487F"
        />
      </TouchableOpacity>
    </View>
  )}
/>

                
              )}
            </View>
          )}
        </Modalize>
        <EmployeeDetailModal ref={employeeDetailRef} />
      </>
    );
  }
);

export default GroupDetailModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20, flex: 1 , marginBottom : 200},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  groupLogo: { width: 70, height: 70, borderRadius: 50, marginRight: 8 },
  groupTitle: { fontSize: 20, fontWeight: '500', marginLeft: 80 },
  doneText: { color: '#2F487F', fontSize: 16 },
  searchInput: { backgroundColor: '#F1F1F1', borderRadius: 10, padding: 10, marginVertical: 10 },
  actionRow: { flexDirection: 'column', marginHorizontal: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  actionText: { marginLeft: 8, color: '#2F487F' , fontSize: 15 },
  
  sectionTitle: {
    fontWeight: '400',
    fontSize: 16,
    marginBottom: 10,
    color: '#2F487F',
  },
  
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 30,
    padding: 4,
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  
  tabButton: {
    flex: 1,
    paddingHorizontal: 4,
  },
  
  activeTabContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  inactiveTabContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  activeTabText: {
    color: '#2F487F',
    fontWeight: 'bold',
    fontSize: dynamicFontSize,
    textAlign: 'center',
  },
  
  inactiveTabText: {
    color: '#aaa',
    fontSize: dynamicFontSize,
    textAlign: 'center',
  },
  
  
  memberRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  avatar: { width: 70, height: 70, borderRadius: 50, marginRight: 8 },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: '500', fontSize: 16 },
  memberEmail: { fontSize: 14, color: '#555' },
});
