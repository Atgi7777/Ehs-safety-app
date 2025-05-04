import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';

export type MediaPickerModalRef = {
  open: () => void;
};

type MediaPickerModalProps = {
  onPickImage: () => void;
  // onPickVideo?: () => void; // Дараа нэмэх бололцоотой
  // onPickAudio?: () => void;
};

const MediaPickerModal = forwardRef<MediaPickerModalRef, MediaPickerModalProps>(({ onPickImage }, ref) => {
  const modalRef = useRef<Modalize>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current?.open();
    },
  }));

  return (
    <Modalize ref={modalRef} snapPoint={250} modalHeight={250}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.optionButton} onPress={onPickImage}>
          <Ionicons name="image-outline" size={24} color="#2F487F" />
          <Text style={styles.optionText}>Зурган сургалт оруулах</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="videocam-outline" size={24} color="#2F487F" />
          <Text style={styles.optionText}>Видео бичлэг оруулах</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="mic-outline" size={24} color="#2F487F" />
          <Text style={styles.optionText}>Аудио бичлэг оруулах</Text>
        </TouchableOpacity>
      </View>
    </Modalize>
  );
});

export default MediaPickerModal;

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#2F487F',
  },
});
