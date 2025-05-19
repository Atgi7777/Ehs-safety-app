import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/EmployeeComponents/Header';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../../../src/config';
import { Video, ResizeMode } from 'expo-av';

const InstructionSlideScreen = () => {
  const router = useRouter();
  const { instructionId, groupId } = useLocalSearchParams();
  
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false); // 🆕

  useEffect(() => {
    fetchSlides();
  }, [instructionId]);

  // 🆕 Slide солигдох бүрт бичлэг үзсэн flag-ыг reset хийнэ
  useEffect(() => {
    setVideoWatched(false);
  }, [currentSlide]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/instruction/${instructionId}/slides`);
      setSlides(res.data);
    } catch (error) {
      console.error('Слайдуудыг татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const handleFinish = () => {
    if (!instructionId || !groupId) {
      Alert.alert('Алдаа', 'Зааварчилгаа эсвэл бүлгийн мэдээлэл олдсонгүй.');
      return;
    }
    router.push({
      pathname: '/Employee/Instruction/SignatureConfirmScreen',
      params: {
        instructionId: instructionId,
        groupId: groupId,
      },
    });
  };

  const handleGoBackHome = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F487F" />
      </View>
    );
  }

  if (slides.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Хоосон байна...</Text>
      </View>
    );
  }

  const current = slides[currentSlide];
  const hasImage = current.image_url && current.image_url !== '';
  const hasVideo = current.video_url && current.video_url !== '';

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackHome}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Аюулгүйн зааварчилгаа</Text>
      </View>

      <View style={styles.content}>
        {hasImage ? (
          <Image
            source={{ uri: `${BASE_URL}/${current.image_url}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : hasVideo ? (
          <Video
            source={{ uri: `${BASE_URL}/${current.video_url}` }}
            style={styles.image}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping={false}
           onPlaybackStatusUpdate={status => {
  // Тусгайлан шалгах!
  if ('didJustFinish' in status && status.didJustFinish && !status.isLooping) {
    setVideoWatched(true);
  }
}}

          />
        ) : (
          <View style={styles.noMediaBox}>
            <Text style={{ color: '#999' }}>Медиа файл байхгүй</Text>
          </View>
        )}

        <View style={styles.navigationRow}>
          <TouchableOpacity onPress={handlePrev} disabled={currentSlide === 0}>
            <Ionicons
              name="chevron-back-circle-outline"
              size={40}
              color={currentSlide === 0 ? '#ccc' : '#2F487F'}
            />
          </TouchableOpacity>

          {/* 🆕 VIDEO байгаа бол бичлэг дуустал Next товч харуулахгүй */}
          {(!hasVideo || videoWatched) && (
            <TouchableOpacity onPress={handleNext} disabled={currentSlide === slides.length - 1}>
              <Ionicons
                name="chevron-forward-circle-outline"
                size={40}
                color={currentSlide === slides.length - 1 ? '#ccc' : '#2F487F'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{current.description}</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>Хуудас {currentSlide + 1}/{slides.length}</Text>

      {/* 🆕 Төгсгөлийн хуудсан дээр video бол бүрэн үзсэн бол, бусад тохиолдолд Finish гаргана */}
      {currentSlide === slides.length - 1 &&
        (!hasVideo || videoWatched) && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Гарын үсэг зурах</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InstructionSlideScreen;

// --- styles нь өөрчлөгдөөгүй ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF5FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  noMediaBox: {
    width: '90%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#ccc',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
