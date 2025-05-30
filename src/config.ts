import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import Constants from 'expo-constants';

let API_BASE_URL = '';

const isSimulator =
  Platform.OS === 'ios'
    ? !Constants.deviceName || Constants.deviceName.includes('Simulator')
    : !Constants.isDevice; // Android симулятор бол isDevice === false

if (isSimulator && Platform.OS === 'ios') {
  API_BASE_URL = 'http://localhost:5050'; // ✅ iOS симулятор
} else if (isSimulator && Platform.OS === 'android') {
  API_BASE_URL = 'http://10.1.0.229:5050'; // ✅ Android эмулятор
} else {
  API_BASE_URL = 'http://172.20.10.12:5050'; // ← Mac-ийн IP-г энд оруулсан
}

export const BASE_URL = `${API_BASE_URL}`;
