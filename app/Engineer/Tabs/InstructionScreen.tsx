import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView , Text} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '@/app/components/EngineerComponents/Header';
import Training from '@/app/components/EngineerComponents/CreateTrainingScreen'
const InstructionScreen = () => {
  const router = useRouter();

  

  return (
    <View style={styles.container}>
              <Header />

      {/* Контентуудыг ScrollView дотор хийх */}
    <Text style={styles.title}>Хаб хурал</Text>
      <Training/>
 

 
    </View>
  );
};

export default InstructionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },
  title:{
    fontSize: 22,
    fontWeight: '500',
    color: '#2F487F',
    marginTop: 20,
    textAlign: 'center',
  }

});
