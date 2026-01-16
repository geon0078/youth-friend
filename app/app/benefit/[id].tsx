/**
 * 혜택 상세 화면
 * - 동적 라우트 [id]
 * - 화면 전환 300ms 이내 (NFR2)
 * - Story 3.7: Implement Benefit Detail Screen
 * - Story 3.8: Implement External Link to Government Page
 * - Story 4.4: Implement Eligibility Check UI
 */
import { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBenefitDetail, useCheckEligibility } from '@/hooks';
import {
  BenefitDetail,
  BenefitDetailSkeleton,
  ExternalLinkButton,
} from '@/components/benefits';
import {
  EligibilityCheckButton,
  EligibilityResultModal,
} from '@/components/eligibility';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Typography,
  getSemanticColor,
} from '@/design-system';

/**
 * 혜택 상세 화면
 * 혜택 카드를 탭했을 때 이동하는 상세 정보 화면
 */
export default function BenefitDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: benefit, isLoading, isError, error } = useBenefitDetail(id);

  // 자격 검증 상태
  const [modalVisible, setModalVisible] = useState(false);
  const {
    result: eligibilityResult,
    isLoading: isCheckingEligibility,
    hasProfile,
  } = useCheckEligibility(benefit);

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 프로필 설정 화면으로 이동
  const handleSetupProfile = () => {
    router.push('/(tabs)/profile/edit' as Href);
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/benefits' as Href);
    }
  };

  // 헤더 컴포넌트
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: surfaceColor }]}>
      <Pressable
        onPress={handleGoBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        accessibilityHint="이전 화면으로 돌아갑니다"
      >
        <IconSymbol
          name="chevron.left"
          size={24}
          color={textColor}
        />
      </Pressable>
      <Text
        style={[styles.headerTitle, { color: textColor }]}
        numberOfLines={1}
      >
        혜택 상세
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  // 에러 상태
  if (isError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['top', 'bottom']}
      >
        {renderHeader()}
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={48}
            color={Palette.error}
          />
          <Text style={[styles.errorTitle, { color: textColor }]}>
            혜택 정보를 불러올 수 없습니다
          </Text>
          <Text style={[styles.errorMessage, { color: mutedTextColor }]}>
            {error?.message || '네트워크 연결을 확인해주세요'}
          </Text>
          <Pressable
            onPress={handleGoBack}
            style={styles.errorButton}
            accessibilityRole="button"
            accessibilityLabel="목록으로 돌아가기"
          >
            <Text style={styles.errorButtonText}>목록으로 돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 로딩 상태
  if (isLoading || !benefit) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['top', 'bottom']}
      >
        {renderHeader()}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BenefitDetailSkeleton colorScheme={colorScheme} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 정상 상태
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top', 'bottom']}
    >
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={`${benefit.title} 혜택 상세 정보`}
      >
        <BenefitDetail benefit={benefit} colorScheme={colorScheme} />

        {/* 자격 확인 버튼 */}
        <EligibilityCheckButton
          status={eligibilityResult?.status}
          isLoading={isCheckingEligibility}
          hasProfile={hasProfile}
          score={eligibilityResult?.score.total}
          onPress={() => setModalVisible(true)}
          onSetupProfile={handleSetupProfile}
          colorScheme={colorScheme}
        />

        <View style={styles.externalLinkContainer}>
          <ExternalLinkButton
            url={benefit.applicationUrl || benefit.detailUrl}
            colorScheme={colorScheme}
          />
        </View>
      </ScrollView>

      {/* 자격 검증 결과 모달 */}
      <EligibilityResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        result={eligibilityResult}
        benefitTitle={benefit.title}
        colorScheme={colorScheme}
        isLoading={isCheckingEligibility}
        onEditProfile={handleSetupProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  externalLinkContainer: {
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    ...Typography.heading,
    textAlign: 'center',
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorButtonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
});
