import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ReportIssueScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cause, setCause] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]); // 🆕 Олон зураг

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true, // 🆕 олон зураг сонгоно
      selectionLimit: 5, // Хүсвэл 5 зураг л зөвшөөрч болно
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      setImageUris((prev) => [...prev, ...uris]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !cause) {
      Alert.alert('Алдаа', 'Бүх талбараа бөглөнө үү!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token олдсонгүй.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('cause', cause);

      imageUris.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const ext = match ? match[1] : 'jpg';
        const mimeType = `image/${ext}`;

        formData.append('images', {
          uri,
          name: filename,
          type: mimeType,
        } as any);
      });

      const res = await fetch(`${BASE_URL}/api/issues`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseText = await res.text();
      console.log('⚡ Server response:', responseText);

      if (res.ok) {
        Alert.alert('Амжилттай', 'Мэдэгдэл илгээгдлээ!');
        router.back();
      } else {
        console.error('Илгээх алдаа:', responseText);
        Alert.alert('Алдаа', 'Илгээхэд алдаа гарлаа.');
      }
    } catch (error) {
      console.error('Алдаа:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Асуудал мэдэгдэх</Text>

      <Input label="Гарчиг" value={title} onChangeText={setTitle} />
      <Input label="Тайлбар" value={description} onChangeText={setDescription} multiline />
      <Input label="Хаана болсон" value={location} onChangeText={setLocation} />
      <Input label="Юунаас болсон" value={cause} onChangeText={setCause} multiline />

      <Text style={styles.label}>Зураг хавсаргах (сонголттой)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        <Ionicons name="images-outline" size={40} color="#2F487F" />
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        {imageUris.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.previewImage} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Илгээх</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Буцах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Input = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F8FAFF' , paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: '500', color: '#2F487F', marginBottom: 20, textAlign: 'center' },
  inputBox: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#2F487F', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderColor: '#E0E0E0', borderWidth: 1, padding: 12, fontSize: 16 },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  imagePicker: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', height: 150, marginBottom: 24 },
  previewImage: { width: 100, height: 100, marginRight: 10, borderRadius: 8 },
  submitButton: { backgroundColor: '#2F487F', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { backgroundColor: '#f1f1f1', paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
  backButtonText: { fontSize: 16, fontWeight: '600', color: 'black' },
});

export default ReportIssueScreen;
