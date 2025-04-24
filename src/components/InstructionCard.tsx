import { View, Text, StyleSheet } from 'react-native';

export default function InstructionCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Идэвхитэй</Text>
        <Text style={styles.date}>2023.3.14</Text>
      </View>
      <Text style={styles.text}>Бетон зуурмаг цутгах аюулгүй ажиллагааны зааварчилгаа</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#2e6bcc', fontWeight: 'bold' },
  date: { color: '#d43f3f' },
  text: { fontSize: 14, lineHeight: 18 },
});
