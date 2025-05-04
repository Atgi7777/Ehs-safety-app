//app/index.jsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function index() { // том үсгээр
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        router.replace('/LoginScreen');
        setLoading(false);
        return;
      }

      const role = await AsyncStorage.getItem('userRole');
      if (!role) {
        router.replace('/LoginScreen');
        setLoading(false);
        return;
      }

      switch (role) {
        case 'employee':
          router.replace('/Employee/Tab'); 
          break;
        case 'safety-engineer':
          router.replace('/Engineer/Tabs');
          break;
        default:
          router.replace('/'); 
      }

      setLoading(false);
    };

    checkLogin();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
