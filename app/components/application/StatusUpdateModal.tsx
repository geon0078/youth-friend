/**
 * 상태 변경 모달 컴포넌트
 * Story 5.7: Implement Application Status Tracking
 *
 * 신청 상태를 수동으로 변경
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  type ColorSchemeName,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { ApplicationStatus } from '@/types/models/application';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/types/models/application';

interface StatusUpdateModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 현재 상태 */
  currentStatus: ApplicationStatus;
  /** 상태 변경 핸들러 */
  onStatusChange: (status: ApplicationStatus, note?: string) => void;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 상태 옵션
 */
const STATUS_OPTIONS: {
  status: ApplicationStatus;
  icon: string;
  description: string;
}[] = [
  {
    status: 'preparing',
    icon: 'doc.text',
    description: '서류 준비 중',
  },
  {
    status: 'applied',
    icon: 'paperplane.fill',
    description: '신청서를 제출했습니다',
  },
  {
    status: 'approved',
    icon: 'checkmark.circle.fill',
    description: '신청이 승인되었습니다',
  },
  {
    status: 'rejected',
    icon: 'xmark.circle.fill',
    description: '신청이 거부되었습니다',
  },
  {
    status: 'withdrawn',
    icon: 'arrow.uturn.left.circle',
    description: '신청을 철회했습니다',
  },
];

/**
 * 상태 변경 모달
 */
export function StatusUpdateModal({
  visible,
  currentStatus,
  onStatusChange,
  onClose,
  colorScheme,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);
  const [note, setNote] = useState('');

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const backgroundColor = getSemanticColor(colorScheme, 'background');

  const handleConfirm = () => {
    onStatusChange(selectedStatus, note.trim() || undefined);
    setNote('');
    onClose();
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: surfaceColor }]}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              상태 변경
            </Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <IconSymbol name="xmark" size={20} color={mutedTextColor} />
            </Pressable>
          </View>

          {/* 상태 옵션 */}
          <View style={styles.optionList}>
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedStatus === option.status;
              const color = APPLICATION_STATUS_COLORS[option.status];

              return (
                <Pressable
                  key={option.status}
                  onPress={() => setSelectedStatus(option.status)}
                  style={[
                    styles.optionItem,
                    { borderColor: isSelected ? color : Palette.border },
                    isSelected && { backgroundColor: `${color}10` },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: `${color}20` }]}>
                    <IconSymbol
                      name={option.icon as any}
                      size={20}
                      color={color}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, { color: textColor }]}>
                      {APPLICATION_STATUS_LABELS[option.status]}
                    </Text>
                    <Text style={[styles.optionDescription, { color: mutedTextColor }]}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={color}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* 메모 입력 */}
          <View style={styles.noteSection}>
            <Text style={[styles.noteLabel, { color: mutedTextColor }]}>
              메모 (선택)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="상태 변경에 대한 메모를 남겨주세요"
              placeholderTextColor={mutedTextColor}
              style={[
                styles.noteInput,
                { color: textColor, backgroundColor, borderColor: Palette.border },
              ]}
              multiline
              numberOfLines={2}
              maxLength={200}
            />
          </View>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleClose}
              style={[styles.button, styles.cancelButton]}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: mutedTextColor }]}>
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
              accessibilityRole="button"
            >
              <Text style={styles.confirmButtonText}>변경</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  optionList: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.labelBold,
  },
  optionDescription: {
    ...Typography.caption,
    marginTop: 2,
  },
  noteSection: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  noteLabel: {
    ...Typography.caption,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Typography.body,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Palette.border,
  },
  cancelButtonText: {
    ...Typography.labelBold,
  },
  confirmButton: {
    backgroundColor: Palette.primary,
  },
  confirmButtonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
});
