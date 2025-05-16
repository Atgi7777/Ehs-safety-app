import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/app/components/EmployeeComponents/Header';

const members = [
  { id: 1, name: 'Andrew', email: 'andreeemike@gmail.com', avatar: require('@/assets/images/user-avatar.png') },
  { id: 2, name: 'Mike', email: 'andreeemike@gmail.com', avatar: require('@/assets/images/user-avatar.png') },
  { id: 3, name: 'Gerelsukh', email: 'andreeemike@gmail.com', avatar: require('@/assets/images/user-avatar.png') },
  { id: 4, name: 'Mungunshand', email: 'andreeemike@gmail.com', avatar: require('@/assets/images/user-avatar.png') },
  { id: 5, name: 'Galbadrakh', email: 'andreeemike@gmail.com', avatar: require('@/assets/images/user-avatar.png') },
];

export default function GroupDetailScreen() {
    const { groupName } = useLocalSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('members');
  
    return (
      <View style={styles.container}>
        
        {/* Sticky Header */}
        <Header/>
  
        {/* Scrollable Body */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Top group info */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image source={require('@/assets/images/people.png')} style={styles.groupLogo} />
              <Text style={styles.groupName}>{groupName || 'Group Name'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
  
          {/* Search */}
          <TextInput style={styles.searchInput} placeholder="Search gnee ene hggyg dgayg" />
  
          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#2F487F" />
              <Text style={styles.actionText}>Утасны дугаараар нэмэх</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="mail-outline" size={20} color="#2F487F" />
              <Text style={styles.actionText}>Email хаягаар нэмэх</Text>
            </TouchableOpacity>
          </View>
  
          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setActiveTab('members')} style={styles.tabButton}>
              <Text style={activeTab === 'members' ? styles.activeTab : styles.inactiveTab}>Гишүүд</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('instructions')} style={styles.tabButton}>
              <Text style={activeTab === 'instructions' ? styles.activeTab : styles.inactiveTab}>Зааварчилгаа</Text>
            </TouchableOpacity>
          </View>
  
          {/* Members List */}
          {activeTab === 'members' && members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <Image source={member.avatar} style={styles.avatar} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="pencil-outline" size={20} color="#2F487F" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
  
      </View>
    );
  }
  

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5FE'  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,  padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  groupLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 8  },
  groupName: { fontSize: 20, fontWeight: 'bold' },
  doneText: { color: '#2F487F', fontSize: 16 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: 16},
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', margin: 16},
  actionButton: { flexDirection: 'row', alignItems: 'center' , margin: 16 },
  actionText: { marginLeft: 8, color: '#2F487F' },
  tabRow: { flexDirection: 'row', marginBottom: 16 },
  tabButton: { flex: 1, alignItems: 'center' },
  activeTab: { fontWeight: 'bold', fontSize: 16, color: '#2F487F' },
  inactiveTab: { fontSize: 16, color: '#aaa' },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 , margin: 20 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: 'bold', fontSize: 14 },
  memberEmail: { fontSize: 12, color: '#555' },
  scrollContainer: {
    paddingBottom: 100, // доор бага зэрэг padding өгч scroll хийхэд амар болгоно
  },
  
});
