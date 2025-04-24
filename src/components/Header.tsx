import { View, Image, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Image source={require('@/assets/images/user.png')} style={styles.avatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 50, height: 50 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
});
