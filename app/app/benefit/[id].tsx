/**
 * 혜택 상세 화면
 * - 동적 라우트 [id]
 * - 화면 전환 300ms 이내 (NFR2)
 * - Story 3.7: Implement Benefit Detail Screen
 * - Story 3.8: Implement External Link to Government Page
 * - Story 4.4: Implement Eligibility Check UI
 * - Story 5.2: Implement Document List Display
 */
import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBenefitDetail, useCheckEligibility, useDocumentChecklist, useBenefitSaveStatus } from '@/hooks';
import {
  BenefitDetail,
  BenefitDetailSkeleton,
  ExternalLinkButton,
} from '@/components/benefits';
import {
  EligibilityCheckButton,
  EligibilityResultModal,
} from '@/components/eligibility';
import { DocumentList, DocumentChecklist, ApplyButton, SaveForLaterButton } from '@/components/application';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { parseDocumentsFromBenefit } from '@/utils';

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

  // 필요 서류 파싱
  const requiredDocuments = useMemo(() => {
    if (!benefit) return [];
    return parseDocumentsFromBenefit(benefit);
  }, [benefit]);

  // 서류 체크리스트
  const {
    checklist,
    progress: checklistProgress,
    checkedCount,
    totalCount,
    isAllChecked: isChecklistComplete,
    toggleDocument,
    resetChecklist,
    isDocumentChecked,
  } = useDocumentChecklist(id || '', requiredDocuments);

  // 저장 상태
  const {
    isSaved,
    save: saveApplication,
    remove: removeApplication,
  } = useBenefitSaveStatus(
    id || '',
    benefit?.title || '',
    benefit?.category || 'welfare',
    benefit?.deadline
  );

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

        {/* 필요 서류 목록 */}
        <DocumentList
          documents={requiredDocuments}
          colorScheme={colorScheme}
        />

        {/* 서류 체크리스트 */}
        {requiredDocuments.length > 0 && (
          <DocumentChecklist
            documents={requiredDocuments}
            isChecked={isDocumentChecked}
            onToggle={toggleDocument}
            progress={checklistProgress}
            checkedCount={checkedCount}
            totalCount={totalCount}
            onReset={resetChecklist}
            colorScheme={colorScheme}
          />
        )}

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

        {/* 신청하기 버튼 */}
        <ApplyButton
          applicationUrl={benefit.applicationUrl}
          benefitTitle={benefit.title}
          isChecklistComplete={isChecklistComplete}
          checklistProgress={checklistProgress}
          colorScheme={colorScheme}
        />

        {/* 나중에 하기 버튼 */}
        <SaveForLaterButton
          isSaved={isSaved}
          onSave={() => saveApplication(checklist || undefined)}
          onRemove={removeApplication}
          currentChecklist={checklist || undefined}
          colorScheme={colorScheme}
        />

        {/* 공식 페이지 링크 (신청 URL이 없을 때만 표시) */}
        {!benefit.applicationUrl && benefit.detailUrl && (
          <View style={styles.externalLinkContainer}>
            <ExternalLinkButton
              url={benefit.detailUrl}
              colorScheme={colorScheme}
            />
          </View>
        )}
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
