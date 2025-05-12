import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform , Alert} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { BASE_URL } from '../../../src/config';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const InstructionHistoryScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    fetchInstructionHistory();
  }, [selectedDate]);

  const fetchInstructionHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('Token олдсонгүй');

      const response = await axios.get(`${BASE_URL}/api/instruction/history?date=${format(selectedDate, 'yyyy-MM-dd')}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistoryList(response.data);
    } catch (error) {
      console.error('Түүх татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };
 
  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/Employee/Instruction/InstructionDetailScreen', params: { id: item.id } })}>
      <View style={styles.row}>
        <Text style={styles.cellNumber}>{index + 1}</Text>
        <Text style={styles.cellName}>{item.employee?.name || ''}</Text>
        <Text style={styles.cellPosition}>{item.employee?.position || ''}</Text>
        <Text style={styles.cellTask}>{item.instruction?.title || ''}</Text>
        <Text style={styles.cellEngineer}>{item.instruction?.safetyEngineer?.name || ''}</Text>

        <View style={styles.signatureCircleContainer}>
          {item.signature && item.signature.length > 0 ? (
            <View style={[styles.signatureCircle, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.signatureText}>✓</Text>
            </View>
          ) : (
            <View style={[styles.signatureCircle, { backgroundColor: '#F44336' }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

const handlePrintPDF = async () => {
  const today = format(selectedDate, 'yyyy.MM.dd');

  if (!historyList.length) {
    Alert.alert('Анхааруулга', 'Түүхийн мэдээлэл олдсонгүй.');
    return;
  }

  // === 1. Зааварчилгаар бүлэглэх ===
  const groupedByInstruction = historyList.reduce((acc, item) => {
    const instructionId = item.instruction?.id;
    if (!instructionId) return acc;

    if (!acc[instructionId]) {
      acc[instructionId] = {
        title: item.instruction.title || 'Тодорхойгүй',
        description: item.instruction.description || '',
        safetyEngineerName: item.instruction.safetyEngineer?.name || 'Тодорхойгүй',
        records: [],
      };
    }
    acc[instructionId].records.push(item);
    return acc;
  }, {});

  // === 2. Зааварчилгаа бүрт хүснэгт үүсгэх ===
  const sectionsHtml = Object.values(groupedByInstruction).map((instructionGroup: any) => {
    const { title, description, safetyEngineerName, records } = instructionGroup;

    const rowsHtml = records.map((item: any, index: number) => {
      const signedAt = item.signature?.length > 0 ? new Date(item.signature[0].signed_at) : null;
      const signedTimeStr = signedAt ? `${signedAt.getHours().toString().padStart(2, '0')}:${signedAt.getMinutes().toString().padStart(2, '0')}` : '';

      const locationDetail = item.location?.length > 0 ? item.location[0].location_detail || '' : '';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.employee?.name || ''}</td>
          <td>${item.employee?.position || ''}</td>
          <td>
            ${
              item.signature?.length > 0 && item.signature[0].signature_photo
                ? `<img src="${item.signature[0].signature_photo}" style="width:100px;height:50px;object-fit:contain;border:1px solid #ccc;border-radius:4px;" />`
                : ''
            }
          </td>
          <td>${signedTimeStr}</td>
          <td>${locationDetail}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="title">Зааварчилгаа: ${title}</div>
        <div class="subtitle">Тайлбар: ${description}</div>
        <div class="subtitle">ХАБЭА инженер: ${safetyEngineerName}</div>

        <table style="width:100%; margin-top: 10px;">
          <thead>
            <tr>
              <th>№</th>
              <th>Нэр</th>
              <th>Албан тушаал</th>
              <th>Гарын Үсэг</th>
              <th>Цаг</th>
              <th>Байршил</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top:10px; font-size:9px;">
          <b>Анхаар:</b> ХАБЭА дүрмийг чанд мөрдөнө. Ажлын байрны аюулгүй байдлыг хангана.
          <br>Ажилтан: Хувийн хамгаалах хэрэгсэл болох хамгаалалтын малгай, хамгаалалтын гутал, хамгаалалтын хувцас, хамгаалалтын бүс зэргийг тогтмол ашиглана.<br>
      - Тухайн ажилд хэрэглэх багаж тоног төхөөрөмжийг бүрэн бүтэн байдлыг шалгах.<br>
      - Хийж буй ажлын стандартын дагуу ажил гүйцэтгэх.<br>
      - Аюулгүй ажиллагааны зааварчилгааг чанд мөрдөх.<br>
      - Ашиглаж буй багаж хэрэгслийг зохистой ашиглах.<br><br>

      Ажлын байр: Ажлын байрыг цэвэр цэмцгэр байлгана.<br>
      - Багаж хэрэгслийг эмх цэгцтэй байрлуулах.<br>
      - Ажлын байранд эмх замбараагүй байдал үүсгэхгүй байх.<br><br>

      Бусад:<br>
      - Аюултай нөхцөл илэрвэл даруй мэдэгдэх.<br>
      - Аюулгүй ажиллагааны дүрмийг чанд мөрдөх.<br><br>

        </div>
      </div>
      <hr style="margin-top: 30px; margin-bottom: 30px;">
    `;
  }).join('');

  // === 3. Эцсийн HTML үүсгэх ===
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table, th, td { border: 1px solid black; border-collapse: collapse; }
          th, td { padding: 4px; font-size: 10px; text-align: center; }
          .small-text { font-size: 9px; }
          .bold { font-weight: bold; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          .subtitle { text-align: center; margin-bottom: 12px; }
          .section { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="title">АЖЛЫН БАЙРАН ДАХЬ ӨДӨР ТУТМЫН ЗААВАРЧИЛГААНЫ БҮРТГЭЛ</div>
        <div class="subtitle">Он: ${today.split('.')[0]} &nbsp; Сар: ${today.split('.')[1]} &nbsp; Өдөр: ${today.split('.')[2]}</div>

        ${sectionsHtml}
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};





  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
     <View style={styles.headerContainer}>
  <View style={styles.topRow}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.title}>Өдөр тутмын зааварчилгаа</Text>
  </View>

  {/* Огноо товч - доор тусад нь */}
  <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.dateButton}>
    <Text style={styles.dateButtonText}>{format(selectedDate, 'yyyy.MM.dd')}</Text>
  </TouchableOpacity>

  {/* Calendar Modal */}
  <DateTimePickerModal
    isVisible={isDatePickerVisible}
    mode="date"
    onConfirm={(date) => {
      setSelectedDate(date);
      setDatePickerVisibility(false);
    }}
    onCancel={() => setDatePickerVisibility(false)}
  />
