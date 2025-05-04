import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <Image 
          source={require('../../../assets/images/logo.png')} 
          style={styles.logo} 
        />
        <View style={styles.spacer} />
        {/* Notification Bell Icon */}
        <Ionicons name="notifications-outline" size={30} color="#2F487F" style={{ marginRight: 10 }} />

        {/* User Avatar */}
        

        <Image 
          source={require('../../../assets/images/user-avatar.png')} 
          style={styles.avatar} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 40 ,
    paddingTop: 45,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  logoo:{
    width: 30,
    height: 30,
    marginRight: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 50,
  },
  icon: {
    marginHorizontal: 10, // Add some spacing between icons
  },
  spacer: {
    flex: 1,  // This spacer element will take the remaining space and push the avatar to the right
  },
});

export default Header;
