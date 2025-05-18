import React, { useEffect, useState } from "react";
import {
  View, Text, ActivityIndicator, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BASE_URL } from "../../../src/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POSTER_BASE_URL = BASE_URL.replace("/api", "");

const TrainingDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/safety-trainings/${id}`)
      .then(res => res.json())
      .then(setTraining)
      .catch(() => setTraining(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const employeeIdStr = await AsyncStorage.getItem('userId');
      if (!employeeIdStr) {
        Alert.alert('Алдаа', 'Ажилтны мэдээлэл олдсонгүй!');
        setConfirming(false);
        return;
      }
      const employee_id = Number(employeeIdStr);

      const res = await fetch(`${BASE_URL}/api/safety-trainings/${id}/attend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id }),
      });
      if (res.ok) {
        Alert.alert("Амжилттай", "Та сургалтанд оролцсон гэж бүртгэгдлээ!");
      } else {
        Alert.alert("Алдаа", "Баталгаажуулахад алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch (e) {
      Alert.alert("Алдаа", "Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  if (!training) return <Text style={{ textAlign: "center", marginTop: 60 }}>Сургалт олдсонгүй</Text>;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={28} color="#2F487F" />
          </TouchableOpacity>
         <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
  <Text style={styles.title}>{training.title}</Text>
</View>

          <View style={{ width: 34 }} />
        </View>
        <View style={styles.headerDivider} />
      </View>
      {training.poster?.url ? (
        <Image
          source={{ uri: training.poster.url.startsWith("http") ? training.poster.url : `${POSTER_BASE_URL}${training.poster.url}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Ionicons name="image-outline" size={48} color="#D0D6EA" />
        </View>
      )}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={19} color="#4667EA" style={{ marginRight: 8 }} />
          <Text style={styles.info}>{formatDate(training.training_date)}</Text>
        </View>
        <View style={styles.infoRow}>
  <Ionicons name="location-outline" size={19} color="#FF7F50" style={{ marginRight: 8 }} />
  <Text style={styles.info}>{training.location}</Text>
</View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={19} color="#30b887" style={{ marginRight: 8 }} />
          <Text style={styles.info}>
            {training.duration_hours ? `${training.duration_hours} цаг` : "Хугацаа тодорхойгүй"}
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Дэлгэрэнгүй</Text>
        <Text style={styles.desc}>{training.description || "Тайлбар оруулаагүй байна."}</Text>
      </View>
      {training.organization && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Байгууллага</Text>
          <Text style={styles.info}>{training.organization.name}</Text>
        </View>
      )}
      {training.engineer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ХАБ инженер</Text>
          <Text style={styles.info}>{training.engineer.name}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirm}
        disabled={confirming}
        activeOpacity={0.85}
      >
        <Text style={styles.confirmBtnText}>
          {confirming ? "Илгээж байна..." : "Сургалтанд оролцсон"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

export default TrainingDetailScreen;



const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#EFF5FF',
     paddingHorizontal: 20,
  },
 headerWrapper: {
  paddingTop:60,
  backgroundColor: '#fff',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 18,
  borderBottomRightRadius: 18,
  marginHorizontal: -20,
  marginTop: -20,
  marginBottom: 15,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 10,
  paddingTop: Platform.OS === 'android' ? 8 : 18,
  paddingBottom: 8,
  backgroundColor: "#fff",
},
title: {
  fontWeight: "500",
  fontSize: 18,
  color: "#18191C",
  letterSpacing: 0.2,
  textAlign: "center",
  flexShrink: 1,
  flexWrap: 'wrap',
  minWidth: 0,
  width: '100%',
},

headerDivider: {
  height: 1,
  backgroundColor: '#EDF0FC',
  width: "100%",
},
backButton: {
  padding: 7,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 6,
},

 
  poster: {
    width: "100%",
    height: 200,
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: "#E9E9EC",
    
  },
  posterPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 24,
    backgroundColor: "#E9E9EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#111",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F1F4",
  },
 infoRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: 10,
},

  info: {
  fontSize: 16,
  color: "#787878",
  fontWeight: "500",
  flexShrink: 1,
  flex: 1,
  minWidth: 0,
  lineHeight: 20,
},

  section: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#111",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F1F4",
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "500",
    color: "#18191C",
    fontSize: 15,
    marginBottom: 3,
  },
  desc: {
    color: "#787878",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "justify",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F487F",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 28,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.15,
  },
});
