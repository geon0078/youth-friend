/**
 * 서류 체크리스트 컴포넌트
 * Story 5.3: Implement Document Checklist
 *
 * 서류 준비 상태를 체크하고 관리
 */
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
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
import type { RequiredDocument } from '@/types/models/application';

interface DocumentChecklistProps {
  /** 서류 목록 */
  documents: RequiredDocument[];
  /** 서류 체크 상태 확인 함수 */
  isChecked: (documentId: string) => boolean;
  /** 체크 토글 핸들러 */
  onToggle: (documentId: string) => void;
  /** 진행률 (0-100) */
  progress: number;
  /** 체크된 개수 */
  checkedCount: number;
  /** 전체 개수 */
  totalCount: number;
  /** 초기화 핸들러 */
  onReset?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 체크박스 아이템 컴포넌트
 */
function ChecklistItem({
  document,
  isChecked,
  onToggle,
  colorScheme,
}: {
  document: RequiredDocument;
  isChecked: boolean;
  onToggle: () => void;
  colorScheme?: ColorSchemeName;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  // 체크 애니메이션
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // 탭 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.checklistItem,
          pressed && styles.checklistItemPressed,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        accessibilityLabel={`${document.name}, ${isChecked ? '준비 완료' : '준비 필요'}`}
        accessibilityHint="탭하여 준비 상태를 변경합니다"
      >
        <View
          style={[
            styles.checkbox,
            isChecked && styles.checkboxChecked,
          ]}
        >
          {isChecked && (
            <IconSymbol
              name="checkmark"
              size={14}
              color={Palette.textOnPrimary}
            />
          )}
        </View>
        <View style={styles.checklistItemContent}>
          <Text
            style={[
              styles.checklistItemName,
              { color: textColor },
              isChecked && styles.checklistItemNameChecked,
            ]}
          >
            {document.name}
          </Text>
          {document.required && !isChecked && (
            <View style={styles.requiredIndicator}>
              <Text style={styles.requiredIndicatorText}>필수</Text>
            </View>
          )}
        </View>
        <Text style={[styles.issuerText, { color: mutedTextColor }]}>
          {document.issuer.split(',')[0]}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * 진행률 바 컴포넌트
 */
function ProgressBar({
  progress,
  colorScheme,
}: {
  progress: number;
  colorScheme?: ColorSchemeName;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarTrack}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: progressWidth },
            progress === 100 && styles.progressBarComplete,
          ]}
        />
      </View>
    </View>
  );
}

/**
 * 서류 체크리스트
 *
 * @example
 * ```tsx
 * <DocumentChecklist
 *   documents={documents}
 *   isChecked={isDocumentChecked}
 *   onToggle={toggleDocument}
 *   progress={progress}
 *   checkedCount={checkedCount}
 *   totalCount={totalCount}
 *   onReset={resetChecklist}
 * />
 * ```
 */
export function DocumentChecklist({
  documents,
  isChecked,
  onToggle,
  progress,
  checkedCount,
  totalCount,
  onReset,
  colorScheme,
  testID = 'document-checklist',
}: DocumentChecklistProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 서류가 없는 경우
  if (documents.length === 0) {
    return null;
  }

  const isComplete = progress === 100;

  return (
    <View style={styles.container} testID={testID}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            name="checklist"
            size={20}
            color={isComplete ? Palette.success : textColor}
          />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            서류 준비 체크리스트
          </Text>
        </View>
        {onReset && checkedCount > 0 && (
          <Pressable
            onPress={onReset}
            style={styles.resetButton}
            accessibilityRole="button"
            accessibilityLabel="체크리스트 초기화"
          >
            <Text style={[styles.resetButtonText, { color: mutedTextColor }]}>
              초기화
            </Text>
          </Pressable>
        )}
      </View>

      {/* 진행률 */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} colorScheme={colorScheme} />
        <View style={styles.progressInfo}>
          <Text
            style={[
              styles.progressText,
              { color: isComplete ? Palette.success : textColor },
            ]}
          >
            {checkedCount}/{totalCount} 준비 완료
          </Text>
          <Text
            style={[
              styles.progressPercent,
              { color: isComplete ? Palette.success : Palette.primary },
            ]}
          >
            {progress}%
          </Text>
        </View>
      </View>

      {/* 완료 메시지 */}
      {isComplete && (
        <View style={styles.completeMessage}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={20}
            color={Palette.success}
          />
          <Text style={styles.completeMessageText}>
            모든 서류 준비가 완료되었습니다!
          </Text>
        </View>
      )}

      {/* 체크리스트 */}
      <View style={[styles.checklistContainer, { backgroundColor: surfaceColor }]}>
        {documents.map((doc) => (
          <ChecklistItem
            key={doc.id}
            document={doc}
            isChecked={isChecked(doc.id)}
            onToggle={() => onToggle(doc.id)}
            colorScheme={colorScheme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.labelBold,
  },
  resetButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  resetButtonText: {
    ...Typography.caption,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarTrack: {
    flex: 1,
    backgroundColor: Palette.border,
    borderRadius: Radius.full,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: Radius.full,
  },
  progressBarComplete: {
    backgroundColor: Palette.success,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...Typography.caption,
  },
  progressPercent: {
    ...Typography.captionBold,
  },
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.successBackground,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  completeMessageText: {
    ...Typography.caption,
    color: Palette.success,
  },
  checklistContainer: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    overflow: 'hidden',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  checklistItemPressed: {
    backgroundColor: Palette.background,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Palette.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checklistItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  checklistItemName: {
    ...Typography.body,
  },
  checklistItemNameChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  requiredIndicator: {
    backgroundColor: Palette.errorBackground,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  requiredIndicatorText: {
    ...Typography.caption,
    fontSize: 9,
    color: Palette.error,
  },
  issuerText: {
    ...Typography.caption,
    fontSize: 11,
  },
});
