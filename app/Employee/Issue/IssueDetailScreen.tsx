// app/Employee/Issue/EditIssueScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions, Platform, StatusBar, ActivityIndicator
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../../src/config';

const screenWidth = Dimensions.get('window').width;
const SAFE_TOP = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 18;

const statusColors: any = {
  pending: '#FCF6DF',
  in_progress: '#D0E7F6',
  resolved: '#C9F7DF'
};
const statusTextColors: any = {
  pending: '#D3B100',
  in_progress: '#2196F3',
  resolved: '#2BC48A'
};
const statusLabels: any = {
  pending: 'Хүлээгдэж байгаа',
  in_progress: 'Засаж байгаа',
  resolved: 'Шийдэгдсэн'
};

const EditIssueScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState<string>('pending');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cause, setCause] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  useEffect(() => { fetchIssue(); }, []);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setIssue(data);
      setStatus(data.status);
      setDescription(data.description || '');
      setLocation(data.location || '');
      setCause(data.cause || '');
      setImages(data.images || []);
    } catch (err) {
      Alert.alert('Алдаа', 'Мэдээлэл татаж чадсангүй.');
    } finally {
      setLoading(false);
    }
  };

  const addImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Танд зураг нэмэх эрх байхгүй байна!");
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false
    });
    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setImages([...images, { image_url: pickerResult.assets[0].uri, local: true }]);
    }
  };

  const removeImage = (idx: number) => {
    const removed = images[idx];
    if (removed.id) {
      setDeletedImageIds(prev => [...prev, removed.id]);
    }
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const formData = new FormData();

    formData.append('status', status);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('cause', cause);

    deletedImageIds.forEach(id => {
      formData.append('deletedImageIds[]', String(id));
    });

    images.forEach((img, idx) => {
      if (img.local && img.image_url) {
        formData.append('images', {
          uri: img.image_url,
          name: `photo_${Date.now()}_${idx}.jpg`,
          type: 'image/jpeg'
        } as any);
      }
    });

    try {
      const res = await fetch(`${BASE_URL}/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to save');
      Alert.alert('Амжилттай', 'Амжилттай хадгаллаа!');
      setDeletedImageIds([]);
      fetchIssue();
    } catch (err) {
      Alert.alert('Алдаа', 'Мэдээлэл хадгалах үед алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Устгах уу?', 'Энэ зөрчлийг бүрмөсөн устгах уу?', [
        { text: 'Үгүй', style: 'cancel' },
        {
          text: 'Тийм', style: 'destructive', onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('userToken');
              const res = await fetch(`${BASE_URL}/api/issues/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (!res.ok) throw new Error('Failed to delete');
              Alert.alert('Амжилттай', 'Устгагдлаа!');
              router.back();
            } catch (err) {
              Alert.alert('Алдаа', 'Устгах үед алдаа гарлаа.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderStatus = () => (
    <TouchableOpacity
      style={[styles.statusChip, { backgroundColor: statusColors[status] }]}
      onPress={() => setStatusOpen(true)}
      activeOpacity={0.85}
    >
      <Text style={{ color: statusTextColors[status], fontWeight: '700', fontSize: 15 }}>
        {statusLabels[status]}
      </Text>
      <Ionicons name="chevron-down" size={16} color={statusTextColors[status]} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#294478" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      {/* Header & Tabs */}
      <View style={[styles.headerWrapper, { paddingTop: SAFE_TOP }]}>
        <View style={styles.topBarRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.closeText}>Хаах</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, styles.tabActiveBtn]}
            activeOpacity={0.85}
          >
            <Text style={[styles.tab, styles.tabActive]}>
              Дэлгэрэнгүй
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() =>
              router.push(
                `/Employee/Issue/IssueChat?id=${id}&title=${encodeURIComponent(issue?.title || '')}`
              )
            }
            activeOpacity={0.85}
          >
            <Text style={styles.tab}>
              Шийдэл
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Feather name="check-square" size={20} color="#294478" />
            <Text style={styles.cardTitle}>Асуудал</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleDelete}>
              <Feather name="trash-2" size={20} color="#294478" />
            </TouchableOpacity>
          </View>
          <Text style={styles.issueTitle}>{issue?.title || 'Ус алдсан'}</Text>
          <View style={styles.statusRow}>
            {renderStatus()}
            <DropDownPicker
              open={statusOpen}
              value={status}
              setOpen={setStatusOpen}
              setValue={setStatus}
              items={[
                { label: 'Хүлээгдэж байгаа', value: 'pending' },
                { label: 'Засаж байгаа', value: 'in_progress' },
                { label: 'Шийдэгдсэн', value: 'resolved' }
              ]}
              listMode="SCROLLVIEW"
              style={{ display: 'none' }}
            />
          </View>
          <Text style={styles.label}>Тайлбар</Text>
          <TextInput
            style={[styles.input, { minHeight: 44, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="..."
            placeholderTextColor="#B6BBC7"
            multiline={true}
          />
          <Text style={styles.label}>Хаана болсон</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="..."
            placeholderTextColor="#B6BBC7"
          />
          <Text style={styles.label}>Юунаас болсон</Text>
          <TextInput
            style={styles.input}
            value={cause}
            onChangeText={setCause}
            placeholder="..."
            placeholderTextColor="#B6BBC7"
          />

          <Text style={styles.label}>Зураг</Text>
          <View style={styles.imagesRow}>
            <TouchableOpacity style={styles.addImageBox} onPress={addImage}>
              <Feather name="plus" size={32} color="#294478" />
            </TouchableOpacity>
            {images.map((img, i) => (
              <View key={i} style={styles.imageWrap}>
                <Image source={{ uri: img.image_url || img.uri }} style={styles.image} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Feather name="minus-circle" size={22} color="#D43D21" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Хадгалах</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditIssueScreen;

// ...styles яг өмнөх шигээ
const CARD_RADIUS = 20;
const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
    zIndex: 10,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 18,
    marginBottom: 2,
  },
  closeText: {
    color: '#274780',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: 0.2,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F4F7FE',
    padding: 3,
    borderRadius: 13,
    marginHorizontal: 14,
    marginTop: 2,
    marginBottom: 1,
    alignSelf: 'stretch',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  tabActiveBtn: {
    backgroundColor: '#fff',
    shadowColor: '#284078',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 1,
  },
  tab: {
    fontSize: 16,
    color: '#1F2653',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabActive: {
    color: '#2F487F',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 22,
    width: '94%',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#294478',
    fontWeight: '600',
    marginLeft: 8,
  },
  issueTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginVertical: 3,
    marginBottom: 8
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 12,
    minHeight: 33
  },
  label: {
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#F7F9FB',
    borderRadius: 12,
    borderColor: '#E5E8F3',
    borderWidth: 1,
    padding: 13,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    color: '#909090',
    textAlignVertical: 'top',
  },
  imagesRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, gap: 12 },
  addImageBox: {
    width: 90, height: 90,
    borderRadius: 16,
    backgroundColor: '#F3F5FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E9F2',
    marginRight: 6
  },
  imageWrap: { position: 'relative', marginRight: 6 },
  image: {
    width: 90, height: 90,
    borderRadius: 15,
    backgroundColor: '#F2F3FA'
  },
  removeBtn: {
    position: 'absolute', top: -12, right: -12,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    padding: 2,
  },
  saveButton: {
    backgroundColor: '#294478',
    marginTop: 17,
    borderRadius: 13,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#284078',
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: 1.2,
  }
});
