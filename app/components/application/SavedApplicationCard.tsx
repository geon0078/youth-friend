/**
 * 저장된 신청 카드 컴포넌트
 * Story 5.6: Implement Saved Applications Screen
 *
 * 저장된 신청 목록에서 개별 항목 표시
 */
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
import type { SavedApplication } from '@/types/models/application';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  calculateChecklistProgress,
  isDeadlineApproaching,
  getDaysUntilDeadline,
} from '@/types/models/application';
import { getCategoryInfo } from '@/utils/category';

interface SavedApplicationCardProps {
  /** 저장된 신청 데이터 */
  application: SavedApplication;
  /** 카드 탭 핸들러 */
  onPress: (application: SavedApplication) => void;
  /** 삭제 핸들러 */
  onDelete?: (application: SavedApplication) => void;
  /** 길게 누름 핸들러 (상태 변경용) */
  onLongPress?: (application: SavedApplication) => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 저장된 신청 카드
 *
 * @example
 * ```tsx
 * <SavedApplicationCard
 *   application={savedApp}
 *   onPress={handlePress}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function SavedApplicationCard({
  application,
  onPress,
  onDelete,
  onLongPress,
  colorScheme,
  testID = 'saved-application-card',
}: SavedApplicationCardProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const progress = calculateChecklistProgress(application.checklist);
  const isUrgent = isDeadlineApproaching(application.deadline);
  const daysLeft = getDaysUntilDeadline(application.deadline);
  const categoryInfo = getCategoryInfo(application.benefitCategory as any);
  const statusColor = APPLICATION_STATUS_COLORS[application.status];
  const statusLabel = APPLICATION_STATUS_LABELS[application.status];

  // 마감일 표시 텍스트
  const getDeadlineText = () => {
    if (!application.deadline) return null;
    if (
      application.deadline.includes('상시') ||
      application.deadline.includes('수시')
    ) {
      return '상시 모집';
    }
    if (daysLeft === null) return application.deadline;
    if (daysLeft < 0) return '마감됨';
    if (daysLeft === 0) return '오늘 마감';
    if (daysLeft === 1) return '내일 마감';
    return `${daysLeft}일 남음`;
  };

  const deadlineText = getDeadlineText();

  return (
    <Pressable
      onPress={() => onPress(application)}
      onLongPress={onLongPress ? () => onLongPress(application) : undefined}
      delayLongPress={500}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: surfaceColor },
        pressed && styles.containerPressed,
        isUrgent && styles.containerUrgent,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${application.benefitTitle}, ${statusLabel}, 서류 ${progress}% 준비 완료`}
      accessibilityHint={onLongPress ? '길게 눌러 상태 변경' : undefined}
    >
      {/* 마감 임박 배지 */}
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <IconSymbol name="exclamationmark.triangle.fill" size={12} color={Palette.error} />
          <Text style={styles.urgentText}>마감 임박</Text>
        </View>
      )}

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.backgroundColor }]}>
          <IconSymbol
            name={categoryInfo.icon as any}
            size={16}
            color={categoryInfo.color}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.title, { color: textColor }]}
            numberOfLines={2}
          >
            {application.benefitTitle}
          </Text>
          <Text style={[styles.category, { color: mutedTextColor }]}>
            {categoryInfo.label}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* 진행률 */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: mutedTextColor }]}>
            서류 준비
          </Text>
          <Text
            style={[
              styles.progressPercent,
              { color: progress === 100 ? Palette.success : Palette.primary },
            ]}
          >
            {progress}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              progress === 100 && styles.progressComplete,
            ]}
          />
        </View>
      </View>

      {/* 하단 정보 */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {deadlineText && (
            <View style={styles.deadlineInfo}>
              <IconSymbol
                name="calendar"
                size={12}
                color={isUrgent ? Palette.error : mutedTextColor}
              />
              <Text
                style={[
                  styles.deadlineText,
                  { color: isUrgent ? Palette.error : mutedTextColor },
                ]}
              >
                {deadlineText}
              </Text>
            </View>
          )}
        </View>

        {onDelete && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete(application);
            }}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="삭제"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="trash" size={16} color={Palette.error} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  containerUrgent: {
    borderColor: Palette.error,
    borderWidth: 2,
  },
  urgentBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.errorBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  urgentText: {
    ...Typography.caption,
    fontSize: 10,
    color: Palette.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.labelBold,
    fontSize: 15,
  },
  category: {
    ...Typography.caption,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...Typography.caption,
  },
  progressPercent: {
    ...Typography.captionBold,
  },
  progressBar: {
    height: 6,
    backgroundColor: Palette.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: Radius.full,
  },
  progressComplete: {
    backgroundColor: Palette.success,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    ...Typography.caption,
    fontSize: 11,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});
