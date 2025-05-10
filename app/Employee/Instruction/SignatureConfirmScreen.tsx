import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // ❗ заавал useLocalSearchParams
import Signature from 'react-native-signature-canvas';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../src/config';

const LOCATION_OPTIONS = ["Гэр", "Ажил", "Бусад"];

const SignatureConfirmScreen = () => {
  const router = useRouter();
  const { instructionId , groupId} = useLocalSearchParams(); // 🆕 Зааварчилгааны id-г авч байна
  const signatureRef = useRef<any>(null);

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const [selectedLocationDetail, setSelectedLocationDetail] = useState<string>("Гэр");
  const [customLocationDetail, setCustomLocationDetail] = useState<string>("");

  useEffect(() => {
    fetchLocation();
    fetchUserInfo();
  }, []);

  const fetchLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Анхааруулга', 'Байршлын зөвшөөрөл олгоно уу.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (error) {
      console.error('Байршил авахад алдаа:', error);
      Alert.alert('Алдаа', 'Байршил тодорхойлоход алдаа гарлаа.');
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token байхгүй байна.');
        return;
      }
      const res = await fetch(`${BASE_URL}/api/employee/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Хэрэглэгчийн мэдээлэл авахад амжилтгүй.');
        return;
      }
      const user = await res.json();
      setEmployeeId(user.id);
    } catch (error) {
      console.error('Хэрэглэгчийн мэдээлэл авахад алдаа:', error);
    }
  };

  const handleSignatureOK = (signature: string) => {
    if (signature && signature.startsWith('data:image')) {
      setSignatureData(signature);
      setHasSigned(true);
    } else {
      setSignatureData(null);
      setHasSigned(false);
    }
  };

  const handleSend = async () => {
    if (!signatureData) {
      Alert.alert('Алдаа', 'Та эхлээд гарын үсгээ зурна уу!');
      return;
    }
    if (!location) {
      Alert.alert('Алдаа', 'Байршил тодорхойлогдоогүй байна.');
      return;
    }
    if (!employeeId || !groupId || !instructionId) {
   
      Alert.alert('Алдаа', 'Ажилтан, бүлэг эсвэл зааварчилгааны мэдээлэл олдсонгүй.');
      return;
    }

    let locationDetailToSend = selectedLocationDetail;
    if (selectedLocationDetail === "Бусад" && customLocationDetail.trim()) {
      locationDetailToSend = customLocationDetail.trim();
    }

    try {
      setSending(true);

      const payload = {
      signature_photo: signatureData, 
        latitude: location.latitude,
        longitude: location.longitude,
        location_detail: locationDetailToSend,
        employee_id: employeeId,
        group_id: Number(groupId),
        instruction_id: Number(instructionId),
      };

      const token = await AsyncStorage.getItem('userToken');

      const res = await fetch(`${BASE_URL}/api/signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('Амжилттай', 'Мэдээлэл амжилттай илгээгдлээ!');
        router.replace('/Employee/Tab/EmployeeScreen');
      } else {
        Alert.alert('Алдаа', 'Илгээхэд алдаа гарлаа.');
        
      }
    } catch (error) {
      console.error('Илгээх алдаа:', error);
      Alert.alert('Сүлжээний алдаа', 'Интернет эсвэл серверээ шалгана уу.');
    } finally {
      setSending(false);
    }
  };

  const handleGoBack = () => router.back();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Баталгаажуулах</Text>
      </View>

      {/* Signature */}
      <Text style={styles.sectionTitle}>Гарын үсэг зурна уу</Text>
      <View style={styles.signatureContainer}>
        <Signature
          ref={signatureRef}
          onOK={handleSignatureOK}
          onEnd={() => signatureRef.current?.readSignature()}
          descriptionText="Гарын үсгээ зурна уу"
          clearText="Цэвэрлэх"
          confirmText="Батлах"
          autoClear={false}
          penColor="#2F487F"
          backgroundColor="#fff"
          imageType="image/jpeg"
          webStyle={`.m-signature-pad--footer { display: none; } .m-signature-pad { background-color: white; border-radius: 8px; }`}
        />
      </View>

      {/* Location */}
      <Text style={styles.sectionTitle}>Байршлаа сонгоно уу</Text>
      <View style={styles.locationSelectContainer}>
        {LOCATION_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.locationOption, selectedLocationDetail === option && styles.selectedLocationOption]}
            onPress={() => setSelectedLocationDetail(option)}
          >
            <Text style={[styles.locationOptionText, selectedLocationDetail === option && styles.selectedLocationOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedLocationDetail === "Бусад" && (
        <View style={styles.customLocationContainer}>
          <Text style={styles.customLocationLabel}>Байршлын дэлгэрэнгүй:</Text>
          <TextInput
            style={styles.customLocationInput}
            placeholder="Жишээ нь: Гачуурт гэртээ"
            placeholderTextColor="#999"
            value={customLocationDetail}
            onChangeText={setCustomLocationDetail}
          />
        </View>
      )}

      {/* Map */}
      <Text style={styles.sectionTitle}>Байршил</Text>
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <ActivityIndicator size="large" color="#2F487F" />
        ) : (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location?.latitude || 47.918873,
              longitude: location?.longitude || 106.917701,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {location && <Marker coordinate={location} />}
          </MapView>
        )}
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, (!hasSigned || sending) && { backgroundColor: '#ccc' }]}
        onPress={handleSend}
        disabled={!hasSigned || sending}
      >
        <Text style={styles.sendButtonText}>{sending ? 'Илгээж байна...' : 'Илгээх'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignatureConfirmScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF5FF', padding: 16 },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 12, paddingTop: 40 },
  backButton: { position: 'absolute', left: 0, top: 40, paddingLeft: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2F487F', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '400', color: '#000', marginVertical: 8 },
  signatureContainer: { backgroundColor: '#fff', height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  mapContainer: { backgroundColor: '#fff', height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  sendButton: { backgroundColor: '#2F487F', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  locationSelectContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12, gap: 10 },
  locationOption: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderRadius: 8, borderColor: '#ccc', backgroundColor: '#fff' },
  selectedLocationOption: { backgroundColor: '#2F487F', borderColor: '#2F487F' },
  locationOptionText: { color: '#2F487F', fontWeight: '500' },
  selectedLocationOptionText: { color: '#fff' },
  customLocationContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2F487F', marginBottom: 16 },
  customLocationLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#2F487F' },
  customLocationInput: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#f9f9f9', color: '#000' },
});
