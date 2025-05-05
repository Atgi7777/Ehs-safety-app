import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '@/app/components/EngineerComponents/Header';
import InstructionList from '@/app/components/EngineerComponents/EngineerTaskList';

const InstructionScreen = () => {
  const router = useRouter();

  

  const trainingCount = 5;
  const inquiryCount = 10;

  return (
    <View style={styles.container}>
              <Header />

      {/* Контентуудыг ScrollView дотор хийх */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
       
        <InstructionList />
      </ScrollView>

 
    </View>
  );
};

export default InstructionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },

});
