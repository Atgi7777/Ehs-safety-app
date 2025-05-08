import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../../components/EngineerComponents/Header';
import MediaPickerModal, { MediaPickerModalRef } from '../../components/modals/ModalFile';

const AddInstructionDetail = () => {
  const router = useRouter();
  const { instructionId } = useLocalSearchParams(); // ирсэн дугаар
  const mediaPickerRef = useRef<MediaPickerModalRef>(null);

  const [pages, setPages] = useState([{ id: 1, description: '', file: null as string | null }]);
  const [location, setLocation] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  const handlePickLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Байршлын зөвшөөрөл олгоно уу');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const coords = `${loc.coords.latitude.toFixed(5)}°N ${loc.coords.longitude.toFixed(5)}°E`;
    setLocation(coords);
  };

  const handlePickImage = async () => {
    if (selectedPageIndex === null) return;
  
    // ✅ 1. Permission шалгах
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Анхаар', 'Зураг сонгохын тулд permission шаардлагатай!');
      return;
    }
  
    try {
      // ✅ 2. Зураг сонгох
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7,
      });
  
      // ✅ 3. canceled болон assets шалгах
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Сонгосон файл байхгүй');
        return;
      }
  
      const updatedPages = [...pages];
      updatedPages[selectedPageIndex].file = result.assets[0].uri;
      setPages(updatedPages);
    } catch (error) {
      console.error('Зураг сонгоход алдаа:', error);
      Alert.alert('Алдаа', 'Зураг сонгоход алдаа гарлаа.');
    }
  };
  

  const handleAddPage = () => {
    const newPage = { id: pages.length + 1, description: '', file: null };
    setPages([...pages, newPage]);
  };

  const openMediaPicker = (index: number) => {
    setSelectedPageIndex(index);
    mediaPickerRef.current?.open();
  };

  const handleSave = async () => {
    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.file) continue;

        const formData = new FormData();
        formData.append('description', page.description);
        formData.append('page_order', String(i + 1));
        formData.append('location', location);

        const uri = page.file;
        const extension = uri.split('.').pop()?.toLowerCase();

        let mimeType = 'application/octet-stream';
        if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'mp3') mimeType = 'audio/mpeg';
        else if (extension === 'wav') mimeType = 'audio/wav';
        else if (extension === 'mp4') mimeType = 'video/mp4';
        else if (extension === 'webm') mimeType = 'video/webm';

        formData.append('file', {
          uri,
          name: `file_${Date.now()}.${extension}`,
          type: mimeType,
        } as any);

        await fetch(`http://localhost:5050/api/safety-engineer/instruction/${instructionId}/pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
      }

      Alert.alert('Амжилттай', 'Хуудаснууд хадгалагдлаа');
      router.push('/Engineer/Tabs/ReportScreen');
    } catch (err) {
      console.error(err);
      Alert.alert('Алдаа', 'Хадгалах үед алдаа гарлаа');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5FE' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="#2F487F" />
          <Text style={styles.headerTitle}>Зааварчилгаа үүсгэх</Text>
        </View>

        {pages.map((page, index) => (
          <View key={page.id} style={styles.section}>
            <Text style={styles.label}>Тайлбар</Text>
            <TextInput
              multiline
              style={styles.textarea}
              placeholder="Текст"
              value={page.description}
              onChangeText={(text) => {
                const updatedPages = [...pages];
                updatedPages[index].description = text;
                setPages(updatedPages);
              }}
            />

            <TouchableOpacity style={styles.selectLocation} onPress={handlePickLocation}>
              <Ionicons name="location" size={16} color="#fff" />
              <Text style={styles.locationText}>{location || 'Байршил авах'}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 20 }]}>Файл хавсаргах</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => openMediaPicker(index)}>
              {page.file ? (
                <>
                  <Image source={{ uri: page.file }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      const updatedPages = [...pages];
                      updatedPages[index].file = null;
                      setPages(updatedPages);
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="red" />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={{ textAlign: 'center', color: '#999' }}>+ Файл оруулах</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addPageButton} onPress={handleAddPage}>
          <Ionicons name="add" size={20} color="#2F487F" />
          <Text style={styles.addPageText}>Хуудас нэмэх</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Хадгалах</Text>
        </TouchableOpacity>
      </ScrollView>

      <MediaPickerModal ref={mediaPickerRef} onPickImage={handlePickImage} />
    </View>
  );
};

export default AddInstructionDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2F487F',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },
  selectLocation: {
    flexDirection: 'row',
    backgroundColor: '#2F487F',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    color: '#fff',
    marginLeft: 5,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 100,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  addPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  addPageText: {
    color: '#2F487F',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2F487F',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
