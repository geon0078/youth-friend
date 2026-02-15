import { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTotalBenefits, useBenefits, useSavedApplications } from '@/hooks';
import { useUserStore } from '@/stores/user-store';
import {
  getSemanticColor,
  SemanticColors,
  Palette,
  Spacing,
  Radius,
  Typography,
} from '@/design-system';
import { SectionHeader, Card, Badge, PrimaryButton } from '@/components/design-system';
import { TotalBenefitCard, TotalBenefitCardSkeleton } from '@/components/benefits';
import { getCategoryLabel } from '@/utils/category';
import type { Benefit } from '@/types';

/**
 * D-day 계산
 */
function getDeadlineLabel(deadline?: string): string {
  if (!deadline || typeof deadline !== 'string') return '상시';
  if (deadline.includes('상시') || deadline.includes('수시')) return '상시';

  // 날짜 파싱 시도 (YYYYMMDD 또는 YYYY-MM-DD)
  const dateMatch = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (dateMatch) {
    const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '마감';
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
  }

  return deadline.slice(0, 10); // 원본 날짜 표시
}


export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';
  const profile = useUserStore((state) => state.profile);
  const userRegion = profile?.region;
  const userBirthYear = profile?.birthYear;
  const { applications, deadlineApproaching, countByStatus } = useSavedApplications();

  const backgroundColor = getSemanticColor(scheme, 'background');
  const textColor = getSemanticColor(scheme, 'text');
  const mutedText = SemanticColors[resolvedScheme].mutedText;

  // 총 혜택 금액 조회 - 사용자 지역 기반
  const { data: totalBenefitsData, isLoading: isTotalBenefitsLoading } = useTotalBenefits({
    region: userRegion,
    userBirthYear,
    hideEnded: true,
    filterByAge: true,
    filterByRegion: true,
  });

  // 추천 혜택 조회 (상위 3개만 표시) - 사용자 지역 기반
  const { data: benefitsData, isLoading: isBenefitsLoading, isError } = useBenefits({
    region: userRegion,
    userBirthYear,
    hideEnded: true,
    filterByAge: true,
    filterByRegion: true,
  });
  // 마감된 혜택 제외하고 상위 3개만 표시
  const recommendedBenefits = (benefitsData?.items ?? [])
    .filter((b) => b.status !== 'ended')
    .slice(0, 3);

  const quickActions = useMemo(() => {
    const totalCount = benefitsData?.items.length ?? 0;
    const savedCount = applications.length;
    const preparingCount = countByStatus.preparing ?? 0;
    const deadlineCount = deadlineApproaching.length;

    const actions = [
      {
        key: 'benefits',
        label: '혜택 둘러보기',
        value: `${totalCount.toLocaleString()}건`,
        route: '/(tabs)/benefits',
      },
      {
        key: 'applications',
        label: '신청 관리',
        value: `${savedCount.toLocaleString()}건`,
        route: '/(tabs)/applications',
      },
      {
        key: 'deadlines',
        label: '마감 임박',
        value: `${deadlineCount.toLocaleString()}건`,
        route: '/(tabs)/applications',
      },
    ];

    if (!profile) {
      actions.unshift({
        key: 'onboarding',
        label: '온보딩 다시 시작',
        value: '맞춤 혜택 설정',
        route: '/onboarding',
      });
    } else if (preparingCount > 0) {
      actions[1] = {
        key: 'applications',
        label: '신청 진행',
        value: `${preparingCount.toLocaleString()}건`,
        route: '/(tabs)/applications',
      };
    }

    return actions.slice(0, 3);
  }, [applications.length, benefitsData?.items.length, countByStatus.preparing, deadlineApproaching.length, profile]);

  const personaHighlights = useMemo(() => {
    const items = benefitsData?.items ?? [];
    if (items.length === 0) {
      return [
        {
          name: '데이터 준비 중',
          description: '최신 혜택 데이터를 불러오고 있습니다.',
        },
      ];
    }

    const categoryCounts = items.reduce<Record<string, number>>((acc, benefit) => {
      acc[benefit.category] = (acc[benefit.category] ?? 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    return topCategories.map(([category, count], index) => {
      const label = getCategoryLabel(category as Benefit['category']);
      const description = index === 0
        ? `${label} 혜택이 ${count}건으로 가장 많아요. 지금 바로 확인해보세요.`
        : `${label} 혜택도 ${count}건 있습니다. 맞춤 추천에 포함됩니다.`;

      return {
        name: `${label} 우선 추천`,
        description,
      };
    });
  }, [benefitsData?.items]);

  const handleTotalBenefitPress = () => {
    router.push('/benefits' as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[
            styles.heroCard,
            { backgroundColor: getSemanticColor(scheme, 'heroBackground') },
          ]}>
          <Text style={[styles.tag, { color: 'rgba(255,255,255,0.85)' }]}>맞춤 혜택 비서</Text>
          <Text style={[styles.heroTitle, { color: getSemanticColor(scheme, 'heroText') }]}>
            청년친구와 혜택 놓치지 마세요
          </Text>
          <Text style={[styles.heroSubtitle, { color: getSemanticColor(scheme, 'heroText') }]}>
            정부·지자체 지원을 상황별로 정리하고 마감까지 알려드릴게요.
          </Text>
          <PrimaryButton
            label="나에게 맞는 혜택 찾기"
            tone="inverse"
            onPress={() => router.push('/onboarding')}
          />
        </View>

        {/* 총 혜택 금액 카드 */}
        {isTotalBenefitsLoading ? (
          <TotalBenefitCardSkeleton colorScheme={scheme} />
        ) : totalBenefitsData ? (
          <TotalBenefitCard
            data={totalBenefitsData}
            onPress={handleTotalBenefitPress}
            colorScheme={scheme}
          />
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="추천 혜택" subtitle="프로필 기반 큐레이션" />
          {isBenefitsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Palette.primary} />
              <Text style={[styles.loadingText, { color: mutedText }]}>
                혜택 정보를 불러오는 중...
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: mutedText }]}>
                혜택 정보를 불러오지 못했습니다.
              </Text>
            </View>
          ) : recommendedBenefits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: mutedText }]}>
                표시할 혜택이 없습니다.
              </Text>
            </View>
          ) : (
            recommendedBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                onPress={() => router.push(`/benefit/${benefit.id}` as Href)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="빠른 작업" subtitle="진행 상황을 바로 이어가요" />
          <View style={styles.quickGrid}>
            {quickActions.map((item) => (
              <Pressable
                key={item.key}
                style={[
                  styles.quickAction,
                  { backgroundColor: getSemanticColor(scheme, 'quickAction') },
                ]}
                onPress={() => router.push(item.route as Href)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} ${item.value}`}
              >
                <Text style={[styles.quickActionLabel, { color: textColor }]}>{item.label}</Text>
                <Text style={[styles.quickActionValue, { color: mutedText }]}>{item.value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="페르소나 하이라이트" subtitle="혜택 데이터 기반" />
          {personaHighlights.map((persona) => (
            <View
              key={persona.name}
              style={[
                styles.personaCard,
                { borderColor: getSemanticColor(scheme, 'border') },
              ]}>
              <Text style={[styles.personaTitle, { color: textColor }]}>{persona.name}</Text>
              <Text style={[styles.personaDescription, { color: mutedText }]}>
                {persona.description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitCard({ benefit, onPress }: { benefit: Benefit; onPress?: () => void }) {
  const deadlineLabel = getDeadlineLabel(benefit.deadline);
  const isUrgent = deadlineLabel.startsWith('D-') && parseInt(deadlineLabel.slice(2)) <= 7;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.benefitBadgeRow}>
          <Badge label={getCategoryLabel(benefit.category)} />
          <Badge label={deadlineLabel} tone={isUrgent ? 'alert' : 'default'} />
        </View>
        <Text style={styles.benefitTitle} numberOfLines={2}>
          {benefit.title}
        </Text>
        <Text style={styles.benefitSummary} numberOfLines={2}>
          {benefit.description || benefit.supportContent || ''}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  heroCard: {
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    gap: Spacing.md,
  },
  tag: {
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...Typography.heroTitle,
  },
  heroSubtitle: {
    ...Typography.heroSubtitle,
  },
  section: {
    gap: Spacing.md,
  },
  benefitBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  benefitSummary: {
    color: Palette.textMuted,
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  quickAction: {
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
    minWidth: '30%',
    alignItems: 'center',
    gap: 4,
  },
  quickActionLabel: {
    fontWeight: '600',
  },
  quickActionValue: {
    fontSize: 12,
  },
  personaCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
    backgroundColor: 'transparent',
  },
  personaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  personaDescription: {
    lineHeight: 20,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
