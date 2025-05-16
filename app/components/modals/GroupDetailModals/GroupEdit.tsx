import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../../../src/config';

const EditGroup = () => {
  const params = useLocalSearchParams();
  const groupId = params?.groupId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workDetail, setWorkDetail] = useState('');
  const [status, setStatus] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [nameHeight, setNameHeight] = useState(48);
  const [activityHeight, setActivityHeight] = useState(48);
  const [workDescriptionHeight, setWorkDescriptionHeight] = useState(100);
  const [workDetailHeight, setWorkDetailHeight] = useState(100);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        if (!groupId) return;
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

    fetchGroup();
  }, [groupId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Анхаар', 'Зураг сонгохын тулд зөвшөөрөл хэрэгтэй!');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Зураг сонгоогүй');
        return;
      }
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
      } as any);
    }

    try {
      if (!groupId) return;
      const res = await fetch(`${BASE_URL}/api/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
  Toast.show({
    type: 'success',
    text1: 'Амжилттай',
    text2: 'Мэдээлэл амжилттай шинэчлэгдлээ 🎉',
  });

  router.push({
    pathname: '/components/modals/GroupDetailModals/GroupModals',
    params: { groupId: groupId.toString(), refresh: Date.now().toString() }, // refresh дамжуулж өгөв
  });

} else {
  Toast.show({
    type: 'error',
    text1: 'Алдаа',
    text2: result.message || 'Шинэчлэхэд алдаа гарлаа',
  });
}

    } catch (err) {
      console.error('Шинэчлэхэд алдаа:', err);
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Сүлжээний алдаа эсвэл сервер ажиллахгүй байна',
      });
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#2F487F" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : group?.profile?.image
                ? { uri: `${BASE_URL}${group.profile.image}` }
                : require('@/assets/images/people.png')
            }
           style={[
      styles.groupImage,
      (!imageUri && !group?.profile?.image) && styles.defaultImage, // 🔥 Зөвхөн default зурган дээр нэмэлт стиль
    ]}
    />
          <Text style={styles.changePhotoText}>Зураг солих</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Нэр</Text>
        <TextInput
          style={[styles.input, { height: nameHeight }]}
          value={name}
          onChangeText={setName}
          multiline
          onContentSizeChange={(e) =>
            setNameHeight(Math.max(48, e.nativeEvent.contentSize.height))
          }
        />

        <Text style={styles.label}>Ажлын чиглэл</Text>
        <TextInput
          style={[styles.input, { height: activityHeight }]}
          value={activity}
          onChangeText={setActivity}
          multiline
          onContentSizeChange={(e) =>
            setActivityHeight(Math.max(48, e.nativeEvent.contentSize.height))
          }
        />

        <Text style={styles.label}>Ажлын товч тайлбар</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, maxHeight: 300, height: workDescriptionHeight, textAlignVertical: 'top' }]}
          value={workDescription}
          onChangeText={setWorkDescription}
          multiline
          onContentSizeChange={(e) =>
            setWorkDescriptionHeight(Math.max(100, Math.min(300, e.nativeEvent.contentSize.height)))
          }
        />

        <Text style={styles.label}>Ажлын дэлгэрэнгүй</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, maxHeight: 300, height: workDetailHeight, textAlignVertical: 'top' }]}
          value={workDetail}
          onChangeText={setWorkDetail}
          multiline
          onContentSizeChange={(e) =>
            setWorkDetailHeight(Math.max(100, Math.min(300, e.nativeEvent.contentSize.height)))
          }
        />

        <Text style={styles.label}>Статус</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.pickerStyle}
            dropdownIconColor="#374151"
          >
            <Picker.Item label="Active" value="active" color="#111827" />
            <Picker.Item label="Inactive" value="inactive" color="#111827" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Хадгалах</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  defaultImage: {
  backgroundColor: '#f1f5f9',  // Default цайвар саарал фон
padding: 20 , // цайвар саарал хүрээ
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
    borderColor: 'white',
    backgroundColor: '#f1f5f9',
    
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 16,
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
  pickerContainer: {
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    justifyContent: 'center',
    height: 50,
  },
  pickerStyle: {
    width: '100%',
    // color: '#111827',
    fontSize: 12,
    padding: 12,
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
    fontWeight: '500',
    fontSize: 16,
  },
});
