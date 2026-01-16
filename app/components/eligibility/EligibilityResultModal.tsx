/**
 * 자격 검증 결과 모달 컴포넌트
 * Story 4.4: Implement Eligibility Check UI
 * - 자격 검증 결과를 바텀시트 형태로 표시
 * - 상태별 아이콘 및 색상 적용
 */
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { EligibilityResult, EligibilityStatus } from '@/types/models/eligibility';
import { ELIGIBILITY_STATUS_LABELS } from '@/types/models/eligibility';
import { UnmetRequirementsList } from './UnmetRequirementsList';
import { DisclaimerNotice } from './DisclaimerNotice';

/**
 * 상태별 설정
 */
const STATUS_CONFIG: Record<EligibilityStatus, {
  color: string;
  icon: string;
  message: string;
}> = {
  eligible: {
    color: Palette.success,
    icon: 'checkmark.circle.fill',
    message: '이 혜택에 대한 자격 요건을 모두 충족합니다.',
  },
  ineligible: {
    color: Palette.error,
    icon: 'xmark.circle.fill',
    message: '일부 필수 자격 요건을 충족하지 못합니다.',
  },
  partial: {
    color: Palette.warning,
    icon: 'exclamationmark.triangle.fill',
    message: '대부분의 조건을 충족하나 일부 확인이 필요합니다.',
  },
  unknown: {
    color: Palette.textMuted,
    icon: 'questionmark.circle.fill',
    message: '자동 검증이 어려운 조건이 있습니다. 담당 기관에 문의하세요.',
  },
};

interface EligibilityResultModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 검증 결과 */
  result: EligibilityResult | null | undefined;
  /** 혜택 제목 (표시용) */
  benefitTitle: string;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 로딩 중 여부 */
  isLoading?: boolean;
  /** 프로필 수정 핸들러 */
  onEditProfile?: () => void;
}

/**
 * 자격 검증 결과 모달
 * 바텀시트 형태로 자격 검증 결과를 표시
 *
 * @example
 * ```tsx
 * <EligibilityResultModal
 *   visible={modalVisible}
 *   onClose={() => setModalVisible(false)}
 *   result={eligibilityResult}
 *   benefitTitle={benefit.title}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function EligibilityResultModal({
  visible,
  onClose,
  result,
  benefitTitle,
  colorScheme,
  isLoading = false,
  onEditProfile,
}: EligibilityResultModalProps) {
  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  const status = result?.status || 'unknown';
  const config = STATUS_CONFIG[status];
  const score = result?.score?.total ?? 0;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['bottom']}
      >
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            자격 확인 결과
          </Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <IconSymbol name="xmark" size={20} color={textColor} />
          </Pressable>
        </View>

        {/* 콘텐츠 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <Text style={[styles.loadingText, { color: mutedTextColor }]}>
                자격을 확인하고 있습니다...
              </Text>
            </View>
          ) : (
            <>
              {/* 상태 아이콘 */}
              <View style={styles.iconContainer}>
                <IconSymbol
                  name={config.icon as any}
                  size={64}
                  color={config.color}
                />
              </View>

              {/* 상태 제목 */}
              <Text
                style={[styles.statusTitle, { color: config.color }]}
                accessibilityRole="header"
              >
                {ELIGIBILITY_STATUS_LABELS[status]}
              </Text>

              {/* 혜택 제목 */}
              <Text
                style={[styles.benefitTitle, { color: textColor }]}
                numberOfLines={2}
              >
                {benefitTitle}
              </Text>

              {/* 점수 표시 */}
              <View style={[styles.scoreContainer, { backgroundColor: surfaceColor }]}>
                <Text style={[styles.scoreLabel, { color: mutedTextColor }]}>
                  매칭 점수
                </Text>
                <Text style={[styles.scoreValue, { color: config.color }]}>
                  {score}%
                </Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { width: `${score}%`, backgroundColor: config.color },
                    ]}
                  />
                </View>
              </View>

              {/* 상태 메시지 */}
              <Text style={[styles.message, { color: textColor }]}>
                {config.message}
              </Text>

              {/* 미충족 요건 목록 */}
              {(status === 'ineligible' || status === 'partial') &&
                result?.unmetRequirements &&
                result.unmetRequirements.length > 0 && (
                  <View style={styles.unmetRequirementsContainer}>
                    <UnmetRequirementsList
                      requirements={result.unmetRequirements}
                      colorScheme={colorScheme}
                      onEditProfile={onEditProfile}
                    />
                  </View>
                )}

              {/* 면책 조항 (Story 4.6) */}
              <View style={styles.disclaimerContainer}>
                <DisclaimerNotice
                  colorScheme={colorScheme}
                  testID="eligibility-disclaimer"
                />
              </View>

              {/* 닫기 버튼 */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButtonLarge,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="확인"
              >
                <Text style={styles.closeButtonText}>확인</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerTitle: {
    ...Typography.heading,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  iconContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statusTitle: {
    ...Typography.sectionTitle,
    textAlign: 'center',
  },
  benefitTitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  scoreContainer: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreLabel: {
    ...Typography.caption,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: Palette.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  unmetRequirementsContainer: {
    width: '100%',
  },
  disclaimerContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  closeButtonLarge: {
    width: '100%',
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  closeButtonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
});
