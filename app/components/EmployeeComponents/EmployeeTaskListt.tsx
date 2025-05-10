import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Task = {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
};

const tasks: Task[] = [
  { id: 1, title: 'Аюулгүй ажиллагааны зааварчилгаа өгөх', dueDate: '2025.05.10', completed: false },
  { id: 2, title: 'Цахилгааны хяналт хийх', dueDate: '2025.05.12', completed: true },
  { id: 3, title: 'Бичиг баримт бүрдүүлэх', dueDate: '2025.05.14', completed: false },
];

export default function EmployeeTaskListt() {
  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>Дуусах огноо: {item.dueDate}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.status, { backgroundColor: item.completed ? '#4CAF50' : '#FFC107' }]}>
          {item.completed ? 'Хийгдсэн' : 'Хийгдээгүй'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Гүйцэтгэх ажлууд</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#2F487F',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
  status: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginBottom: 6,
  },
});
