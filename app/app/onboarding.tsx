import { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Palette, Spacing, Radius, Shadows, Typography } from '@/design-system';
import { Chip, Card, PrimaryButton } from '@/components/design-system';

const onboardingSteps = [
  {
    title: '관심 분야를 알려주세요',
    description: '현재 가장 필요한 지원을 선택하면 추천 우선순위를 조정해드려요.',
    options: ['주거', '커리어', '교육', '지역생활', '창업'],
  },
  {
    title: '거주하거나 살고 싶은 지역은?',
    description: '지역을 선택하면 해당 지자체 혜택을 자동으로 불러옵니다.',
    options: ['서울', '부산', '광주', '대전', '제주'],
  },
  {
    title: '당장 이루고 싶은 목표는 무엇인가요?',
    description: '목표 기반으로 신청 체크리스트와 일정 알림을 준비합니다.',
    options: ['전세/주거 안정', '취업·이직', '생활비 절약', '재교육', '네트워킹'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const current = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;

  const handleSelect = (value: string) => {
    setResponses((prev) => ({ ...prev, [step]: value }));
  };

  const handleNext = () => {
    if (!isLast) {
      setStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>청년친구 온보딩</Text>
        <Text style={styles.subheading}>3개의 질문만으로 맞춤 혜택을 추천해 드려요.</Text>

        <View style={styles.progressWrapper}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[styles.progressBar, index <= step && styles.progressBarActive]}
            />
          ))}
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardDescription}>{current.description}</Text>

          <View style={styles.optionGrid}>
            {current.options.map((option) => {
              const selected = responses[step] === option;
              return (
                <Chip key={option} label={option} selected={selected} onPress={() => handleSelect(option)} />
              );
            })}
          </View>
        </Card>

        <PrimaryButton
          disabled={!responses[step]}
          onPress={handleNext}
          label={isLast ? '완료하고 홈으로' : '다음 질문'}
        />

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>나중에 할게요</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  heading: {
    ...Typography.heroTitle,
    color: Palette.textPrimary,
  },
  subheading: {
    color: Palette.textMuted,
    lineHeight: 20,
  },
  progressWrapper: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: Radius.md,
    backgroundColor: '#E0E5F2',
  },
  progressBarActive: {
    backgroundColor: Palette.primary,
  },
  card: {
    flex: 1,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  cardDescription: {
    color: Palette.textMuted,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  secondaryButtonText: {
    color: Palette.textMuted,
    textDecorationLine: 'underline',
  },
});
