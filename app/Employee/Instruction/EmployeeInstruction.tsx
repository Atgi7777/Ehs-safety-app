import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { BASE_URL } from '../../../src/config';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const EmployeeInstruction = () => {
  const router = useRouter();
  const navigation = useNavigation();
const { employeeId, employeeName: rawEmployeeName } = useLocalSearchParams();

const [employeeName, setEmployeeName] = useState<string>(''); // эхний утга хоосон

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    fetchInstructionHistory();
  }, [startDate, endDate]);
useEffect(() => {
  if (rawEmployeeName) {
    const parsed = Array.isArray(rawEmployeeName) ? rawEmployeeName[0] : rawEmployeeName;
    setEmployeeName(parsed);
  }
}, [rawEmployeeName]);
  const fetchInstructionHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('Token олдсонгүй');

      const res = await axios.get(
        `${BASE_URL}/api/instruction/employee/group-instructions`,
        {
          params: {
            employee_id: employeeId,
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHistoryList(res.data);
      if (res.data.length > 0) {
      const name = res.data[0]?.instruction?.employee?.name || res.data[0]?.employee?.name;
      if (name) setEmployeeName(name);
    }

    } catch (err) {
      console.error('Алдаа:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = async () => {
  if (historyList.length === 0) {
    Alert.alert('Анхааруулга', 'Харуулах мэдээлэл алга.');
    return;
  }

  const today = format(new Date(), 'yyyy.MM.dd');

  const rowsHtml = historyList.map((item, index) => {
    const signaturePhoto = item.signature?.[0]?.signature_photo;
    const signedAt = item.viewed_at ? format(new Date(item.viewed_at), 'HH:mm') : '';
    const locationDetail = item.location?.[0]?.location_detail || '-';

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.instruction?.title || ''}</td>
        <td>${item.instruction?.description || '-'}</td>
        <td>${item.instruction?.safetyEngineer?.name || ''}</td>
        <td>${item.viewed ? '✓' : '✗'}</td>
        <td>${signedAt}</td>
        <td>${locationDetail}</td>
        <td>
          ${
            signaturePhoto
              ? `<img src="${signaturePhoto}" style="width:100px;height:50px;object-fit:contain;border:1px solid #ccc;border-radius:4px;" />`
              : '—'
          }
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px; }
          img { max-width: 100px; max-height: 50px; }
        </style>
      </head>
      <body>
        <h2>Ажилтны өдөр тутмын зааварчилгааны бүртгэл</h2>
        <p><b>Ажилтны нэр:</b> ${employeeName || 'Тодорхойгүй'}</p>

        
        <p>Хугацаа: ${format(startDate, 'yyyy.MM.dd')} → ${format(endDate, 'yyyy.MM.dd')}</p>
        <p>Огноо: ${today}</p>

        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Гарчиг</th>
              <th>Тайлбар</th>
              <th>ХАБ инженер</th>
              <th>Үзсэн</th>
              <th>Цаг</th>
              <th>Байршил</th>
              <th>Гарын үсэг</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};


  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/Employee/Instruction/InstructionDetailScreen',
          params: { id: item.instruction?.id },
        })
      }
    >
      <View style={styles.row}>
        <Text style={styles.cellNumber}>{index + 1}</Text>
        <Text style={styles.cellTask}>{item.instruction?.title || ''}</Text>
        <Text style={styles.cellEngineer}>{item.instruction?.safetyEngineer?.name || ''}</Text>

        <View style={styles.signatureCircleContainer}>
          {item.viewed ? (
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Өдөр тутмын зааварчилгаа</Text>
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity onPress={() => setDatePickerTarget('start')} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Эхлэх: {format(startDate, 'yyyy.MM.dd')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDatePickerTarget('end')} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Дуусах: {format(endDate, 'yyyy.MM.dd')}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={datePickerTarget !== null}
          mode="date"
          onConfirm={(date) => {
            if (datePickerTarget === 'start') setStartDate(date);
            else if (datePickerTarget === 'end') setEndDate(date);
            setDatePickerTarget(null);
          }}
          onCancel={() => setDatePickerTarget(null)}
        />
      </View>

      {/* Table Header */}
      <View style={[styles.row, styles.tableHeader]}>
        <Text style={styles.headerNumber}>№</Text>
        <Text style={styles.headerTask}>Зааварчилгаа</Text>
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
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* PDF Button */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.pdfButton} onPress={handlePrintPDF}>
          <Text style={styles.pdfButtonText}>📄 PDF татах</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmployeeInstruction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 80,
  },
  headerContainer: { marginBottom: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButton: { position: 'absolute', left: 10 },
  backButtonText: { fontSize: 20, color: '#2F487F', fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '500', color: '#2F487F', marginBottom: 20 },

  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#2F487F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#2F487F',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerNumber: { flex: 0.5, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerTask: { flex: 2, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerEngineer: { flex: 1.3, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },
  headerSignature: { flex: 1, fontWeight: '500', color: '#fff', textAlign: 'center', fontSize: 12 },

  cellNumber: { flex: 0.3, fontSize: 12, textAlign: 'center', color: '#333' },
  cellTask: { flex: 1.3, fontSize: 12, textAlign: 'center', color: '#333' },
  cellEngineer: { flex: 1, fontSize: 12, textAlign: 'center', color: '#333' },

  signatureCircleContainer: { flex: 0.8, alignItems: 'center', justifyContent: 'center' },
  signatureCircle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 10, fontSize: 14, color: '#2F487F' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#999' },

  pdfButton: {
    backgroundColor: '#2F487F',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
