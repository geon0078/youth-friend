/**
 * 나이별 혜택 타임라인 탭
 * - 현재 나이부터 34세까지 혜택 확인
 * - Story 3.9: Implement Age Timeline View
 */
import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBenefits } from '@/hooks/use-benefits';
import { useUserStore } from '@/stores/user-store';
import {
  AgeTimeline,
  BenefitCard,
  BenefitCardSkeleton,
  EmptyBenefitsList,
} from '@/components/benefits';
import {
  Palette,
  Spacing,
  Typography,
  getSemanticColor,
} from '@/design-system';
import {
  calculateAge,
  getBenefitsByAge,
  getAgeBenefitCounts,
  YOUTH_AGE_RANGE,
} from '@/utils/age-filter';
import type { Benefit } from '@/types/models/benefit';

/**
 * 타임라인 탭 화면
 * 나이별 혜택을 타임라인 형태로 표시
 */
export default function TimelineScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const profile = useUserStore((state) => state.profile);
  const userRegion = profile?.region;

  // 사용자 지역 기반 혜택 조회
  const { data, isLoading, isError } = useBenefits({ region: userRegion });

  // 현재 나이 계산 (프로필 없으면 기본값 25세)
  const currentAge = useMemo(() => {
    if (!profile?.birthYear) {
      return 25; // 기본값
    }
    const age = calculateAge(profile.birthYear);
    // 청년 범위 내로 제한
    return Math.max(YOUTH_AGE_RANGE.MIN, Math.min(YOUTH_AGE_RANGE.MAX, age));
  }, [profile?.birthYear]);

  // 선택된 나이 (초기값: 현재 나이)
  const [selectedAge, setSelectedAge] = useState(currentAge);

  // currentAge가 변경되면 selectedAge도 업데이트
  useEffect(() => {
    setSelectedAge(currentAge);
  }, [currentAge]);

  const benefits = data?.items || [];

  // 나이별 혜택 개수 계산
  const benefitCounts = useMemo(() => {
    return getAgeBenefitCounts(
      benefits,
      YOUTH_AGE_RANGE.MIN,
      YOUTH_AGE_RANGE.MAX
    );
  }, [benefits]);

  // 선택된 나이의 혜택 필터링
  const filteredBenefits = useMemo(() => {
    return getBenefitsByAge(benefits, selectedAge);
  }, [benefits, selectedAge]);

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
  };

  const handleBenefitPress = (benefit: Benefit) => {
    router.push(`/benefit/${benefit.id}` as Href);
  };

  const renderBenefitItem = ({ item }: { item: Benefit }) => (
    <View style={styles.cardWrapper}>
      <BenefitCard
        benefit={item}
        onPress={() => handleBenefitPress(item)}
        colorScheme={colorScheme}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 페이지 타이틀 */}
      <View style={[styles.titleSection, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          나이별 혜택
        </Text>
        <Text style={[styles.subtitle, { color: mutedTextColor }]}>
          {currentAge}세부터 34세까지 받을 수 있는 혜택을 확인하세요
        </Text>
      </View>

      {/* 타임라인 */}
      <AgeTimeline
        currentAge={currentAge}
        selectedAge={selectedAge}
        onAgeSelect={handleAgeSelect}
        benefitCounts={benefitCounts}
        colorScheme={colorScheme}
      />

      {/* 선택된 나이 정보 */}
      <View style={styles.selectedAgeInfo}>
        <Text style={[styles.selectedAgeText, { color: textColor }]}>
          {selectedAge}세 혜택
        </Text>
        <Text style={[styles.benefitCountText, { color: mutedTextColor }]}>
          {filteredBenefits.length}개
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyBenefitsList
        message={`${selectedAge}세에 받을 수 있는 혜택이 없습니다`}
        colorScheme={colorScheme}
      />
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.cardWrapper}>
          <BenefitCardSkeleton colorScheme={colorScheme} />
        </View>
      ))}
    </View>
  );

  if (isError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['top']}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            혜택 정보를 불러올 수 없습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      <FlatList
        data={isLoading ? [] : filteredBenefits}
        renderItem={renderBenefitItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? renderLoading : renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  titleSection: {
    padding: Spacing.lg,
    borderRadius: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.sectionTitle,
  },
  subtitle: {
    ...Typography.body,
  },
  selectedAgeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  selectedAgeText: {
    ...Typography.heading,
  },
  benefitCountText: {
    ...Typography.body,
  },
  listContent: {
    padding: Spacing.lg,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl * 2,
  },
  loadingContainer: {
    gap: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
