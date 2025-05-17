import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../src/config';

const ProfileEditScreen = () => {
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
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get(`${BASE_URL}/api/safety-engineer/me`, config);
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

        setAvatarUri(data.avatar ? `${BASE_URL}${data.avatar}` : null);
      } catch (err) {
        console.error('Профайл татахад алдаа:', err);
        Alert.alert('Алдаа', 'Мэдээлэл татаж чадсангүй');
      }
    };

    fetchProfile();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Зөвшөөрөл', 'Зураг оруулахын тулд зөвшөөрөл шаардлагатай.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const picked = result.assets[0];
      setAvatarUri(picked.uri);
    } catch (error) {
      console.error('Зураг сонгох үед алдаа:', error);
      Alert.alert('Алдаа', 'Зураг сонгох үед алдаа гарлаа.');
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const formData = new FormData();

      Object.entries({
        ...form,
        age: form.age ? parseInt(form.age) : null,
      }).forEach(([key, value]) => {
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

      await axios.put(`${BASE_URL}/api/safety-engineer/edit-me`, formData, {
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Амжилттай', 'Мэдээлэл шинэчлэгдлээ');
      router.back();
    } catch (err) {
      console.error('Шинэчлэхэд алдаа:', err);
      Alert.alert('Алдаа', 'Мэдээлэл шинэчлэхэд алдаа гарлаа');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#2F487F" />
        </TouchableOpacity>
      
      </View>

      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require('@/assets/images/user-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={{ marginTop: 5, color: '#2F487F' }}>Зураг сонгох</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Нэр</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />

      <Text style={styles.label}>Утас</Text>
      <TextInput style={styles.input} value={form.phone} keyboardType="phone-pad" onChangeText={(v) => setForm({ ...form, phone: v })} />

      <Text style={styles.label}>Хэлтэс</Text>
      <TextInput style={styles.input} value={form.department} onChangeText={(v) => setForm({ ...form, department: v })} />

      <Text style={styles.label}>Хаяг</Text>
      <TextInput style={styles.input} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />

      <Text style={styles.label}>Хүйс</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.gender}
          onValueChange={(value) => setForm({ ...form, gender: value })}
        >
          <Picker.Item label="Сонгоно уу" value="" color="#999" />
          <Picker.Item label="Эрэгтэй" value="Эрэгтэй" color="#000" />
          <Picker.Item label="Эмэгтэй" value="Эмэгтэй" color="#000" />
          <Picker.Item label="Бусад" value="Бусад" color="#000"  />
        </Picker>
      </View>

      <Text style={styles.label}>Нас</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.age} onChangeText={(v) => setForm({ ...form, age: v })} />

      <Text style={styles.label}>Мэргэжлийн зэрэг</Text>
      <TextInput style={styles.input} value={form.professional_degree} onChangeText={(v) => setForm({ ...form, professional_degree: v })} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Хадгалах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileEditScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: Platform.OS === 'ios' ? 30 : 5,
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F487F',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 100 : 50,
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#2F487F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});
