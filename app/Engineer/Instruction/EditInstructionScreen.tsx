import React, { useEffect, useState } from 'react';
import {
View, Text, TextInput, StyleSheet, TouchableOpacity,
ActivityIndicator, Alert, ScrollView, Image, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';


const BASE_URL = Platform.OS === 'ios' ? 'http://127.0.0.1:5050' : 'http://10.0.2.2:5050';

export default function EditInstructionScreen() {
 const { instructionId } = useLocalSearchParams();
 const router = useRouter();
 const [showStartPicker, setShowStartPicker] = useState(false);
const [showEndPicker, setShowEndPicker] = useState(false);


 const [instruction, setInstruction] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 const fetchInstruction = async () => {
   try {
     const token = await AsyncStorage.getItem('userToken');
     const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/with-pages`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     setInstruction(res.data);
   } catch (err) {
     Alert.alert('Алдаа', 'Мэдээлэл татахад алдаа гарлаа');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => { fetchInstruction(); }, []);

 const handleBack = () => router.back();
 // Хуудас хасах
 const deletePage = async (index: number) => {
   const page = instruction.InstructionPages[index];
    // шинэ хуудас бол зөвхөн локалуудаас устгана
   if (page.isNew) {
     const updatedPages = [...instruction.InstructionPages];
     updatedPages.splice(index, 1);
     setInstruction({ ...instruction, InstructionPages: updatedPages });
     return;
   }
    try {
     const token = await AsyncStorage.getItem('userToken');
     await axios.delete(`${BASE_URL}/api/instruction/instruction-pages/${page.id}`, {
       headers: { Authorization: `Bearer ${token}` },
     });
      const updatedPages = [...instruction.InstructionPages];
     updatedPages.splice(index, 1);
     setInstruction({ ...instruction, InstructionPages: updatedPages });
     Alert.alert('Амжилттай', 'Хуудас устгагдлаа');
   } catch (err) {
     console.error(err);
     Alert.alert('Алдаа', 'Хуудас устгах үед алдаа гарлаа');
   }
 };
  const formatDate = (iso: string) => {
   const date = new Date(iso);
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
 };
 


 const pickFile = async (type: 'image' | 'video' | 'audio', index: number) => {
  let mediaType: any = ImagePicker.MediaTypeOptions.All;
  if (type === 'image') mediaType = ImagePicker.MediaTypeOptions.Images;
  else if (type === 'video') mediaType = ImagePicker.MediaTypeOptions.Videos;

  // 1. Permission шалгах
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Зөвшөөрөл', 'Медиа оруулахын тулд зөвшөөрөл шаардлагатай.');
    return;
  }

  try {
    // 2. Picker ажиллуулах
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      quality: 0.7,
      allowsEditing: true,
    });

    // 3. canceled болон assets шалгах
    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('Файл сонгоогүй');
      return;
    }

    const file = result.assets[0];
    const formData = new FormData();
    const fileExt = file.uri.split('.').pop() || 'jpg';

    const mimeType = {
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/mpeg',
    }[type] || 'application/octet-stream';

    formData.append('file', {
      uri: file.uri,
      name: `${type}-${Date.now()}.${fileExt}`,
      type: mimeType,
    } as any);

    const token = await AsyncStorage.getItem('userToken');
    const uploadRes = await axios.post(`${BASE_URL}/uploads`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const updatedPages = [...instruction.InstructionPages];
    updatedPages[index][`${type}_url`] = uploadRes.data.url;
    setInstruction({ ...instruction, InstructionPages: updatedPages });
  } catch (err) {
    console.error(err);
    Alert.alert('Алдаа', `${type.toUpperCase()} оруулах үед алдаа гарлаа`);
  }
};

 
 
 

 const addNewPage = () => {
   const updatedPages = [...instruction.InstructionPages];
   updatedPages.push({
     id: `temp-${Date.now()}`,
     safetyInstruction_id: instruction.id,
     description: '',
     page_order: updatedPages.length + 1,
     location: '',
     image_url: '',
     video_url: '',
     audio_url: '',
     isNew: true,
   });
   setInstruction({ ...instruction, InstructionPages: updatedPages });
 };
 const getCurrentLocation = async (index: number) => {
   try {
     const { status } = await Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
       Alert.alert('Зөвшөөрөл', 'Байршлын зөвшөөрөл олгогдоогүй байна');
       return;
     }
      const location = await Location.getCurrentPositionAsync({});
     const { latitude, longitude } = location.coords;
      const updatedPages = [...instruction.InstructionPages];
     updatedPages[index].location = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
     setInstruction({ ...instruction, InstructionPages: updatedPages });
   } catch (err) {
     Alert.alert('Алдаа', 'Байршил тодорхойлоход алдаа гарлаа');
   }
 };

 const handleUpdate = async () => {
   try {
     const token = await AsyncStorage.getItem('userToken');
      // Эхлээд үндсэн instruction-оо шинэчилнэ
     await axios.put(
       `${BASE_URL}/api/instruction/${instructionId}`,
       {
         title: instruction.title,
         number: parseInt(instruction.number),
         description: instruction.description,
         start_date: instruction.start_date,
         end_date: instruction.end_date,
       },
       { headers: { Authorization: `Bearer ${token}` } }
     );
      // Instruction хуудаснууд
     for (const page of instruction.InstructionPages) {
       if (page.isNew) {
         // 🟩 FormData ашиглаж файлтай POST илгээх
         const formData = new FormData();
          formData.append('description', page.description);
         formData.append('page_order', page.page_order.toString());
         formData.append('location', page.location);
          // файл оруулсан бол нэмэх
         ['image', 'video', 'audio'].forEach((type) => {
           const fileUri = page[`${type}_url`];
           if (fileUri && fileUri.startsWith('file://')) {
             const fileExt = fileUri.split('.').pop();
             let mimeType = 'application/octet-stream';
             if (type === 'image') mimeType = 'image/jpeg';
             else if (type === 'video') mimeType = 'video/mp4';
             else if (type === 'audio') mimeType = 'audio/mpeg';
              formData.append('file', {
               uri: fileUri,
               name: `${type}-${Date.now()}.${fileExt}`,
               type: mimeType,
             } as any);
           }
         });
          await axios.post(
           `${BASE_URL}/api/instruction/${instruction.id}/instruction-pages`,
           formData,
           {
             headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'multipart/form-data',
             },
           }
         );
       } else {
         // 🟨 Хуучин хуудсыг JSON payload ашиглаж PUT хийх
         const payload = {
           description: page.description,
           page_order: page.page_order,
           location: page.location,
           image_url: page.image_url,
           video_url: page.video_url,
           audio_url: page.audio_url,
         };
          await axios.put(
           `${BASE_URL}/api/instruction/instruction-pages/${page.id}`,
           payload,
           {
             headers: { Authorization: `Bearer ${token}` },
           }
         );
       }
     }
      Alert.alert('Амжилттай', 'Мэдээлэл хадгалагдлаа');
     router.back();
   } catch (err) {
     console.error(err);
     Alert.alert('Алдаа', 'Хадгалах үед алдаа гарлаа');
   }
 };
    
 if (loading || !instruction) {
   return (
     <View style={styles.centered}>
       <ActivityIndicator size="large" color="#2F487F" />
       <Text>Уншиж байна...</Text>
     </View>
   );
 }

 return (
<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
<View style={styles.topBar}>
       <TouchableOpacity onPress={handleBack}>
         <Ionicons name="arrow-back" size={26} color="#2F487F" />
       </TouchableOpacity>
       <Text style={styles.title}>Зааварчилгаа засах</Text>
     </View>

     <TextInput style={styles.input} placeholder="Гарчиг" value={instruction.title}
   onChangeText={(text) => setInstruction({ ...instruction, title: text })} />
 <TextInput style={styles.input} placeholder="Дугаар" keyboardType="numeric"
   value={instruction.number.toString()}
   onChangeText={(text) => setInstruction({ ...instruction, number: text })} />
 <TextInput style={[styles.input, { height: 80 }]} placeholder="Тайлбар" multiline
   value={instruction.description}
   onChangeText={(text) => setInstruction({ ...instruction, description: text })} />

{/* Эхлэх огноо */}
<TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
 <Text>Эхлэх огноо: {formatDate(instruction.start_date)}</Text>
</TouchableOpacity>
{showStartPicker && (
 <DateTimePicker
   mode="date"
   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
   value={new Date(instruction.start_date)}
   onChange={(event, selectedDate) => {
     setShowStartPicker(false);
     if (selectedDate) {
       setInstruction({ ...instruction, start_date: selectedDate.toISOString() });
     }
   }}
 />
)}

{/* Дуусах огноо */}
<TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
 <Text>Дуусах огноо: {formatDate(instruction.end_date)}</Text>
</TouchableOpacity>
{showEndPicker && (
 <DateTimePicker
   mode="date"
   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
   value={new Date(instruction.end_date)}
   onChange={(event, selectedDate) => {
     setShowEndPicker(false);
     if (selectedDate) {
       setInstruction({ ...instruction, end_date: selectedDate.toISOString() });
     }
   }}
 />
)}



 {instruction.InstructionPages.map((page: any, index: number) => (
   <View key={page.id} style={styles.pageBox}>
     <TouchableOpacity style={styles.deleteIcon} onPress={() => deletePage(index)}>
       <Ionicons name="remove-circle" size={24} color="#e74c3c" />
     </TouchableOpacity>
     <Text style={styles.pageTitle}>Хуудас {index + 1}</Text>

     <TextInput style={styles.input} placeholder="Дараалал" keyboardType="numeric"
       value={page.page_order.toString()}
       onChangeText={(text) => {
         const updated = [...instruction.InstructionPages];
         updated[index].page_order = parseInt(text);
         setInstruction({ ...instruction, InstructionPages: updated });
       }} />
     <TextInput style={[styles.input, { height: 70 }]} placeholder="Тайлбар" multiline
       value={page.description}
       onChangeText={(text) => {
         const updated = [...instruction.InstructionPages];
         updated[index].description = text;
         setInstruction({ ...instruction, InstructionPages: updated });
       }} />

<TouchableOpacity
 style={styles.mediaBtn}
 onPress={() => getCurrentLocation(index)}
>
 <Ionicons name="location-outline" size={18} color="#2F487F" />
 <Text style={styles.mediaText}>Байршил авах</Text>
</TouchableOpacity>

<Text style={{ margin: 6, fontStyle: 'italic', color: '#444' }}>
 {page.location || 'Байршил сонгогдоогүй'}
</Text>

     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
 {['image', 'video', 'audio'].map(type => {
   const iconMap: any = {
     image: 'image-outline',
     video: 'videocam-outline',
     audio: 'musical-notes-outline',
   };
   return (
     <TouchableOpacity
       key={type}
       style={[styles.mediaBtn, { flex: 1, marginRight: type !== 'audio' ? 8 : 0 }]}
       onPress={() => pickFile(type as any, index)}
     >
       <Ionicons name={iconMap[type]} size={18} color="#2F487F" />
       <Text style={styles.mediaText}>{type.toUpperCase()}</Text>
     </TouchableOpacity>
   );
 })}
</View>


     {page.image_url && (
       <Image source={{ uri: `${BASE_URL}/${page.image_url}` }} style={styles.imagePreview} />
     )}
   </View>
 ))}

 <TouchableOpacity style={styles.addBtn} onPress={addNewPage}>
   <Ionicons name="add-circle-outline" size={20} color="#2F487F" />
   <Text style={styles.mediaText}>Хуудас нэмэх</Text>
 </TouchableOpacity>

 <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
   <Ionicons name="save-outline" size={20} color="#fff" />
   <Text style={styles.saveText}>Хадгалах</Text>
 </TouchableOpacity>
</ScrollView>

 );
}

const styles = StyleSheet.create({
 container: { padding: 16, backgroundColor: '#F9FAFB', paddingBottom: 60 , paddingTop: 70 },
 topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
 title: { fontSize: 20, fontWeight: 'bold', marginLeft: 82, color: '#2F487F' },
 input: {
   backgroundColor: '#fff', borderRadius: 8, padding: 12,
   borderColor: '#D1D5DB', borderWidth: 1, marginBottom: 12,
 },
 pageBox: {
   backgroundColor: '#fff', borderRadius: 10,
   padding: 12, marginTop: 16, borderColor: '#ccc', borderWidth: 1,
 },
 pageTitle: { fontWeight: 'bold', marginBottom: 6 },
 mediaBtn: {
   flexDirection: 'row', alignItems: 'center', marginTop: 8,
   borderWidth: 1, borderColor: '#2F487F', padding: 8, borderRadius: 6,
 },
 mediaText: { marginLeft: 6, color: '#2F487F', fontWeight: '600' },
 imagePreview: {
   width: '100%', height: 150, borderRadius: 10, marginTop: 8,
 },
 addBtn: {
   flexDirection: 'row', alignItems: 'center', marginTop: 20,
   borderWidth: 1, borderColor: '#2F487F', padding: 10, borderRadius: 8, justifyContent: 'center',
 },
 saveBtn: {
   backgroundColor: '#2F487F', marginTop: 30,
   padding: 14, borderRadius: 10, flexDirection: 'row',
   justifyContent: 'center', alignItems: 'center',
 },
 saveText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
 centered:{padding : 8},
 deleteIcon: {
   position: 'absolute',
   top: 8,
   right: 8,
   zIndex: 1,
 },
 });


