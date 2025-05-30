import React, { useState, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Animated, Easing, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/app/components/EngineerComponents/Header';

const BASE_URL = "http://127.0.0.1:5000"; // Серверийнхээ IP-г зөв оруулаарай!

export default function SafetyScreen() {
  const [media, setMedia] = useState<{uri: string, type: 'image'|'video'} | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const pickMedia = async () => {
    setResult(null);
    fadeAnim.setValue(0);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Both image & video
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        setMedia({ uri: asset.uri, type: 'video' });
      } else {
        setMedia({ uri: asset.uri, type: 'image' });
      }
    }
  };

  const checkSafety = async () => {
    if (!media) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    const isVideo = media.type === 'video';
    formData.append('file', {
      uri: media.uri,
      name: isVideo ? 'video.mp4' : 'photo.jpg',
      type: isVideo ? 'video/mp4' : 'image/jpeg',
    } as any);

    try {
     const res = await axios.post(`${BASE_URL}/detect_image`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
console.log(res.data.detections); // {detections: [ ... ]}

      // Видео бол stream үзүүлэх линкийг, зураг бол илрүүлэлтийн датаг үзүүлнэ
      if (isVideo) {
        setResult({ videoUrl: `${BASE_URL}/api/ppe/video?${Date.now()}` });
      } else {
        setResult(res.data);
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setResult({ error: 'Алдаа гарлаа!' });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } finally {
      setLoading(false);
    }
  };

  const renderMediaPreview = () => {
    if (!media) return (
      <View style={styles.imagePickerIcon}>
        <Ionicons name="camera" size={48} color="#4B63DD" />
        <Text style={styles.imagePickerText}>Зураг эсвэл бичлэг оруулах</Text>
      </View>
    );
    if (media.type === 'video') {
      return (
        <Video
          source={{ uri: media.uri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.COVER}
        />
      );
    }
    return (
      <Image source={{ uri: media.uri }} style={styles.image} />
    );
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.error)
      return (
        <Animated.View style={{ opacity: fadeAnim, ...styles.errorCard }}>
          <Ionicons name="alert-circle" size={28} color="#FFA726" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{result.error}</Text>
        </Animated.View>
      );

    if (result.videoUrl) {
      // Илрүүлэлттэй видео stream бол <Image> tag ашиглаж preview харуулна (browser дээр stream болно)
      return (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginTop: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#263360' }}>Илрүүлэлтийн видео:</Text>
          <Image
            source={{ uri: result.videoUrl }}
            style={{ width: 270, height: 180, borderRadius: 16, backgroundColor: '#eaeaea' }}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 15, color: '#999', marginTop: 5 }}>Chrome дээр хамгийн сайн ажиллана</Text>
        </Animated.View>
      );
    }
    if (result.detections && result.detections.length > 0) {
      return (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginTop: 12 }}>
          <Ionicons name="checkmark-done-circle" size={40} color="#38C976" />
          <Text style={[styles.ok, { marginBottom: 10 }]}>
            Илэрсэн зүйлс: <Text style={{ color: "#2F487F", fontWeight: "600" }}>{result.detections.length}</Text>
          </Text>
          <ScrollView style={styles.detectionList} contentContainerStyle={{paddingBottom: 8}}>
            {result.detections.map((det: any, i: number) => (
              <View key={i} style={styles.detectionItem}>
                <Ionicons
                  name={
                    det.class_name.toLowerCase().includes('no-')
                      ? "alert-circle"
                      : det.class_name.toLowerCase() === 'person'
                        ? "person-circle"
                        : "checkmark-circle"
                  }
                  size={18}
                  color={
                    det.class_name.toLowerCase().includes('no-')
                      ? "#EF5350"
                      : det.class_name.toLowerCase() === 'person'
                        ? "#4B63DD"
                        : "#38C976"
                  }
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  color: det.class_name.toLowerCase().includes('no-')
                    ? "#EF5350"
                    : "#263360",
                  fontSize: 16,
                  fontWeight: "500"
                }}>
                  {det.class_name}
                </Text>
                <Text style={{ color: "#888", marginLeft: 8, fontSize: 14 }}>
                  ({Math.round(det.score * 100)}%)
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      );
    }
    return (
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginTop: 12 }}>
        <Ionicons name="close-circle" size={40} color="#EF5350" />
        <Text style={styles.notOk}>Илэрсэн зүйл байхгүй!</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <Header />
      <Text style={styles.title}>Аюулгүй хувцасны шалгалт</Text>
      <View style={styles.centered}>
        <View style={styles.glassCard}>
          <TouchableOpacity activeOpacity={0.93} onPress={pickMedia} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {renderMediaPreview()}
            {media && (
              <TouchableOpacity style={styles.changeBtn} onPress={pickMedia}>
                <Ionicons name="repeat" size={20} color="#4B63DD" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.button, (!media || loading) && styles.buttonDisabled]}
          onPress={checkSafety}
          disabled={!media || loading}
          activeOpacity={0.93}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Шалгах</Text>}
        </TouchableOpacity>
        {renderResult()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#EFF5FF",
    alignItems: "center",
  },
  video: {
    width: 262,
    height: 192,
    borderRadius: 26,
    backgroundColor: "#ddd"
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "#263360",
    textAlign: "center",
    marginVertical: 18,
    letterSpacing: 0.4,
    marginHorizontal: 16,
  },
  glassCard: {
    width: 282,
    height: 210,
    borderRadius: 34,
    marginTop: 12,
    marginBottom: 28,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#4B63DD",
    shadowOpacity: 0.15,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1.2,
    borderColor: "rgba(115,128,255,0.11)",
    ...Platform.select({ android: { elevation: 7 } }),
  },
  image: {
    width: 262,
    height: 192,
    borderRadius: 26,
    resizeMode: "cover",
  },
  changeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 7,
    shadowColor: "#4B63DD",
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  imagePickerIcon: { alignItems: "center" },
  imagePickerText: {
    color: "#4B63DD",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  button: {
    marginTop: 0,
    width: 260,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F487F",
    shadowColor: "#4B63DD",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: "#dbe2fa" },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 19,
    letterSpacing: 1,
    textAlign: 'center'
  },
  ok: {
    color: "#38C976",
    fontSize: 19,
    fontWeight: "500",
    marginTop: 16,
    letterSpacing: 0.2,
    textAlign: "center"
  },
  notOk: {
    color: "#EF5350",
    fontSize: 19,
    fontWeight: "500",
    marginTop: 16,
    letterSpacing: 0.2,
    textAlign: "center"
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,197,110,0.13)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 22,
    alignSelf: "center",
    shadowColor: "#FFA726",
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  errorText: {
    color: "#FFA726",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center"
  },
  detectionList: {
    width: 240,
    maxHeight: 150,
    borderRadius: 10,
    backgroundColor: '#F7F9FF',
    padding: 6,
    marginBottom: 12,
    alignSelf: "center"
  },
  detectionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: "#fff"
  }
});
