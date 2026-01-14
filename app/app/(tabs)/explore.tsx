import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';

import { Palette, Spacing, Radius, Typography } from '@/design-system';
import { Card, SectionHeader } from '@/components/design-system';

const apiSources = [
  {
    name: '정부24 청년정책 통합공고',
    description: '전국 단위 청년정책 공고 데이터를 Open API로 제공합니다.',
    sync: '매일 02:00 동기화',
  },
  {
    name: '서울시 열린데이터광장',
    description: '지역별 주거·교육·생활 지원 공고를 태그 기반으로 수집합니다.',
    sync: '3시간 간격 스케줄러',
  },
  {
    name: '고용노동부 청년센터',
    description: '취업 연계, 면접 지원비, 멘토링 프로그램 API.',
    sync: '실시간 이벤트 Webhook 준비 중',
  },
];

const roadmap = [
  'Week 1: Expo + TypeScript 기반 앱 골격 구축 및 온보딩 UI',
  'Week 2: Open API 데이터 파이프라인 정규화, 홈 피드 연결',
  'Week 3: 알림/마감 이벤트, 신청 체크리스트 저장소',
  'Week 4: 베타 배포 및 지자체 제휴 스폰서 실험',
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>데이터 & 로드맵</Text>
        <Text style={styles.subheading}>
          청년친구 앱은 공공 Open API를 바탕으로 데이터를 수집하고, 주간 로드맵을 통해
          구현을 진행합니다.
        </Text>

        <View style={styles.section}>
          <SectionHeader title="주요 데이터 소스" />
          {apiSources.map((source) => (
            <Card key={source.name}>
              <Text style={styles.cardTitle}>{source.name}</Text>
              <Text style={styles.cardDescription}>{source.description}</Text>
              <Text style={styles.cardMeta}>{source.sync}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="개발 로드맵 (4주)" />
          {roadmap.map((item, index) => (
            <Card key={item} style={styles.roadmapRow}>
              <View style={styles.roadmapBadge}>
                <Text style={styles.roadmapBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.roadmapText}>{item}</Text>
            </Card>
          ))}
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
  roadmapRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  roadmapBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapBadgeText: {
    color: Palette.textOnPrimary,
    fontWeight: '700',
  },
  roadmapText: {
    flex: 1,
    color: Palette.textPrimary,
  },
});
