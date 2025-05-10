import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GroupDetailScreen() {
  // 🧩 Хатуу өгөгдөл
  const groupInfo = {
    id: 1,
    name: 'Аюулгүй ажиллагааны баг',
    activity: 'Үйлдвэрлэлийн ослоос сэргийлэх ажлуудыг зохион байгуулдаг',
    image: '/uploads/sample-group.jpg', // энд зураг байхгүй бол `null` гэж тавьж болно
  };

  const employees = [
    {
      id: 1,
      name: 'Бат-Эрдэнэ',
      email: 'bat@example.com',
      phone: '99119911',
    },
    {
      id: 2,
      name: 'Сараа',
      email: 'saraa@example.com',
      phone: '99112233',
    },
    {
      id: 3,
      name: 'Тэмүүжин',
      email: 'temuujin@example.com',
      phone: '99118877',
    },
  ];

  const renderEmployeeItem = ({ item }: any) => (
    <View style={styles.employeeCard}>
      <Ionicons name="person-circle-outline" size={40} color="#2F487F" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeInfo}>{item.email}</Text>
        <Text style={styles.employeeInfo}>{item.phone}</Text>
      </View>
    </View>
  );
  

  return (
    <ScrollView style={styles.container}>
      {groupInfo.image ? (
        <Image
          source={{ uri: `https://dummyimage.com/600x400/cccccc/000000&text=Group+Image` }}
          style={styles.groupImage}
        />
      ) : (
        <View style={styles.groupImagePlaceholder}>
          <Ionicons name="image-outline" size={80} color="#ccc" />
        </View>
      )}

      <View style={styles.detailContainer}>
        <Text style={styles.groupName}>{groupInfo.name}</Text>
        <Text style={styles.groupDescription}>{groupInfo.activity}</Text>
      </View>

      <Text style={styles.subHeader}>Гишүүд</Text>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEmployeeItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  groupImage: {
    width: '100%',
    height: 200,
  },
  groupImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#eaeaea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    padding: 16,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F487F',
  },
  groupDescription: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 6,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#2F487F',
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeeInfo: {
    fontSize: 13,
    color: '#777',
  },
});
