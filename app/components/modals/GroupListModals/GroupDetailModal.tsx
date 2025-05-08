//GroupDetailModal.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmployeeDetailModal, { EmployeeDetailModalRef } from '@/app/components/modals/GroupDetailModals/EmployeeDetailModal';
import { useRouter } from 'expo-router';
 


const BASE_URL = Platform.OS === 'ios' ? 'http://localhost:5050' : 'http://10.0.2.2:5050';

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
  const [activeTab, setActiveTab] = useState<'members' | 'instructions'>('members');
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [organizationEmployees, setOrganizationEmployees] = useState<any[]>([]);
  const [combinedEmployees, setCombinedEmployees] = useState<any[]>([]);
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
      setCombinedEmployees([...groupMembers, ...newEmployees]);
    } catch (err) {
      console.error('Ажилчдыг татах үед алдаа:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInstructions();
  }, [group]);

  const toggleSelect = (id: number) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleGroupOpen = (groupId: number) => {
    router.push({
      pathname: '/components/modals/GroupDetailModals/GroupModals',
      params: { groupId: groupId.toString() }, // ⚠️ string хэлбэртэй дамжуулна
    });
  };

  const handleDone = async () => {
    if (!group || !selectedEmployees.length) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${BASE_URL}/api/safety-engineer/groups/${group.id}/addmembers`, { employeeIds: selectedEmployees }, config);
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
  

  const fetchInstructions = async () => {
    if (!group || !group.id) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${BASE_URL}/api/instruction/groups/${group.id}/instructions`, config);
      setInstructions(res.data);
    } catch (err) {
      console.error('Зааварчилгаа татах үед алдаа:', err);
    }
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
                  source={group.id === 'add'
                    ? group.image
                    : group.profile?.image
                      ? { uri: `${BASE_URL}${group.profile.image}` }
                      : require('@/assets/images/add-group.png')}
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
                <Text style={activeTab === 'members' ? styles.activeTab : styles.inactiveTab}>Гишүүд</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('instructions')} style={styles.tabButton}>
                <Text style={activeTab === 'instructions' ? styles.activeTab : styles.inactiveTab}>Зааварчилгаа</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'members' ? (
  <ScrollView showsVerticalScrollIndicator={false}>
    {groupMembers.map((employee, index) => (
      <View key={`group-${index}`} style={styles.memberRow}>
        <Image source={employee.avatar ? { uri: `${BASE_URL}${employee.avatar}` } : require('@/assets/images/user-avatar.png')} style={styles.avatar} />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{employee.name}</Text>
          <Text style={styles.memberEmail}>{employee.email}</Text>
        </View>
        <TouchableOpacity onPress={() => openEmployeeDetail(employee.id , group.id )}>
          
  <Ionicons name="pencil-outline" size={20} color="#2F487F" />
</TouchableOpacity>

      </View>
    ))}

    {organizationEmployees.length > 0 && (
      <>
        <View style={{ marginVertical: 15, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 10 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Байгууллагын ажилчид</Text>
        </View>

        {organizationEmployees.map((employee, index) => (
          <View key={`org-${index}`} style={styles.memberRow}>
            <Image source={employee.avatar ? { uri: `${BASE_URL}${employee.avatar}` } : require('@/assets/images/user-avatar.png')} style={styles.avatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{employee.name}</Text>
              <Text style={styles.memberEmail}>{employee.email}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleSelect(employee.id)}>
              <Ionicons
                name={selectedEmployees.includes(employee.id) ? 'checkbox-outline' : 'square-outline'}
                size={20}
                color="#2F487F"
              />
            </TouchableOpacity>
          </View>
        ))}
      </>
    )}
  </ScrollView>
) : (
<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 , marginTop: 30}}>
  {instructions.map((instruction, index) => (
    <TouchableOpacity
      key={index}
      activeOpacity={0.85}
      onPress={() => {
        router.push({
          pathname: '/Engineer/Instruction/EmployeeViewed',
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
      {/* Floating Icon */}
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

      {/* Title + Description */}
      <View style={{ paddingLeft: 36 }}>
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#2F487F', marginBottom: 6 }}>
          {instruction.title}
        </Text>

        <View style={{
          borderBottomWidth: 1,
          borderBottomColor: '#E3E9F4',
          marginVertical: 6,
        }} />

        <Text style={{ color: '#444', fontSize: 15, lineHeight: 20 }}>
          {instruction.description || 'Тайлбар байхгүй'}
        </Text>
      </View>

      {/* Хугацаа баруун доод буланд */}
      {instruction.createdAt && (
        <View style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
        }}>
          <Text style={{ fontSize: 12, color: '#999' }}>
            🕒 {new Date(instruction.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ))}
</ScrollView>

)}


          </View>
        )}
      </Modalize>
      <EmployeeDetailModal ref={employeeDetailRef} />
    </>
  );
});

export default GroupDetailModal;

const styles = StyleSheet.create({
  modalContent: { padding: 20, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  groupLogo: { width: 70, height: 70, borderRadius: 50, marginRight: 8 },
  groupTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 80 },
  doneText: { color: '#2F487F', fontSize: 16 },
  searchInput: { backgroundColor: '#F1F1F1', borderRadius: 10, padding: 10, marginVertical: 10 },
  actionRow: { flexDirection: 'column', marginHorizontal: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  actionText: { marginLeft: 8, color: '#2F487F' },
  tabRow: { flexDirection: 'row', marginVertical: 10, backgroundColor: '#F1F1F1', borderRadius: 20, padding: 5 },
  tabButton: { flex: 1, alignItems: 'center' },
  activeTab: { fontWeight: 'bold', fontSize: 16, color: '#2F487F', backgroundColor: '#fff', padding: 12, borderRadius: 20, paddingHorizontal: 40 },
  inactiveTab: { fontSize: 16, color: '#aaa', padding: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginVertical: 8 },
  avatar: { width: 70, height: 70, borderRadius: 50, marginRight: 8 },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: 'bold', fontSize: 16 },
  memberEmail: { fontSize: 14, color: '#555' },
});
