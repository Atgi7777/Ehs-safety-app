// src/hooks/useAuth.tsx
import { useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../contexts/AuthContext';
import { login } from '../api/authService';

export const useAuth = () => {
  const { user, setUser, logout, loading } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  const loginHandler = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      const { token, user } = response;

      // Токен болон хэрэглэгчийн мэдээллийг AsyncStorage-д хадгалах
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userId', user.id.toString());
      await AsyncStorage.setItem('username', user.username);
      await AsyncStorage.setItem('userEmail', user.email);

      // Хэрэглэгчийн мэдээллийг AuthContext-д хадгалах
      setUser(user);
      console.log('Logged in user:', user); // Лог хийж шалгах

      // Бүх мэдээллийг "ress" хэмээх нэртэй буцаах
      const ress = {
        user,
        token,
      };

      console.log('ress:', ress); // Энэ хэсэгт амжилттай буцаж буй хариу шалгах
      return ress; // Бүх хариуг "ress"-ээр буцааж байна
    } catch (error: any) {
      setError(error.message || 'Нэвтрэх үед алдаа гарлаа');
      console.error('Error:', error);
      throw error;
    }
  };

  const logoutHandler = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return { user, error, login: loginHandler, logout: logoutHandler, loading };
};
