import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function EngineerScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('username');

    router.replace('/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ХАБ инженерийн дэлгэц</Text>
      <Text style={styles.greeting}>Сайн уу, {user?.username}</Text>
      <Button title="Гарах" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 18,
    marginBottom: 20,
  },
});
