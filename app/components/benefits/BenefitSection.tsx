/**
 * 혜택 섹션 컴포넌트
 * - 섹션 헤더 + 혜택 카드 리스트
 * - 스마트 그룹핑용 (긴급 마감, 고액 혜택 등)
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { Spacing, Typography, getSemanticColor } from '@/design-system';
import { BenefitCard } from './BenefitCard';
import type { ScoredBenefit } from '@/utils/benefit-scoring';

interface BenefitSectionProps {
  title: string;
  icon: string;
  benefits: ScoredBenefit[];
  onBenefitPress: (benefitId: string) => void;
  colorScheme: ColorSchemeName;
  searchQuery?: string;
}

export function BenefitSection({
  title,
  icon,
  benefits,
  onBenefitPress,
  colorScheme,
  searchQuery,
}: BenefitSectionProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');

  if (benefits.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.count, { color: mutedColor }]}>({benefits.length})</Text>
      </View>
      <View style={styles.cardList}>
        {benefits.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            onPress={() => onBenefitPress(benefit.id)}
            colorScheme={colorScheme}
            searchQuery={searchQuery}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    ...Typography.heading,
    fontSize: 16,
  },
  count: {
    fontSize: 14,
  },
  cardList: {
    gap: Spacing.md,
  },
});
