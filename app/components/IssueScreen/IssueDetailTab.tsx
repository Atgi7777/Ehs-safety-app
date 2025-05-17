import React from 'react';
import {
  View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { BASE_URL } from '../../../src/config';


const getFullImageUrl = (img: any) => {
  if (!img) return '';
  // Хэрэв img.uri байгаа бол (шинээр сонгосон зураг)
  if (img.uri) return img.uri;
  // Хэрэв image_url бүрэн URL байвал шууд буцаана
  if (img.image_url?.startsWith('http')) return img.image_url;
  // Үгүй бол серверийн BASE_URL + relative path-г буцаана
  return `${BASE_URL}/${img.image_url}`;
};

const statusColors: any = {
  pending: '#FCF6DF',
  in_progress: '#D0E7F6',
  resolved: '#C9F7DF'
};
const statusTextColors: any = {
  pending: '#D3B100',
  in_progress: '#2196F3',
  resolved: '#2BC48A'
};
const statusLabels: any = {
  pending: 'Хүлээгдэж байгаа',
  in_progress: 'Засаж байгаа',
  resolved: 'Шийдэгдсэн'
};

type Props = {
  issue: any;
  status: string;
  setStatus: (v: string) => void;
  statusOpen: boolean;
  setStatusOpen: (v: boolean) => void;
  description: string;
  setDescription: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  cause: string;
  setCause: (v: string) => void;
  images: any[];
  addImage: () => void;
  removeImage: (i: number) => void;
  handleDelete: () => void;
  handleSave: () => void;
};

const IssueDetailTab: React.FC<Props> = ({
  issue, status, setStatus, statusOpen, setStatusOpen,
  description, setDescription, location, setLocation, cause, setCause,
  images, addImage, removeImage, handleDelete, handleSave
}) => {
  const renderStatus = () => (
    <TouchableOpacity
      style={[styles.statusChip, { backgroundColor: statusColors[status] }]}
      onPress={() => setStatusOpen(true)}
      activeOpacity={0.85}
    >
      <Text style={{ color: statusTextColors[status], fontWeight: '700', fontSize: 15 }}>
        {statusLabels[status]}
      </Text>
      <Ionicons name="chevron-down" size={16} color={statusTextColors[status]} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );


  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Feather name="check-square" size={20} color="#294478" />
          <Text style={styles.cardTitle}>Асуудал</Text>
          <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#294478" />
          </TouchableOpacity>
        </View>
        <Text style={styles.issueTitle}>{issue?.title || 'Ус алдсан'}</Text>
        <View style={styles.statusRow}>
          {renderStatus()}
          <DropDownPicker
          
            open={statusOpen}
            value={status}
       setOpen={val => setStatusOpen(!!val)}
setValue={val => setStatus(String(val))}



            items={[
              { label: 'Хүлээгдэж байгаа', value: 'pending' },
              { label: 'Засаж байгаа', value: 'in_progress' },
              { label: 'Шийдэгдсэн', value: 'resolved' }
            ]}
            listMode="SCROLLVIEW"
            style={{ display: 'none' }}
          />
        </View>
        <Text style={styles.label}>Тайлбар</Text>
        <TextInput
          style={[styles.input, { minHeight: 44, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="..."
          placeholderTextColor="#B6BBC7"
          multiline={true}
        />
        <Text style={styles.label}>Хаана болсон</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="..."
          placeholderTextColor="#B6BBC7"
        />
        <Text style={styles.label}>Юунаас болсон</Text>
        <TextInput
          style={styles.input}
          value={cause}
          onChangeText={setCause}
          placeholder="..."
          placeholderTextColor="#B6BBC7"
        />
        <Text style={styles.label}>Зураг</Text>
       <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.imagesRow}
>
  <TouchableOpacity style={styles.addImageBox} onPress={addImage}>
    <Feather name="plus" size={32} color="#294478" />
  </TouchableOpacity>
  {images.map((img, i) => (
    <View key={i} style={styles.imageWrap}>
      <Image source={{ uri: getFullImageUrl(img) }} style={styles.image} />
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
        <Feather name="minus-circle" size={22} color="#D43D21" />
      </TouchableOpacity>
    </View>
  ))}
</ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Хадгалах</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default IssueDetailTab;

// СТИЛЬ-ээ EditIssueScreen styles-аас хуулж авна.
const CARD_RADIUS = 20;
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
  tabActive: {
    color: '#2F487F',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 22,
    width: '94%',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#294478',
    fontWeight: '600',
    marginLeft: 8,
  },
  issueTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginVertical: 3,
    marginBottom: 8
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 12,
    minHeight: 33
  },
  label: {
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#F7F9FB',
    borderRadius: 12,
    borderColor: '#E5E8F3',
    borderWidth: 1,
    padding: 13,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    color: '#909090',
    textAlignVertical: 'top',
  },
  imagesRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, gap: 12 },
  addImageBox: {
    width: 90, height: 90,
    borderRadius: 16,
    backgroundColor: '#F3F5FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E9F2',
    marginRight: 6
  },
  imageWrap: { position: 'relative', marginRight: 6 },
  image: {
    width: 90, height: 90,
    borderRadius: 15,
    backgroundColor: '#F2F3FA'
  },
  removeBtn: {
    position: 'absolute', top: -12, right: -12,
 
    borderRadius: 24,

   backgroundColor: '#fff',
    elevation: 2,
    padding: 2,
  },
  saveButton: {
    backgroundColor: '#294478',
    marginTop: 17,
    borderRadius: 13,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#284078',
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: 1.2,
  }
});
