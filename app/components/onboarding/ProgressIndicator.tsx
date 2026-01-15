import { View, Text, StyleSheet } from 'react-native';
import { Palette, Spacing, Typography, Radius } from '@/constants';

interface ProgressIndicatorProps {
  /** 현재 단계 (1부터 시작) */
  currentStep: number;
  /** 전체 단계 수 */
  totalSteps: number;
}

/**
 * 온보딩 프로그레스 인디케이터
 * Step 1/3 형태로 진행 상황 표시
 */
export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`${totalSteps}단계 중 ${currentStep}단계`}
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: currentStep,
      }}
    >
      {/* Step Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View
              key={stepNumber}
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isCurrent && styles.dotCurrent,
              ]}
            />
          );
        })}
      </View>

      {/* Step Text */}
      <Text style={styles.stepText}>
        {currentStep} / {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.gray200,
  },
  dotActive: {
    backgroundColor: Palette.primary,
  },
  dotCurrent: {
    width: 24,
    borderRadius: Radius.full,
  },
  stepText: {
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    color: Palette.gray500,
  },
});
