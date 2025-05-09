import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/config';

type Instruction = {
  title: string;
  number: string;
  description: string;
  start_date: string;
  end_date: string;
};

type InstructionPage = {
  id?: number;
  safetyInstruction_id?: number;
  page_order: number;
  description: string;
  location: string;
  image_url: string;
  audio_url: string | null;
  video_url: string | null;
};

export default function EditInstructionScreen() {
  const { instructionId } = useLocalSearchParams<{ instructionId: string }>();
  const router = useRouter();

  const [instruction, setInstruction] = useState<Instruction>({
    title: '',
    number: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [pages, setPages] = useState<InstructionPage[]>([]);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    fetchInstruction();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const fetchInstruction = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/with-pages`);
    setInstruction({
      title: res.data.title,
      number: res.data.number.toString(),
      description: res.data.description,
      start_date: res.data.start_date.split('T')[0],
      end_date: res.data.end_date.split('T')[0],
    });

    const updatedPages = (res.data.InstructionPages || []).map((page: InstructionPage) => ({
      ...page,
      image_url: page.image_url ? `${BASE_URL}/${page.image_url}` : '',
      video_url: page.video_url ? `${BASE_URL}/${page.video_url}` : '',
      audio_url: page.audio_url ? `${BASE_URL}/${page.audio_url}` : '',
    }));

    setPages(updatedPages);
  } catch (error) {
    console.error(error);
    Alert.alert('Алдаа', 'Мэдээлэл авахад алдаа гарлаа');
  }
};


  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return '';
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      return `${coords.latitude.toFixed(5)}°N ${coords.longitude.toFixed(5)}°E`;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const updated = [...pages];
      updated[index].image_url = result.assets[0].uri;
      setPages(updated);
    }
  };

  const pickVideo = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!result.canceled) {
      const updated = [...pages];
      updated[index].video_url = result.assets[0].uri;
      setPages(updated);
    }
  };

  const pickAudio = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if ('uri' in result && typeof result.uri === 'string') {
      const updated = [...pages];
      updated[index].audio_url = result.uri;
      setPages(updated);
    }
  };

  const playSound = async (uri: string) => {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    await newSound.playAsync();
  };

  const onSave = async () => {
    const formData = new FormData();

    formData.append(
      'data',
      JSON.stringify({
        title: instruction.title,
        number: parseInt(instruction.number),
        description: instruction.description,
        start_date: instruction.start_date,
        end_date: instruction.end_date,
        pages: pages.map((p, i) => ({
          description: p.description,
          location: p.location,
          page_order: i + 1,
        })),
      })
    );

    pages.forEach((page, index) => {
      if (page.image_url?.startsWith('file://')) {
        formData.append(`image_url_${index}`, {
          uri: page.image_url,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      }

      if (page.video_url?.startsWith('file://')) {
        formData.append(`video_url_${index}`, {
          uri: page.video_url,
          type: 'video/mp4',
          name: `video_${index}.mp4`,
        } as any);
      }

      if (page.audio_url?.startsWith('file://')) {
        formData.append(`audio_url_${index}`, {
          uri: page.audio_url,
          type: 'audio/mpeg',
          name: `audio_${index}.mp3`,
        } as any);
      }
    });

    try {
      await axios.put(`${BASE_URL}/api/instruction/${instructionId}/with-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Амжилттай', 'Шинэчлэгдлээ');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Алдаа', 'Хадгалах үед алдаа гарлаа');
    }
  };

  const addPage = () => {
    setPages([
      ...pages,
      {
        page_order: pages.length + 1,
        description: '',
        location: '',
        image_url: '',
        audio_url: '',
        video_url: '',
      },
    ]);
  };

  const removePage = (index: number) => {
    const updated = [...pages];
    updated.splice(index, 1);
    setPages(updated.map((p, i) => ({ ...p, page_order: i + 1 })));
  };

  const fieldKeys: (keyof Instruction)[] = ['title', 'number', 'description'];

  return (
    <View style={{ flex: 1, backgroundColor: '#f7fafa', paddingTop: 60 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#004aad" />
        </TouchableOpacity>
        <Text style={styles.title}>Зааварчилгаа засах</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Үндсэн мэдээлэл</Text>
            {fieldKeys.map((key) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={
                  key === 'title' ? 'Гарчиг' : key === 'number' ? 'Дугаар' : 'Тайлбар'
                }
                value={instruction[key]}
                onChangeText={(text) => setInstruction({ ...instruction, [key]: text })}
              />
            ))}

            <Text style={styles.sectionTitle}>Хугацаа</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Эхлэх огноо</Text>
                <Text style={styles.dateValue}>{instruction.start_date}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Дуусах огноо</Text>
                <Text style={styles.dateValue}>{instruction.end_date}</Text>
              </TouchableOpacity>
            </View>
            {showStart && (
              <DateTimePicker
                value={new Date(instruction.start_date)}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStart(false);
                  if (selectedDate) {
                    setInstruction({
                      ...instruction,
                      start_date: selectedDate.toISOString().split('T')[0],
                    });
                  }
                }}
              />
            )}
            {showEnd && (
              <DateTimePicker
                value={new Date(instruction.end_date)}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEnd(false);
                  if (selectedDate) {
                    setInstruction({
                      ...instruction,
                      end_date: selectedDate.toISOString().split('T')[0],
                    });
                  }
                }}
              />
            )}
          </>
        }
        data={pages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.pageCard}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Хуудас {index + 1}</Text>
              <TouchableOpacity onPress={() => removePage(index)}>
                <Ionicons name="remove-circle" size={22} color="red" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Тайлбар"
              value={item.description}
              onChangeText={(text) => {
                const updated = [...pages];
                updated[index].description = text;
                setPages(updated);
              }}
            />

            <TouchableOpacity
              style={styles.locationButton}
              onPress={async () => {
                const loc = await getCurrentLocation();
                const updated = [...pages];
                updated[index].location = loc;
                setPages(updated);
              }}
            >
              <Ionicons name="location-outline" size={18} color="#004aad" />
              <Text style={styles.locationText}>Байршил авах</Text>
            </TouchableOpacity>
            {item.location ? (
              <Text style={styles.locationDisplay}>📍 {item.location}</Text>
            ) : (
              <Text style={styles.locationPlaceholder}>Байршил сонгогдоогүй</Text>
            )}

            <View style={styles.mediaButtonRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={() => pickImage(index)}>
                <Ionicons name="image-outline" size={18} color="#004aad" />
                <Text style={styles.mediaText}>Image</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton} onPress={() => pickVideo(index)}>
                <Ionicons name="videocam-outline" size={18} color="#004aad" />
                <Text style={styles.mediaText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton} onPress={() => pickAudio(index)}>
                <Ionicons name="musical-notes-outline" size={18} color="#004aad" />
                <Text style={styles.mediaText}>Audio</Text>
              </TouchableOpacity>
            </View>

            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.mediaPreview} />
            ) : null}

            {item.video_url ? (
              <Video
                source={{ uri: item.video_url }}
                style={styles.mediaPreview}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : null}

            {item.audio_url ? (
              <View style={styles.audioContainer}>
                <Text numberOfLines={1} style={styles.audioLabel}>
                  {item.audio_url.split('/').pop()}
                </Text>
                <TouchableOpacity onPress={() => playSound(item.audio_url!)}>
                  <Text style={styles.playAudio}>▶️ Play</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <>
            <TouchableOpacity onPress={addPage} style={styles.addPageButton}>
              <Ionicons name="add-circle" size={24} color="#004aad" />
              <Text style={styles.addPageText}>Хуудас нэмэх</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Хадгалах</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    marginVertical: 8, borderRadius: 8, fontSize: 16, backgroundColor: '#fff',
    marginHorizontal: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '500', margin: 16, color: '#333' },
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  dateInputContainer: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, backgroundColor: '#fff',
  },
  dateLabel: { fontSize: 12, color: '#777' },
  dateValue: { fontSize: 16, color: '#000' },
  pageCard: {
    margin: 16, padding: 16, backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#ddd',
  },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pageTitle: { fontWeight: '600', fontSize: 16 },
  locationButton: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, backgroundColor: '#eef3ff',
    borderRadius: 8, marginBottom: 8,
  },
  locationText: { marginLeft: 6, color: '#004aad', fontWeight: '500' },
  locationDisplay: { color: '#007b2f', marginTop: 4 },
  locationPlaceholder: { color: '#999', fontStyle: 'italic', marginTop: 4 },
  mediaButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  mediaButton: {
    flexBasis: '30%', padding: 12, alignItems: 'center',
    backgroundColor: '#eef3ff', borderRadius: 8,
  },
  mediaText: { color: '#004aad', fontWeight: '600' },
  mediaPreview: { height: 180, borderRadius: 8, marginTop: 8, backgroundColor: '#eee' },
  audioContainer: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  audioLabel: { flex: 1, color: '#444' },
  playAudio: { color: '#007b2f', fontWeight: '500' },
  addPageButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    margin: 16, padding: 10, backgroundColor: '#e0eaff', borderRadius: 8,
  },
  addPageText: { marginLeft: 6, color: '#004aad', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#004aad', marginHorizontal: 16, marginBottom: 30,
    padding: 16, borderRadius: 10, alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: '500', fontSize: 16 },
});
