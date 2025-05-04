import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/EmployeeComponents/Header'; // components дотроос зөв зам
import { useRouter } from 'expo-router';

const slides = [
  {
    id: '1',
    image: require('../../../assets/images/slide1.png'),
    text: 'Хангалтгүй бэхэлгээ...',
  },
  {
    id: '2',
    image: require('../../../assets/images/slide2.png'),
    text: 'Барилга дээр хяналтгүй...',
  },
  {
    id: '3',
    image: require('../../../assets/images/slide3.png'),
    text: 'Өвлийн улиралд барилга дээр...',
  },
];

const InstructionSlideScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleFinish = () => {
    router.push('/Employee/Instruction/SignatureConfirmScreen');
  };

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
    router.push('/Employee/Tab/EmployeeScreen');
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackHome}>
          <Ionicons name="arrow-back" size={28} color="#2F487F" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Бетон зуурмаг цутгах аюулгүйн зааварчилгаа</Text>

        {/* төвлөрүүлэхийн тулд хоосон зай үлдээсэн */}
      </View>

      {/* Slide зураг ба тайлбар */}
      <View style={styles.content}>
        <Image source={slides[currentSlide].image} style={styles.image} resizeMode="cover" />

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
          <Text style={styles.descriptionText}>{slides[currentSlide].text}</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>Хуудас {currentSlide + 1}/{slides.length}</Text>

      {/* Дуусах товч зөвхөн хамгийн сүүлийн слайд дээр гарна */}
      {currentSlide === slides.length - 1 && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Гарын үсэг зурах</Text>
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
