// components/GroupSelector.tsx
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function GroupSelector() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {/* Жишээ бүлгүүд */}
      <View style={styles.group}>
        <Image source={require('@/assets/images/group1.png')} style={styles.icon} />
        <Text style={styles.label}>astralink</Text>
      </View>
      <View style={styles.group}>
        <Image source={require('@/assets/images/group2.png')} style={styles.icon} />
        <Text style={styles.label}>ТЭЦ4</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    flexDirection: 'row',
  },
  group: {
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
});
