/**
 * 나중에 하기 버튼 컴포넌트
 * Story 5.5: Implement Application Progress Saving
 *
 * 진행 중인 신청을 저장하고 나중에 이어서 하기
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
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
import type { DocumentChecklist } from '@/types/models/application';

interface SaveForLaterButtonProps {
  /** 저장됨 여부 */
  isSaved: boolean;
  /** 저장 핸들러 */
  onSave: (checklist?: DocumentChecklist) => void;
  /** 삭제 핸들러 */
  onRemove: () => void;
  /** 저장된 신청 화면으로 이동 */
  onViewSaved?: () => void;
  /** 현재 체크리스트 */
  currentChecklist?: DocumentChecklist;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 나중에 하기 버튼
 *
 * @example
 * ```tsx
 * <SaveForLaterButton
 *   isSaved={isSaved}
 *   onSave={handleSave}
 *   onRemove={handleRemove}
 *   currentChecklist={checklist}
 * />
 * ```
 */
export function SaveForLaterButton({
  isSaved,
  onSave,
  onRemove,
  onViewSaved,
  currentChecklist,
  colorScheme,
  testID = 'save-for-later-button',
}: SaveForLaterButtonProps) {
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const handleSave = () => {
    onSave(currentChecklist);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const handleRemove = () => {
    onRemove();
  };

  // 저장된 상태
  if (isSaved) {
    return (
      <View style={styles.container} testID={testID}>
        <View
          style={[styles.savedBanner, { backgroundColor: Palette.successBackground }]}
        >
          <IconSymbol
            name="bookmark.fill"
            size={16}
            color={Palette.success}
          />
          <Text style={[styles.savedText, { color: Palette.success }]}>
            저장된 신청입니다
          </Text>
        </View>

        <View style={styles.buttonRow}>
          {onViewSaved && (
            <Pressable
              onPress={onViewSaved}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: surfaceColor },
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="저장된 신청 보기"
            >
              <IconSymbol name="list.bullet" size={16} color={Palette.primary} />
              <Text style={[styles.secondaryButtonText, { color: Palette.primary }]}>
                저장 목록
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleRemove}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: surfaceColor },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="저장 취소"
          >
            <IconSymbol name="bookmark.slash" size={16} color={Palette.error} />
            <Text style={[styles.secondaryButtonText, { color: Palette.error }]}>
              저장 취소
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 저장 피드백 표시
  if (showSavedFeedback) {
    return (
      <View style={styles.container} testID={testID}>
        <View
          style={[styles.feedbackBanner, { backgroundColor: Palette.successBackground }]}
        >
          <IconSymbol
            name="checkmark.circle.fill"
            size={20}
            color={Palette.success}
          />
          <Text style={[styles.feedbackText, { color: Palette.success }]}>
            저장되었습니다! 신청 탭에서 확인하세요.
          </Text>
        </View>
      </View>
    );
  }

  // 저장 안 된 상태
  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveButton,
          { borderColor: Palette.border },
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="나중에 하기"
        accessibilityHint="이 신청을 저장하여 나중에 이어서 진행합니다"
      >
        <IconSymbol name="bookmark" size={20} color={textColor} />
        <Text style={[styles.saveButtonText, { color: textColor }]}>
          나중에 하기
        </Text>
      </Pressable>
      <Text style={[styles.helpText, { color: mutedTextColor }]}>
        진행 상태를 저장하고 나중에 이어서 진행하세요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...Typography.labelBold,
  },
  helpText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  savedText: {
    ...Typography.caption,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  secondaryButtonText: {
    ...Typography.caption,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  feedbackText: {
    ...Typography.labelBold,
  },
});
