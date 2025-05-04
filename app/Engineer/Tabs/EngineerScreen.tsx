import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '@/app/components/EngineerComponents/Header';
import Statistics from '@/app/components/EngineerComponents/EngineerStatistic';
import InstructionList from '@/app/components/EngineerComponents/EngineerTaskList';
import GroupList from '@/app/components/EngineerComponents/GroupList';

const EngineerScreen = () => {
  const router = useRouter();

  

  const trainingCount = 5;
  const inquiryCount = 10;

  return (
    <View style={styles.container}>
      {/* Контентуудыг ScrollView дотор хийх */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Header />
        <GroupList />
        <Statistics trainingCount={trainingCount} inquiryCount={inquiryCount} />
        <InstructionList />
      </ScrollView>

 
    </View>
  );
};

export default EngineerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },

});
