// app/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert , Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login, ress, loading } = useAuth(); // useAuth хуук ашиглах

  // Нэвтрэх функц
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Алдаа', 'Имэйл болон нууц үг оруулна уу.');
      return;
    }

    try {
      const ress = await login(email, password); // Бүх хариуг авах
      console.log('Logged in ress' , ress.user.role);
      // login хуук ашиглах

      // Хэрэв нэвтэрсэн хэрэглэгч байгаа бол (login амжилттай болсон)
      if (ress) {
        // Хэрэглэгчийн роль дагуу тохирох хуудас руу шилжих
        if (ress.user.role === 'safety-engineer') {
          router.push('/Engineer/Tabs'); // Аюулгүй ажиллагааны инженерийн хуудас руу шилжих
        } else if (ress.user.role === 'employee') {
          router.push('/Employee/Tab'); // Ажилтны хуудас руу шилжих
        }
      }
    } catch (error) {
      Alert.alert('Нэвтрэх амжилтгүй боллоо', error.message || 'Нэр, нууц үг буруу байна');
    }
  };

  return (
    <View style={styles.container}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} />

      <Text style={styles.title}>EHS</Text>
      <Text style={styles.subtitle}>Environment Health and Safety</Text>

      <Text style={styles.label}>Email хаяг</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#23476A" style={styles.icon} />
        <TextInput
          placeholder="Email хаяг"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Нууц үг</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#23476A" style={styles.icon} />
        <TextInput
          placeholder="Нууц үг"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Нэвтрэх</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginTop: -200,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#23476A',
    fontFamily: 'MadimiOne',
    marginLeft: -50,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 100,
    backgroundColor: '#23476A',
    borderRadius: 20,
    padding: 2,
    paddingHorizontal: 10,
    marginLeft: 150,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F7FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#23476A',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginTop: 14,
  },
  logo: {
    width: 60,
    height: 60,
    marginLeft: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
