import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getSemanticColor,
  SemanticColors,
  Palette,
  Spacing,
  Radius,
  Typography,
} from '@/design-system';
import { SectionHeader, Card, Badge, PrimaryButton } from '@/components/design-system';
import { fetchPolicies, YouthPolicy } from '@/services/youth-policy';

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

// 카테고리 매핑
const CATEGORY_MAP: Record<string, string> = {
  '023010': '일자리',
  '023020': '주거',
  '023030': '교육',
  '023040': '복지문화',
  '023050': '참여권리',
};

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';

  const [policies, setPolicies] = useState<YouthPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = getSemanticColor(scheme, 'background');
  const textColor = getSemanticColor(scheme, 'text');
  const mutedText = SemanticColors[resolvedScheme].mutedText;

  const loadPolicies = async () => {
    try {
      setError(null);
      const result = await fetchPolicies({ pageSize: 5 });
      setPolicies(result.policies);
    } catch (err) {
      setError('정책 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPolicies();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Hero Card */}
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

        {/* 추천 혜택 섹션 */}
        <View style={styles.section}>
          <SectionHeader title="추천 혜택" subtitle="청년정책 API 실시간 연동" />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <Text style={[styles.loadingText, { color: mutedText }]}>
                정책 정보를 불러오는 중...
              </Text>
            </View>
          ) : error ? (
            <Card>
              <Text style={styles.errorText}>{error}</Text>
              <PrimaryButton label="다시 시도" onPress={loadPolicies} />
            </Card>
          ) : policies.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: mutedText }]}>
                표시할 정책이 없습니다.
              </Text>
            </Card>
          ) : (
            policies.map((policy) => (
              <PolicyCard key={policy.plcyNo} policy={policy} />
            ))
          )}
        </View>

        {/* 빠른 작업 섹션 */}
        <View style={styles.section}>
          <SectionHeader title="빠른 작업" subtitle="진행 상황을 바로 이어가요" />
          <View style={styles.quickGrid}>
            {quickActions.map((item) => (
              <Pressable
                key={item.action}
                style={[
                  styles.quickAction,
                  { backgroundColor: getSemanticColor(scheme, 'quickAction') },
                ]}
                onPress={() => {
                  if (item.action === 'onboarding') {
                    router.push('/onboarding');
                  }
                }}>
                <Text style={[styles.quickActionLabel, { color: textColor }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 페르소나 섹션 */}
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

function PolicyCard({ policy }: { policy: YouthPolicy }) {
  const category = policy.lclsfNm || '정책';
  const deadline = policy.prcpPrd ? calculateDday(policy.prcpPrd) : null;

  return (
    <Card>
      <View style={styles.benefitBadgeRow}>
        <Badge label={category} />
        {deadline && <Badge label={deadline} tone="alert" />}
      </View>
      <Text style={styles.benefitTitle} numberOfLines={2}>
        {policy.plcyNm}
      </Text>
      <Text style={styles.benefitSummary} numberOfLines={3}>
        {policy.plcyExpl || policy.sprtCntn || '상세 내용을 확인해주세요.'}
      </Text>
      {policy.operInstt && (
        <Text style={styles.orgText}>
          {policy.operInstt}
        </Text>
      )}
    </Card>
  );
}

// D-Day 계산 함수
function calculateDday(dateStr: string): string | null {
  try {
    // 신청기간에서 종료일 추출 (예: "2024.01.01~2024.12.31")
    const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/g);
    if (!match || match.length === 0) return null;

    const endDateStr = match[match.length - 1];
    const [year, month, day] = endDateStr.split('.').map(Number);
    const endDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '마감';
    if (diffDays === 0) return 'D-Day';
    if (diffDays <= 30) return `D-${diffDays}`;
    return null;
  } catch {
    return null;
  }
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
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    color: Palette.accent,
    marginBottom: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
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
  orgText: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: Spacing.xs,
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
});
