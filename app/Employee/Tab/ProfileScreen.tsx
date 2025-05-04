import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ➡️ imports хэсэгт нэмнэ


const ProfileScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Token устгах
      router.replace('/LoginScreen'); // Login дэлгэц рүү буцаах
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={35} color="#2F487F" />
      </TouchableOpacity>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/300' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Bat-Erdene Enkbayar</Text>
        <Text style={styles.role}>Ахлах инженер</Text>
        <Text style={styles.company}>"ABC" ХХК</Text>
        <Text style={styles.joinDate}>Ажилд орсон огноо: 2022.05.10</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.iconAndNumber}>
            <Image
              source={require('../../../assets/images/check.png')}
              style={styles.icon}
            />
            <Text style={styles.statNumber}>120</Text>
          </View>
          <Text style={styles.statLabel}>Үзсэн зааварчилгааны тоо</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.iconAndNumber}>
            <Image
              source={require('../../../assets/images/graduation.png')}
              style={styles.iconn}
            />
            <Text style={styles.statNumber}>6</Text>
          </View>
          <Text style={styles.statLabel}>Хамрагдсан сургалт</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Засах</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutButtonText}>Гарах</Text>
</TouchableOpacity>

    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    marginVertical: 2,
  },
  company: {
    fontSize: 14,
    color: '#999',
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
    color: '#2F487F',

  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  iconAndNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  iconn:{
    width: 40,
    height: 40,
    marginRight: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2F487F',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: '#C04747', // Улаан товч
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
