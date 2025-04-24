import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Header from '@/src/components/Header';

import GroupSelector from '@/src/components/GroupSelector';
import InstructionCard from '@/src/components/InstructionCard';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Header />
      <GroupSelector />
      <View style={styles.section}>
        <Text style={styles.title}>Зааварчилгаа</Text>
        <InstructionCard />
        <InstructionCard />
        <InstructionCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff', padding: 16 },
  section: { marginTop: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
