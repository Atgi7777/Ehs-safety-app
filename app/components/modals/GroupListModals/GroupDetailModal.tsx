//GroupDetailModal.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import EmployeeDetailModal, { EmployeeDetailModalRef } from '@/app/components/modals/GroupDetailModals/EmployeeDetailModal';
import { BASE_URL } from '../../../../src/config';
import { useRouter } from 'expo-router'; 

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

const GroupDetailModal = forwardRef<GroupDetailModalRef, GroupDetailModalProps>(({ group, openPhoneModal, openEmailModal }, ref) => {
  const modalRef = useRef<Modalize>(null);
  const employeeDetailRef = useRef<EmployeeDetailModalRef>(null);
  const router = useRouter(); // ✅ нэмсэн
  const [activeTab, setActiveTab] = useState<'members' | 'instructions'>('members');
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [organizationEmployees, setOrganizationEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useImperativeHandle(ref, () => ({ open: () => modalRef.current?.open() }));

  const fetchData = async () => {
    if (!group?.id) return;
    const token = await AsyncStorage.getItem('userToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const groupRes = await axios.get(`${BASE_URL}/api/safety-engineer/groups/${group.id}/members`, config);
    const orgRes = await axios.get(`${BASE_URL}/api/safety-engineer/organization/members`, config);

    setGroupMembers(groupRes.data);
    const filtered = orgRes.data.filter((emp: any) => !groupRes.data.some((gm: any) => gm.id === emp.id));
    setOrganizationEmployees(filtered);
    setFilteredEmployees(filtered);
  };

  const fetchInstructions = async () => {
    if (!group?.id) return;
    const token = await AsyncStorage.getItem('userToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${BASE_URL}/api/instruction/groups/${group.id}/instructions`, config);
    setInstructions(Array.isArray(res.data) ? res.data.filter(Boolean) : []);
  };

useEffect(() => {
  if (group?.id) {
    fetchData();
    fetchInstructions();
  }
}, [group?.id, group?.profile?.image]); 

  const toggleSelect = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleAddEmployees = async () => {
    if (!selectedEmployees.length) return;
    const token = await AsyncStorage.getItem('userToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${BASE_URL}/api/safety-engineer/groups/${group.id}/addmembers`, { employeeIds: selectedEmployees }, config);

    const added = organizationEmployees.filter((emp) => selectedEmployees.includes(emp.id));
    setGroupMembers((prev) => [...prev, ...added]);
    const updated = organizationEmployees.filter((emp) => !selectedEmployees.includes(emp.id));
    setOrganizationEmployees(updated);
    setFilteredEmployees(updated);
    setSelectedEmployees([]);

    Toast.show({ type: 'success', text1: 'Амжилттай', text2: 'Ажилтан амжилттай нэмэгдлээ' });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filtered = organizationEmployees.filter((emp: any) => emp.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(organizationEmployees);
    }
  };
  const handleGroupOpen = (groupId: number) => {
    router.push({
      pathname: '/components/modals/GroupDetailModals/GroupModals',
      params: { groupId: groupId.toString() }, // ⚠️ string хэлбэртэй дамжуулна
    });
  };

  return (
    <>
      <Modalize
        ref={modalRef}
        snapPoint={800}
        modalHeight={800}
        flatListProps={{
          contentContainerStyle: {
            paddingHorizontal: 20,
            paddingBottom: 190,
            marginTop: 20,
          },
          ListHeaderComponent: () => (
            <View>
              {/* Close */}
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={() => modalRef.current?.close()}>
                  <Ionicons name="close-outline" size={35} color="#2F487F" />
                </TouchableOpacity>
              </View>

              {/* Group Info */}
              <View style={styles.groupInfoContainer}>
             <TouchableOpacity onPress={() => handleGroupOpen(group.id)}>

                <Image
                  source={group.profile?.image ? { uri: `${BASE_URL}${group.profile.image}` } : require('@/assets/images/people.png')}
                   style={[
    styles.groupImage,
    !group?.profile?.image && styles.defaultImage, // 🔥 Default зурган дээр нэмэлт стиль
  ]}
                />
                 </TouchableOpacity>

                <Text style={styles.groupName}>{group.name}</Text>
               
              </View>

              {/* Search */}
              <TextInput
                style={styles.searchInput}
                placeholder="Ажилтныг хайх..."
                value={searchText}
                onChangeText={handleSearch}
              />

              {/* Add Options */}
              <View style={styles.addOptions}>
                <TouchableOpacity style={styles.addOptionItem} onPress={openPhoneModal}>
                  <Ionicons style={styles.addOptionIcon} name="call-outline" size={24} color="#2F487F" />
                  <Text style={styles.addOptionText}>Утасны дугаараар нэмэх</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addOptionItem} onPress={openEmailModal}>
                  <Ionicons style={styles.addOptionIcon} name="mail-outline" size={24} color="#2F487F" />
                  <Text style={styles.addOptionText}>Email хаягаар нэмэх</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  onPress={() => setActiveTab('members')}
                  style={[styles.tabButton, activeTab === 'members' && styles.activeTab]}
                >
                  <Text style={activeTab === 'members' ? styles.activeTabText : styles.inactiveTabText}>Гишүүд</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('instructions')}
                  style={[styles.tabButton, activeTab === 'instructions' && styles.activeTab]}
                >
                  <Text style={activeTab === 'instructions' ? styles.activeTabText : styles.inactiveTabText}>Зааварчилгаа</Text>
                </TouchableOpacity>
              </View>

              {/* Гишүүд эсвэл Зааварчилгаа сонгосон байна */}
              {activeTab === 'members' && (
                <>
                  {/* Бүлгийн гишүүд */}
                  <Text style={{ fontWeight: '500', fontSize: 16, marginBottom: 10 }}>Бүлгийн гишүүд</Text>
                  {groupMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.memberItem}
                      onPress={() => employeeDetailRef.current?.open(member.id, group.id)}
                    >
                      <Image
                        source={{ uri: `${BASE_URL}${member.avatar}` }}
                        style={styles.memberAvatar}
                      />
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={24} color="#2F487F" />
                    </TouchableOpacity>
                  ))}

                  {/* Байгууллагын ажилчид */}
                  <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
                    <Text style={{ fontWeight: '500', fontSize: 16, marginBottom: 10 }}>Байгууллагын ажилчид</Text>
                  </View>
                </>
              )}

              {activeTab === 'instructions' && (
                <>
                  {/* Зааварчилгааны хэсэг */}
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 20, marginTop: 20 }}>Зааварчилгаа</Text>
                  {instructions.map((instruction, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.85}
                      onPress={() => {
                        router.push({
                          pathname: '/Engineer/Instruction/InstructionSlideScreen',
                          params: { instructionId: instruction.id },
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
                      <View style={{
                        position: 'absolute',
                        top: -15,
                        left: 15,
                        backgroundColor: '#2F487F',
                        borderRadius: 50,
                        padding: 10,
                        elevation: 4,
                      }}>
                        <Ionicons name="document-text-outline" size={20} color="#fff" />
                      </View>

                      <View style={{ paddingLeft: 36 }}>
                        <Text style={{ fontSize: 17, fontWeight: '500', color: '#2F487F', marginBottom: 6 }}>
                          {instruction.title}
                        </Text>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#E3E9F4', marginVertical: 6 }} />
                        <Text style={{ color: '#444', fontSize: 15, lineHeight: 20 , marginBottom: 8}}>
                          {instruction.description || 'Тайлбар байхгүй'}
                        </Text>
                      </View>

                      {instruction.createdAt && (
                        <View style={{ position: 'absolute', bottom: 12, right: 16  }}>
                          <Text style={{ fontSize: 12, color: '#999' }}>
                            🕒 {new Date(instruction.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          ),
          data: activeTab === 'members' ? filteredEmployees : [],
          keyExtractor: (item) => item.id?.toString(),
          renderItem: ({ item }) => {
  if (activeTab !== 'members') return null; // instructions үед юу ч харуулахгүй
  return (
    <View style={styles.memberItem}>
      <Image
        source={item.avatar ? { uri: `${BASE_URL}${item.avatar}` } : require('@/assets/images/user-avatar.png')}
        style={styles.memberAvatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Ionicons
          name={selectedEmployees.includes(item.id) ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color="#2F487F"
        />
      </TouchableOpacity>
    </View>
  );
}
,
          ListFooterComponent: () =>
            selectedEmployees.length > 0 && activeTab === 'members' ? (
              <TouchableOpacity onPress={handleAddEmployees} style={styles.addEmployeeButton}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold'  }}>Ажилтан нэмэх</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
<EmployeeDetailModal
  ref={employeeDetailRef}
  onRemoveSuccess={fetchData} // 🔥 хасагдах үед fetchData функцийг дуудна
/>
    </>
  );
});

export default GroupDetailModal;




const styles = StyleSheet.create({
  
  closeButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  groupInfoContainer: { alignItems: 'center', marginVertical: 10 },
  groupImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 , backgroundColor: '#f1f5f9'},
  groupName: { fontSize: 20, fontWeight: '600', color: '#2F487F' },
  searchInput: { backgroundColor: '#eee', borderRadius: 10, padding: 10, marginVertical: 10 },
  
  addOptionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  addCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#F1F5F9' },
  addCardLeft: { marginRight: 5 },
  addCardRight: { marginLeft: 5 },
  addText: { marginLeft: 8, color: '#2F487F', fontWeight: '500' },
  defaultImage: {
  backgroundColor: '#f1f5f9',  // Default цайвар саарал фон
padding: 10,
},

addOptions: {
  
  marginTop: 15,
  marginLeft: 25
  
},
addOptionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},
addOptionIcon: {
  marginRight: 12,
},
addOptionText: {
  fontSize: 16,
  color: '#2F487F',
  fontWeight: '500',
},

  tabRow: { flexDirection: 'row', backgroundColor: '#F1F1F1', borderRadius: 30, padding: 4, marginVertical: 10 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  activeTab: { backgroundColor: '#fff', borderRadius: 30 },
  activeTabText: { color: '#2F487F', fontWeight: 'bold', fontSize: dynamicFontSize },
  inactiveTabText: { color: '#999', fontSize: dynamicFontSize },

  memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: '500', fontSize: 16 },
  memberEmail: { color: '#555', fontSize: 14 },

  addEmployeeButton: {
    marginTop: 20,
    backgroundColor: '#2F487F',
    padding: 12,
    borderRadius: 10,
    marginBottom: 160
  },

  instructionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10 },
  instructionTitle: { fontWeight: 'bold', color: '#2F487F' },
  instructionDesc: { marginTop: 6, color: '#666' },
});

