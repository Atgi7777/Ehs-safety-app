// Updated InstructionSlideScreen to load slides dynamically from backend
//Engineer/instruction/InstructionSlideScreen
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/EngineerComponents/Header';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE_URL = 'http://localhost:5050';

const InstructionSlideScreen = () => {
  const router = useRouter();
  const { instructionId } = useLocalSearchParams();
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/slides`);
        setSlides(res.data);
      } catch (error) {
        console.error('⚠️ Слайд татахад алдаа:', error);
      } finally {
        setLoading(false);
      }
    };

    if (instructionId) fetchSlides();
  }, [instructionId]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGoBackHome = () => {
    router.push('/Engineer/Tabs/EngineerScreen');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <ActivityIndicator size="large" color="#2F487F" style={{ marginTop: 50 }} />
      </View>
    );
  }

  if (slides.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <Text style={{ marginTop: 50, textAlign: 'center' }}>Слайд олдсонгүй</Text>
      </View>
    );
  }

  const slide = slides[currentSlide];
  const imageUrl = `${BASE_URL}/${slide.image_url}`;

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackHome}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Зааварчилгааны слайд</Text>
      </View>

      <View style={styles.content}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.navigationRow}>
          <TouchableOpacity onPress={handlePrev} disabled={currentSlide === 0}>
            <Ionicons
              name="chevron-back-circle-outline"
              size={40}
              color={currentSlide === 0 ? '#ccc' : '#2F487F'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} disabled={currentSlide === slides.length - 1}>
            <Ionicons
              name="chevron-forward-circle-outline"
              size={40}
              color={currentSlide === slides.length - 1 ? '#ccc' : '#2F487F'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{slide.description}</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>Хуудас {currentSlide + 1}/{slides.length}</Text>

      {currentSlide === slides.length - 1 && (
        <TouchableOpacity style={styles.finishButton} onPress={handleGoBackHome}>
          <Text style={styles.finishButtonText}>хаах</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InstructionSlideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#EFF5FF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F487F',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: '90%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 8,
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    width: '90%',
    minHeight: 80,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
    marginTop: 12,
  },
  finishButton: {
    backgroundColor: '#2F487F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});