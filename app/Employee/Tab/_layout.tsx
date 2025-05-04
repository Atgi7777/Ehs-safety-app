// app/Employee/Tab/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  EmployeeScreen: 'home',
  ReportScreen: 'clipboard-outline',
  SafetyScreen: 'shirt-outline',
  InstructionScreen: 'book-outline',
  ProfileScreen: 'person-outline',
};

export default function EmployeeTabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 100,
          backgroundColor: '#2F487F',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          overflow: 'hidden',
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused }) => {
          const iconName = icons[route.name] || 'home';
          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={iconName}
                size={24}
                color={focused ? '#2F487F' : '#fff'}
              />
            </View>
          );
        },
        tabBarLabel: ({ focused }) => (
          focused ? (
            <Text style={styles.activeLabel}>
              {route.name.replace('Screen', '')}
            </Text>
          ) : null
        ),
        tabBarItemStyle: {
          marginTop: 15,
        },
      })}
    >
      <Tabs.Screen name="EmployeeScreen" />
      <Tabs.Screen name="ReportScreen" />
      <Tabs.Screen name="SafetyScreen" />
      <Tabs.Screen name="InstructionScreen" />
      <Tabs.Screen name="ProfileScreen" />
    </Tabs>
  );
}


const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'transparent',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  activeIconContainer: {
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 2 },
  },
  activeLabel: {
    marginTop: 8,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});
