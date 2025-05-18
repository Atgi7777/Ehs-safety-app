import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Platform, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../src/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_RADIUS = 20;

type Training = {
  id: number;
  title: string;
  training_date: string;
  location: string;
  poster?: { url: string };
};

const POSTER_BASE_URL = BASE_URL.replace('/api', '');

const UpcomingTrainingsScreen = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrgIdAndTrainings = async () => {
      try {
        const employeeDataStr = await AsyncStorage.getItem('user');
        if (!employeeDataStr) throw new Error('Ажилтны өгөгдөл олдсонгүй');
        const employeeData = JSON.parse(employeeDataStr);
        const orgId = employeeData.organization_id;
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${BASE_URL}/api/safety-trainings/organization/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTrainings(data || []);
      } catch (e) {
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgIdAndTrainings();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;

  return (
    <View style={styles.bg}>
      {/* Header хэсэг */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={28} color="#2F487F" />
          </TouchableOpacity>
          <Text style={styles.header}>ХАБ сургалтууд</Text>
          <View style={{ width: 34 }} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Cards list */}
      <FlatList
        data={trainings}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/Employee/Training/DetailTraining', params: { id: item.id } })}
            activeOpacity={0.96}
          >
            {/* poster зураг */}
            {item.poster?.url ? (
              <Image
                source={{ uri: item.poster.url.startsWith('http') ? item.poster.url : `${POSTER_BASE_URL}${item.poster.url}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#D1D6E3" />
              </View>
            )}
            {/* Title */}
           <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
  <Ionicons name="cube-outline" size={22} color="#2F487F" style={{ marginRight: 8 }} />
  <Text style={styles.title}>{item.title}</Text>
</View>

            {/* Divider */}
            <View style={styles.divider} />
            {/* Date & Location */}
           <View style={styles.infoRow}>
  <Ionicons name="calendar-outline" size={17} color="#2F487F" style={{ marginRight: 4 }} />
  <Text style={styles.date}>{formatDate(item.training_date)}</Text>
  <Ionicons name="location-outline" size={17} color="#FF7F50" style={{ marginLeft: 16, marginRight: 3 }} />
  <Text style={styles.location}>{item.location}</Text>
</View>

            {/* Дэлгэрэнгүй */}
            <View style={styles.cardFooter}>
              <Text style={styles.detailLink}>Дэлгэрэнгүй харах</Text>
              <Ionicons name="chevron-forward" size={17} color="#2F487F" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Сургалт олдсонгүй.</Text>}
        contentContainerStyle={trainings.length === 0
          ? { flex: 1, justifyContent: 'center' }
          : { paddingTop: 10, paddingBottom: 50 }}
      />
    </View>
  );
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

export default UpcomingTrainingsScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#EFF5FF', // яг заавал энэ өнгө
  },
  // HEADER цагаан background + доод зураас
  headerWrapper: {
    backgroundColor: '#fff',
    // optional: бага зэрэг сүүдэр хүсвэл энд нэмэж болно
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 58,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#18191C',
    flex: 1,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#EDF0FC',
    width: '100%',
  },
  backButton: {
    padding: 7,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 26,
    borderRadius: CARD_RADIUS,
    shadowColor: '#B6C3DA',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EEF2FB',
  },
  poster: {
    width: '100%',
    height: width * 0.33,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#E7EBF8',
    marginBottom: 6,
  },
  posterPlaceholder: {
    width: '100%',
    height: width * 0.33,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#EDF0FC',
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
  fontWeight: '500',
  fontSize: 16,
  color: '#253065',
  flexShrink: 1,
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0, // багана дотроо агшина
},

  divider: {
    height: 1,
    backgroundColor: '#EDF0FC',
    marginVertical: 11,
    borderRadius: 1,
  },
  infoRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  marginBottom: 2,
},

  date: {
    fontSize: 15,
    color: '#2F487F',
    marginRight: 4,
    fontWeight: '500',
  },
  location: {
  fontSize: 15,
  color: '#FF7F50',
  fontWeight: '500',
  marginLeft: 2,
  flexShrink: 1,
  flex: 1,
  minWidth: 0,
},

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    alignSelf: 'flex-end',
  },
  detailLink: {
    color: '#2F487F',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 2,
    opacity: 0.95,
  },
  emptyText: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: 17,
    color: '#AAB4BE',
  },
});