</View>


      {/* Table Header */}
      <View style={[styles.row, styles.tableHeader]}>
        <Text style={styles.headerNumber}>№</Text>
        <Text style={styles.headerName}>Нэр</Text>
        <Text style={styles.headerPosition}>Албан Тушаал</Text>
        <Text style={styles.headerTask}>Гүйцэтгэх Ажил</Text>
        <Text style={styles.headerEngineer}>Илгээсэн</Text>
        <Text style={styles.headerSignature}>Гарын Үсэг</Text>
      </View>

      {/* Data List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F487F" />
          <Text style={styles.loadingText}>Уншиж байна...</Text>
        </View>
      ) : historyList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Өгөгдөл байхгүй байна</Text>
        </View>
      ) : (
        <FlatList
          data={historyList}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* PDF татах товч */}
      <TouchableOpacity style={styles.addButton} onPress={handlePrintPDF}>
        <Text style={styles.addButtonText}>PDF татах</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 80,
    // paddingHorizontal: 10,
  },
  headerContainer: {
  marginBottom: 16,
},
topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
},
backButton: {
  position: 'absolute',
  left: 10,
},
backButtonText: {
  fontSize: 20,
  color: '#2F487F',
  fontWeight: '500',
},
title: {
  fontSize:20,
  fontWeight: '500',
  color: '#2F487F',
},
dateButton: {
  alignSelf: 'flex-end',
  backgroundColor: '#2F487F',
  paddingHorizontal: 16,
  paddingVertical: 6,
  borderRadius: 12,
  right: 10,
},
dateButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
 row: { flexDirection: 'row', paddingVertical: 10, borderColor: '#E0E0E0', alignItems: 'center' },

  tableHeader: { backgroundColor: '#2F487F', borderTopLeftRadius: 8, borderTopRightRadius: 8 },

  // Header cells
  headerNumber: { flex: 0.5, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerName: { flex: 1, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerPosition: { flex: 2, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerTask: { flex: 2, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerEngineer: { flex: 1.3, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerSignature: { flex: 1, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },

  // Data cells
  cellNumber: { flex: 0.3, fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '300' },
  cellName: { flex: 1, fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '300' },
  cellPosition: { flex: 2, fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '300' },
  cellTask: { flex: 1.3, fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '300' },
  cellEngineer: { flex: 1, fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '300' },

  addButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2F487F', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 24, elevation: 3 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 10, fontSize: 14, color: '#2F487F' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#999' },

  signatureCircleContainer: { flex: 0.8, alignItems: 'center', justifyContent: 'center' },
  signatureCircle: { width: 18, height: 18, borderRadius: 12, borderWidth: 1.5, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  signatureText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default InstructionHistoryScreen;
