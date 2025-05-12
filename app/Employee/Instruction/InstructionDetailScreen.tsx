import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../src/config';

const InstructionDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructionDetail();
  }, []);

  const fetchInstructionDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('Token олдсонгүй');

      const res = await fetch(`${BASE_URL}/api/instruction/history/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Түүх татахад алдаа.');
        return;
      }

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Гарын үсэг татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F487F" />
        <Text style={styles.loadingText}>Уншиж байна...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Мэдээлэл олдсонгүй</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const location = data.location?.[0];
  const signature = data.signature?.[0];
  const safetyEngineer = data.instruction?.safetyEngineer;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dateText}>{data.date_viewed ? formatDate(data.date_viewed) : 'Огноо байхгүй'}</Text>

      <InfoBox label="Овог , нэр" value={data.employee?.name || 'Овог нэр байхгүй'} />
      <InfoBox label="Мэргэжил , зэрэг" value={data.employee?.position || 'Мэргэжил байхгүй'} />
      <InfoBox label="Хийгдэх ажил" value={data.instruction?.title || 'Хийх ажил байхгүй'} />
      <InfoBox
        label="ХАБ зааварчилгааны ерөнхий утга , код"
        value={`Дугаар: ${data.instruction?.number || ''}\n${data.instruction?.title || ''}`}
        multiline
      />
      
      {/* Илгээсэн ХАБ инженерийн мэдээлэл */}
      {safetyEngineer && (
        <>
          <InfoBox label="Илгээсэн ХАБ инженер" value={safetyEngineer.name || ''} />
          <InfoBox label="Илгээгчийн и-мэйл" value={safetyEngineer.email || ''} />
          <InfoBox label="Илгээгчийн утас" value={safetyEngineer.phone || ''} />
        </>
      )}

      {/* Гарын үсэг */}
      <Text style={styles.sectionTitle}>Зааварчилгаа авсан гарын үсэг</Text>
      <View style={styles.signatureContainer}>
        {signature ? (
          <Image source={{ uri: signature.signature_photo }} style={styles.signatureImage} resizeMode="contain" />
        ) : (
          <Text style={{ color: '#999' }}>Гарын үсэг байхгүй байна</Text>
        )}
      </View>

      {/* Байршил */}
      {location && (
        <InfoBox
          label="Байршил"
          value={`${location.location_detail || ''}\n${location.latitude || ''}, ${location.longitude || ''}`}
          multiline
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Буцах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoBox = ({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      editable={false}
      multiline={multiline}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFF',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#2F487F',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F487F',
    textAlign: 'center',
    marginBottom: 24,
  },
  box: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#2F487F',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F487F',
    marginTop: 12,
    marginBottom: 8,
  },
  signatureContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    backgroundColor: '#2F487F',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default InstructionDetailScreen;
