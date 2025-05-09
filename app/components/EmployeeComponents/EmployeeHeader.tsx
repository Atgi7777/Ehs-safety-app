import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Header компонентод groupName болон date props-ийг тодорхойлох
type HeaderProps = {
  groupName: string;
  date: string;
};

const Header: React.FC<HeaderProps> = ({ groupName, date }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Логотип */}
        <Image 
          source={require('../../../assets/images/org_logo.png')} 
          style={styles.logo} 
        />
        
        {/* Группын нэр */}
        <Text style={styles.groupName}>{groupName}</Text>
        
        {/* Огноо */}
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 20,
    borderRadius: 100,
    
  },
  groupName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    alignItems: 'center',
    marginLeft: 40,
  }
});

export default Header;
