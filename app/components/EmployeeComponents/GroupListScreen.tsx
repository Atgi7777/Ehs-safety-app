import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../src/config';
import { useRouter } from 'expo-router';

interface Group {
  id: number;
  name: string;
  image?: string;
  members: number;
}

export default function GroupListScreen({ navigation }: { navigation: any }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get<Group[]>(`${BASE_URL}/api/employee/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (error) {
        console.error('Бүлгүүдийг татахад алдаа:', error);
      }
    };
    fetchGroups();
  }, []);

  const randomColor = useMemo(() => {
    const colors = ['#2F487F', '#4B6587', '#6A89CC', '#82CCDD', '#60A3BC', '#78E08F'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const renderItem = ({ item }: { item: Group }) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/Employee/Group/GroupDetailScreen?id=${item.id}`)}
          activeOpacity={0.85}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {item.image ? (
            <Image source={{ uri: `${BASE_URL}${item.image}` }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: randomColor }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={30} color="#bbb" />
            </View>
            <Text style={styles.subtext}>{item.members} гишүүн</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Харьяалагдах бүлгүүд</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 16,
    color: '#2F487F',
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e1e1e',
    maxWidth: '85%',
  },
  subtext: {
    color: '#7e7e7e',
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});
