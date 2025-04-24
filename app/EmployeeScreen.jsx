// EmployeeScreen.jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';

export default function EmployeeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ажилтны дэлгэц</Text>
      <Text style={styles.greeting}>Сайн уу, {user?.name}</Text>
      <Button title="Гарах" onPress={logout} />
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
    marginBottom: 10,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 20,
  },
});
