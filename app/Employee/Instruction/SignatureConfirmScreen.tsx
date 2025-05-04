import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Signature from 'react-native-signature-canvas';
import MapView from 'react-native-maps';

const SignatureConfirmScreen = () => {
  const router = useRouter();

  const handleSend = () => {
    alert('Амжилттай илгээгдлээ!');
    router.replace('/Employee/Tab/EmployeeScreen');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header хэсэг */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Баталгаажуулах</Text>
      </View>

      {/* Гарын үсэг */}
      <Text style={styles.sectionTitle}>Гарын үсэг зурна уу</Text>
      <View style={styles.signatureContainer}>
        <Signature 
          onOK={(signature) => console.log(signature)}
          descriptionText="Гарын үсгээ зурна уу"
          clearText="Цэвэрлэх"
          confirmText="Батлах"
          webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
        />
      </View>

      {/* Байршил */}
      <Text style={styles.sectionTitle}>Байршилаа оруулна уу</Text>
      <View style={styles.mapContainer}>
        <MapView 
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 47.918873,
            longitude: 106.917701,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        />
      </View>

      {/* Илгээх товч */}
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Илгээх</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignatureConfirmScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
    padding: 16,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 40,
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F487F',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#00000',
    marginVertical: 8,
  },
  signatureContainer: {
    backgroundColor: '#fff',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapContainer: {
    backgroundColor: '#fff',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#2F487F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
