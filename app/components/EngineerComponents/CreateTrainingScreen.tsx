import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
  TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert, Image,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../../../src/config'; // config замаа тааруулна уу

const API_URL = `${BASE_URL}/api/safety-trainings`;
const POSTER_BASE_URL = BASE_URL.replace('/api', '');

type Training = {
  id: number;
  title: string;
  description: string;
  location: string;
  training_date: string;
  duration_hours: number | null;
  organization_id: number;
  engineer_id: number;
  poster?: { url: string };
};

const TrainingCard: React.FC<{ item: Training }> = ({ item }) => (
  <View style={styles.card}>
    {!!item.poster?.url && (
      <Image
        source={{ uri: POSTER_BASE_URL + item.poster.url }}
        style={{ width: "100%", height: 140, borderRadius: 16, marginBottom: 10 }}
        resizeMode="cover"
      />
    )}
    <Text style={styles.title}>{item.title}</Text>
    <Text>{item.description}</Text>
    <Text>Байршил: {item.location}</Text>
    <Text>
      Огноо: {item.training_date?.slice(0, 10)} {item.training_date?.slice(11, 16)}
    </Text>
    <Text>Үргэлжлэх хугацаа: {item.duration_hours ?? "-"} цаг</Text>
  </View>
);

const App = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [poster, setPoster] = useState<any>(null);
  const [form, setForm] = useState<Partial<Training>>({
    title: "",
    description: "",
    location: "",
    duration_hours: undefined,
    organization_id: undefined,
    engineer_id: undefined,
  });

  // Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setForm(f => ({
          ...f,
          organization_id: user.organization_id,
          engineer_id: user.id
        }));
      }
    };
    loadUserInfo();
    fetchTrainings();
  }, []);

  function formatDate(date: Date | null) {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  }
  function formatTime(date: Date | null) {
    if (!date) return "";
    return moment(date).format("HH:mm");
  }
  function formatDateTime(date: Date | null, time: Date | null) {
    if (!date || !time) return "";
    const merged = moment(date)
      .hour(moment(time).hour())
      .minute(moment(time).minute());
    return merged.format("YYYY-MM-DD HH:mm");
  }

  const fetchTrainings = async () => {
    try {
      const res = await axios.get(API_URL);
      setTrainings(res.data);
    } catch {
      Alert.alert("Сургалтын жагсаалт татаж чадсангүй!");
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Gallery access хэрэгтэй!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPoster(result.assets[0]);
    }
  };

  const handleSave = async () => {
    const training_date = formatDateTime(selectedDate, selectedTime);
    if (!form.title || !form.location || !training_date) {
      Alert.alert("Анхаар", "Гарчиг, Байршил, Огноо, Цаг заавал!");
      return;
    }
    if (!form.organization_id || !form.engineer_id) {
      Alert.alert("Алдаа", "Байгууллага эсвэл хэрэглэгчийн мэдээлэл олдсонгүй!");
      return;
    }
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("location", form.location);
      formData.append("training_date", training_date);
      formData.append("duration_hours", form.duration_hours ? String(form.duration_hours) : "");
      formData.append("organization_id", String(form.organization_id));
      formData.append("engineer_id", String(form.engineer_id));
      if (poster) {
        formData.append("poster", {
          uri: poster.uri,
          name: poster.fileName || "poster.jpg",
          type: poster.type || "image/jpeg",
        } as any);
      }

      const res = await axios.post(API_URL, formData);

      setTrainings((prev) => [res.data, ...prev]);
      setModal(false);
      setPoster(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setForm({
        title: "",
        description: "",
        location: "",
        duration_hours: undefined,
        organization_id: form.organization_id,
        engineer_id: form.engineer_id,
      });
    } catch (e: any) {
      Alert.alert("Алдаа", e.response?.data?.message || "Сургалт үүсгэж чадсангүй");
    }
    setSaving(false);
  };

  return (
    <View style={{ flex: 1}}>
      <FlatList
        data={trainings}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => <TrainingCard item={item} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
            Одоогоор сургалт бүртгэгдээгүй байна.
          </Text>
        }
        ListFooterComponent={
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: '500', marginLeft: 7 }}>
                Хурал үүсгэх
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* --- Modal Dialog --- */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >

            <ScrollView>
              <Text style={styles.modalTitle}>Шинэ сургалт үүсгэх</Text>
              <TouchableOpacity style={styles.posterPicker} onPress={pickImage}>
                <Text style={{ color: "#1877cc" }}>
                  {poster ? "Зураг солих" : "Зураг сонгох"}
                </Text>
              </TouchableOpacity>
              {poster && (
                <Image
                  source={{ uri: poster.uri }}
                  style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 8 }}
                  resizeMode="cover"
                />
              )}
              <TextInput
                placeholder="Гарчиг"
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setForm({ ...form, title: v })}
                  placeholderTextColor="#787878" 

              />
              <TextInput
                placeholder="Тайлбар"
                style={styles.input}
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
             placeholderTextColor="#787878" 
             />
              <TextInput
                placeholder="Байршил"
                style={styles.input}
                value={form.location}
                onChangeText={(v) => setForm({ ...form, location: v })}
                placeholderTextColor="#787878" 
              />
              {/* ==== Огноо сонгох ==== */}
              <TouchableOpacity
                style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: selectedDate ? "#222" : "#aaa" }}>
                  {selectedDate ? formatDate(selectedDate) : "Огноо сонгох"}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#1877cc" />
              </TouchableOpacity>
              {/* ==== Цаг сонгох ==== */}
              <TouchableOpacity
                style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: selectedTime ? "#222" : "#aaa" }}>
                  {selectedTime ? formatTime(selectedTime) : "Цаг сонгох"}
                </Text>
                <Ionicons name="time-outline" size={18} color="#1877cc" />
              </TouchableOpacity>
              {/* ==== Date/Time Picker ==== */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="default"
                  is24Hour
                  onChange={(_, time) => {
                    setShowTimePicker(false);
                    if (time) setSelectedTime(time);
                  }}
                />
              )}
              <TextInput
                placeholder="Үргэлжлэх хугацаа (цаг)"
                style={styles.input}
                keyboardType="numeric"
                value={form.duration_hours ? String(form.duration_hours) : ""}
                onChangeText={(v) => setForm({ ...form, duration_hours: Number(v) })}
                placeholderTextColor="#787878" 
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 18 }}>
                <TouchableOpacity
                  onPress={() => {
                    setModal(false);
                    setPoster(null);
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }}
                  style={[styles.modalBtn, { backgroundColor: "#eee" }]}
                  disabled={saving}
                >
                  <Text style={{ color: "#555" }}>Хаах</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.modalBtn}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Хадгалах</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontWeight: "500", fontSize: 18, marginBottom: 4, color: '#2F487F'
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F487F",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    marginBottom : 80,
  },
  posterPicker: {
    alignSelf: "flex-end", marginBottom: 7, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 5, backgroundColor: "#e9f1fc"
  },
  modalOverlay: {
    flex: 1, backgroundColor: "#0007", justifyContent: "center", alignItems: "center",
  },
  modalContainer: {
    width: "90%", backgroundColor: "#fff", borderRadius: 16, padding: 18, elevation: 10
  },
  modalTitle: { fontWeight: "500", fontSize: 20, marginBottom: 12, textAlign: "center", color: "#2F487F" },
  input: { backgroundColor: "#f3f6fb", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, borderWidth: 1, borderColor: "#d6dcec" },
  modalBtn: { backgroundColor: "#2F487F", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 22, marginLeft: 10 }
});

export default App;
