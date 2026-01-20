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
import { useTotalBenefits, useBenefits } from '@/hooks';
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
import type { Benefit } from '@/types';

/**
 * 카테고리 코드를 한글 라벨로 변환
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    employment: '일자리',
    housing: '주거',
    education: '교육',
    welfare: '복지',
    culture: '문화',
  };
  return labels[category] || category;
}

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

const quickActions = [
  { label: '온보딩 다시 시작', action: 'onboarding' },
  { label: '혜택 즐겨찾기', action: 'favorites' },
  { label: '신청 체크리스트', action: 'checklist' },
];

const personaHighlights = [
  {
    name: '자립 준비형',
    description: '주거·금융 혜택을 우선 추천하고 신청 일정과 서류를 한 번에 정리합니다.',
  },
  {
    name: '커리어 도약형',
    description: '취업 연계 프로그램, 교육 바우처, 면접 지원을 묶어서 보여줍니다.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';
  const profile = useUserStore((state) => state.profile);
  const userRegion = profile?.region;

  const backgroundColor = getSemanticColor(scheme, 'background');
  const textColor = getSemanticColor(scheme, 'text');
  const mutedText = SemanticColors[resolvedScheme].mutedText;

  // 총 혜택 금액 조회 - 사용자 지역 기반
  const { data: totalBenefitsData, isLoading: isTotalBenefitsLoading } = useTotalBenefits({ region: userRegion });

  // 추천 혜택 조회 (상위 3개만 표시) - 사용자 지역 기반
  const { data: benefitsData, isLoading: isBenefitsLoading, isError } = useBenefits({ region: userRegion });
  // 마감된 혜택 제외하고 상위 3개만 표시
  const recommendedBenefits = (benefitsData?.items ?? [])
    .filter((b) => b.status !== 'ended')
    .slice(0, 3);

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
                key={item.action}
                style={[
                  styles.quickAction,
                  { backgroundColor: getSemanticColor(scheme, 'quickAction') },
                ]}>
                <Text style={[styles.quickActionLabel, { color: textColor }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="페르소나 하이라이트" subtitle="온보딩에서 선택한 유형" />
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
  },
  quickActionLabel: {
    fontWeight: '600',
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
