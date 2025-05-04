import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ЭНЭ ИМПОРТ ХИЙ
import { AuthProvider } from './contexts/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import React from 'react';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* Бүх аппыг үүгээр бүрх */}
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <Stack />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
