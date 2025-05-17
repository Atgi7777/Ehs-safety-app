import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';

const SAFE_TOP = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 18;

type Props = {
  activeTab: 'detail' | 'solution';
  onTabChange: (tab: 'detail' | 'solution') => void;
  onClose: () => void;
};

const IssueTabsHeader: React.FC<Props> = ({ activeTab, onTabChange, onClose }) => (
  <View style={[styles.headerWrapper, { paddingTop: SAFE_TOP }]}>
    <View style={styles.topBarRow}>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
        <Text style={styles.closeText}>Хаах</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'detail' && styles.tabActiveBtn]}
        onPress={() => onTabChange('detail')}
        activeOpacity={0.9}
      >
        <Text style={[styles.tab, activeTab === 'detail' ? styles.tabActive : styles.tabInactive]}>Дэлгэрэнгүй</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, activeTab === 'solution' && styles.tabActiveBtn]}
        onPress={() => onTabChange('solution')}
        activeOpacity={0.9}
      >
        <Text style={[styles.tab, activeTab === 'solution' ? styles.tabActive : styles.tabInactive]}>Шийдэл</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default IssueTabsHeader;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
    zIndex: 10,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 18,
    marginBottom: 2,
  },
  closeText: {
    color: '#274780',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: 0.2,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F4F7FE',
    padding: 3,
    borderRadius: 13,
    marginHorizontal: 14,
    marginTop: 2,
    marginBottom: 1,
    alignSelf: 'stretch',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  tabActiveBtn: {
    backgroundColor: '#fff',
    shadowColor: '#284078',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 1,
  },
  tab: {
    fontSize: 16,
    color: '#1F2653',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabInactive: {
    color: '#294478',
    fontWeight: '600',
  },
  tabActive: {
    color: '#2F487F',
    fontWeight: '500',
  },
});
