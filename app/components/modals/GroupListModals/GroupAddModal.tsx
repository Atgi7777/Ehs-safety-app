import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../../src/config';


export type GroupAddModalRef = {
  open: () => void;
};
type GroupAddModalProps = {
  onGroupCreated: () => void; // ✅ Бүлэг амжилттай үүссэн үед дуудна
};
const GroupAddModal = forwardRef<GroupAddModalRef, GroupAddModalProps>(({ onGroupCreated }, ref) => {
  const modalRef = useRef<Modalize>(null);

  const [groupName, setGroupName] = useState('');
  const [activity, setActivity] = useState('');
  const [plannedTask, setPlannedTask] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      clearForm();
      modalRef.current?.open();
    },
  }));

  const clearForm = () => {
    setGroupName('');
    setActivity('');
    setPlannedTask('');
    setWorkDescription('');
    setLogoUri(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      console.log('📸 Image URI:', uri);
      setLogoUri(uri);
    }
  };

 const handleSaveGroup = async () => {
  console.log('🚀 handleSaveGroup дуудлаа!');

  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('🛡 Token:', token);

    if (!token) {
      Alert.alert('Алдаа', 'Токен олдсонгүй. Нэвтэрнэ үү.');
      return;
    }

    console.log('📦 Group Name:', groupName);
    console.log('📦 Activity:', activity);
    console.log('📦 Planned Task:', plannedTask);
    console.log('📦 Work Description:', workDescription);
    console.log('📦 Logo URI:', logoUri);

    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('activity', activity);
    formData.append('work_description', workDescription);
    formData.append('work_detail', plannedTask);

    if (logoUri) {
      const filename = logoUri.split('/').pop();
      const fileType = filename?.split('.').pop();
      formData.append('profile', {
        uri: logoUri,
        name: filename || 'profile.jpg',
        type: `image/${fileType || 'jpeg'}`,
      } as any);
    }

    console.log('🛰 Илгээж буй API URL:', `${BASE_URL}/api/safety-engineer/makeGroup`);
    console.log('📤 FormData бэлэн!');

    const response = await axios.post(
      `${BASE_URL}/api/safety-engineer/makeGroup`, // ✅ Зөв бичсэн байгааг шалгав
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ Бүлэг амжилттай үүслээ:', response.data);
    Alert.alert('Амжилттай', 'Бүлэг амжилттай үүслээ!');
    onGroupCreated(); // ✅ Refresh хийх callback дуудна

    modalRef.current?.close();
  } catch (error: any) {
    console.error('❌ Хадгалах алдаа:', error);

    if (error.response) {
      // Серверээс ирсэн алдаа
      console.log('📡 Алдаа хариу:', error.response.data);
      console.log('📡 Алдаа статус код:', error.response.status);
    } else if (error.request) {
      // Request явсан боловч хариу ирээгүй
      console.log('📭 Request илгээгдсэн боловч хариу ирсэнгүй');
      console.log(error.request);
    } else {
      // Axios setup буруу эсвэл сүлжээний асуудал
      console.log('⚡ Алдааны мессеж:', error.message);
    }

    Alert.alert('Алдаа', 'Бүлэг үүсгэхэд алдаа гарлаа');
  }
};


  return (
    <>
      <Modalize ref={modalRef} snapPoint={750} modalHeight={750}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => modalRef.current?.close()}>
              <Ionicons name="arrow-back" size={24} color="#2F487F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Бүлэг үүсгэх</Text>
          </View>

          {/* Group Name */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Бүлгийн нэр</Text>
            <TextInput style={styles.input} placeholder="Бүлгийн нэр" value={groupName} onChangeText={setGroupName} placeholderTextColor="#999" />
          </View>

          {/* Activity */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Үйл ажиллагаа</Text>
            <TextInput style={styles.input} placeholder="Үйл ажиллагаа" value={activity} onChangeText={setActivity} placeholderTextColor="#999"/>
          </View>

          {/* Planned Task */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Төлөвлөсөн ажил</Text>
            <TextInput style={styles.input} placeholder="Төлөвлөсөн ажил" value={plannedTask} onChangeText={setPlannedTask} placeholderTextColor="#999"/>
          </View>

          {/* Work Description */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Ажлын тайлбар</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Тайлбар бичих"
              multiline
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholderTextColor="#999"
            />
          </View>

          {/* Logo Upload */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Профайл зураг</Text>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.imagePreview} />
            ) : (
              <Text style={{ marginBottom: 10, color: '#888' }}>Зураг сонгоогүй байна</Text>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Зураг сонгох</Text>
            </TouchableOpacity>
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
            <Text style={styles.saveButtonText}>Хадгалах</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modalize>

    </>
  );
});

export default GroupAddModal;

const styles = StyleSheet.create({
  container: { padding: 20 , paddingBottom: 160 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '500', marginLeft: 10, color: '#2F487F' },
  inputBox: { marginBottom: 20 },
  label: { fontSize: 14, color: 'black', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  saveButton: { backgroundColor: '#2F487F', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  imagePreview: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  uploadButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 8, alignItems: 'center' },
  uploadButtonText: { color: '#333', fontWeight: '500' },
});
