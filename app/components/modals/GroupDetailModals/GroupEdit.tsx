import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';


const BASE_URL = Platform.OS === 'ios'
  ? 'http://127.0.0.1:5050' // эсвэл your Mac IP
  : 'http://10.0.2.2:5050';

const EditGroup = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workDetail, setWorkDetail] = useState('');
  const [status, setStatus] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/group/${groupId}`);
        const data = await res.json();
        setGroup(data);
        setName(data.name || '');
        setActivity(data.activity || '');
        setWorkDescription(data.work_description || '');
        setWorkDetail(data.work_detail || '');
        setStatus(data.status || '');
      } catch (err) {
        Alert.alert('Алдаа', 'Мэдээлэл татаж чадсангүй.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) fetchGroup();
  }, [groupId]);

  const pickImage = async () => {
    // 1. Permission асуух
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Анхаар', 'Зураг сонгохын тулд permission шаардлагатай!');
      return;
    }
  
    try {
      // 2. Зураг сонгох
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
  
      // 3. Цуцлагдсан эсэх болон зураг байгаа эсэх шалгах
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Зураг сонгоогүй');
        return;
      }
  
      // 4. Зураг авах
      const selected = result.assets[0];
      setImageUri(selected.uri);
    } catch (err) {
      console.error('Зураг сонгоход алдаа:', err);
      Alert.alert('Алдаа', 'Зураг сонгоход алдаа гарлаа.');
    }
  };
  

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('activity', activity);
    formData.append('work_description', workDescription);
    formData.append('work_detail', workDetail);
    formData.append('status', status);

    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'group.jpg',
      } as any); // React Native File format
    }

    try {
      const res = await fetch(`${BASE_URL}/api/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert('Амжилттай', 'Мэдээлэл шинэчлэгдлээ.');
        router.back();
      } else {
        Alert.alert('Алдаа', result.message || 'Шинэчлэхэд алдаа гарлаа.');
      }
    } catch (err) {
      console.error('Шинэчлэхэд алдаа:', err);
      Alert.alert('Алдаа', 'Сүлжээний алдаа эсвэл сервер ажиллахгүй байна.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F487F" />
        <Text>Уншиж байна...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Icon */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>
      </View>

      {/* Group Image + Change */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : group?.profile?.image
              ? { uri: `${BASE_URL}${group.profile.image}` }
              : require('@/assets/images/add-group.png')
          }
          style={styles.groupImage}
        />
        <Text style={styles.changePhotoText}>Зураг солих</Text>
      </TouchableOpacity>

      

      <Text style={styles.label}>Нэр</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Ажлын чиглэл</Text>
      <TextInput style={styles.input} value={activity} onChangeText={setActivity} />

      <Text style={styles.label}>Ажлын товч тайлбар</Text>
      <TextInput
        style={styles.input}
        value={workDescription}
        onChangeText={setWorkDescription}
      />

      <Text style={styles.label}>Ажлын дэлгэрэнгүй</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={workDetail}
        onChangeText={setWorkDetail}
      />

      <Text style={styles.label}>Статус</Text>
      <TextInput style={styles.input} value={status} onChangeText={setStatus} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Хадгалах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditGroup;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 70,
    backgroundColor: '#F3F4F6',
    minHeight: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#E5E7EB',
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  saveBtn: {
    backgroundColor: '#2F487F',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#2F487F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
