import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Image, ScrollView,
  Platform, Alert, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';

export default function ProfileEditScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    department: '',
    address: '',
    gender: '',
    age: '',
    professional_degree: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/api/employee/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          department: data.department || '',
          address: data.address || '',
          gender: data.gender || '',
          age: data.age ? data.age.toString() : '',
          professional_degree: data.professional_degree || '',
        });
        setAvatarUri(data.profile ? `${BASE_URL}${data.profile}` : null);
      } catch (err) {
        Alert.alert('Алдаа', 'Профайл татаж чадсангүй');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Зөвшөөрөл', 'Зураг сонгохын тулд зөвшөөрөл шаардлагатай.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const formData = new FormData();
      Object.entries({ ...form, age: form.age ? parseInt(form.age) : null }).forEach(([key, value]) => {
        formData.append(key, value as any);
      });

      if (avatarUri && avatarUri.startsWith('file://')) {
        const file = {
          uri: avatarUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any;
        formData.append('avatar', file);
      }

      await axios.put(`${BASE_URL}/api/employee/edit-me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Амжилттай', 'Мэдээлэл хадгалагдлаа');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Алдаа', 'Шинэчлэхэд алдаа гарлаа');
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#2F487F" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Буцах товчтой header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={30} color="#2F487F" />
        </TouchableOpacity>
       
      </View>
      
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image
          source={avatarUri ? { uri: avatarUri } : require('@/assets/images/user-avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Зураг өөрчлөх</Text>
      </TouchableOpacity>

      {['name', 'phone', 'department', 'address', 'age', 'professional_degree'].map((field, i) => (
        <View key={i}>
          <Text style={styles.label}>{field === 'professional_degree' ? 'Мэргэжлийн зэрэг' : field === 'age' ? 'Нас' : field === 'department' ? 'Хэлтэс' : field === 'address' ? 'Хаяг' : field === 'phone' ? 'Утас' : 'Нэр'}</Text>
          <TextInput
            style={styles.input}
            keyboardType={field === 'age' ? 'numeric' : field === 'phone' ? 'phone-pad' : 'default'}
            value={(form as any)[field]}
            onChangeText={(v) => setForm({ ...form, [field]: v })}
          />
        </View>
      ))}

      <Text style={styles.label}>Хүйс</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.gender}
          onValueChange={(value) => setForm({ ...form, gender: value })}
        >
          <Picker.Item label="Сонгоно уу" value="" color="#999" />
          <Picker.Item label="Эрэгтэй" value="Эрэгтэй" color="#000" />
          <Picker.Item label="Эмэгтэй" value="Эмэгтэй" color="#000" />
          <Picker.Item label="Бусад" value="Бусад" color="#000" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
        <Text style={styles.saveText}>Хадгалах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    
    marginTop: Platform.OS === 'ios' ? 24 : 4,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
    marginTop: 10
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F487F',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhoto: {
    marginTop: 6,
    color: '#2F487F',
    fontSize: 14,
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 14,
    color: '#2F487F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    height: Platform.OS === 'ios' ? 150 : 50,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2F487F',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});
