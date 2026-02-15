import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Palette, Spacing, Radius, Typography } from '@/design-system';
import { Card, SectionHeader } from '@/components/design-system';
import { useBenefits, useBenefitsMetadata } from '@/hooks';
import type { BenefitSource } from '@/types/models/benefit';

const SOURCE_LABELS: Record<BenefitSource, string> = {
  'youth-policy': '온통청년',
  employment24: '고용24',
  gov24: '보조금24',
};

const SOURCE_DESCRIPTIONS: Record<BenefitSource, string> = {
  'youth-policy': '전국 청년정책 공고를 실시간으로 수집합니다.',
  employment24: '취업 연계·훈련 프로그램 데이터를 연결합니다.',
  gov24: '청년 대상 보조금/지원 서비스를 필터링합니다.',
};

function formatUpdatedAt(updatedAt?: number): string {
  if (!updatedAt) return '업데이트 정보 없음';
  return new Date(updatedAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ExploreScreen() {
  const { data, isLoading, isError } = useBenefits();
  const { latestUpdatedAt } = useBenefitsMetadata();

  const sourceStats = useMemo(() => {
    const counts: Record<BenefitSource, number> = {
      'youth-policy': 0,
      employment24: 0,
      gov24: 0,
    };

    (data?.items ?? []).forEach((benefit) => {
      counts[benefit.source] += 1;
    });

    return (Object.keys(counts) as BenefitSource[]).map((source) => ({
      source,
      name: SOURCE_LABELS[source],
      description: SOURCE_DESCRIPTIONS[source],
      count: counts[source],
    }));
  }, [data?.items]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>데이터 & 로드맵</Text>
        <Text style={styles.subheading}>
          청년친구 앱은 공공 Open API를 바탕으로 데이터를 수집하고, 주간 로드맵을 통해
          구현을 진행합니다.
        </Text>

        <View style={styles.section}>
          <SectionHeader
            title="주요 데이터 소스"
            subtitle={`마지막 업데이트: ${formatUpdatedAt(latestUpdatedAt)}`}
          />
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Palette.primary} />
              <Text style={styles.loadingText}>데이터 집계 중...</Text>
            </View>
          ) : isError ? (
            <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
          ) : (
            sourceStats.map((source) => (
              <Card key={source.source}>
                <Text style={styles.cardTitle}>{source.name}</Text>
                <Text style={styles.cardDescription}>{source.description}</Text>
                <Text style={styles.cardMeta}>현재 {source.count.toLocaleString()}건</Text>
              </Card>
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="데이터 활용 요약" />
          <Card style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>총 혜택 수</Text>
            <Text style={styles.summaryValue}>
              {(data?.items.length ?? 0).toLocaleString()}건
            </Text>
          </Card>
          <Card style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>API 출처 수</Text>
            <Text style={styles.summaryValue}>3곳 (온통청년·고용24·보조금24)</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContainer: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  heading: {
    ...Typography.heroTitle,
    color: Palette.textPrimary,
  },
  subheading: {
    color: Palette.textMuted,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    color: Palette.textMuted,
    fontSize: 13,
  },
  errorText: {
    color: Palette.textMuted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  cardDescription: {
    color: Palette.textMuted,
    lineHeight: 20,
  },
  cardMeta: {
    color: Palette.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: Palette.textMuted,
    fontSize: 13,
  },
  summaryValue: {
    color: Palette.textPrimary,
    fontWeight: '700',
  },
});
