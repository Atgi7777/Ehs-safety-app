import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Header from '@/app/components/EngineerComponents/Header';
import IssueListScreen from '@/app/components/EngineerComponents/IssueListScreen';

const ReportScreen = () => {
  const router = useRouter();

  

  return (
    <View style={styles.container}>
              <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <IssueListScreen/>
       
      
      </ScrollView>

 
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },

});
