/**
 * 면책 조항 안내 컴포넌트
 * Story 4.6: Display Disclaimer Notice
 * FR14: 자격 검증 결과가 참고용임을 명시
 *
 * 모든 자격 검증 결과에 포함되어야 하는 필수 컴포넌트
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { Palette, Spacing, Radius, Typography, getSemanticColor } from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ELIGIBILITY_DISCLAIMER } from '@/types/models/eligibility';

interface DisclaimerNoticeProps {
  /** 컬러 스킴 (다크모드 지원) */
  colorScheme?: ColorSchemeName;
  /** 커스텀 면책 문구 (기본: ELIGIBILITY_DISCLAIMER) */
  message?: string;
  /** 컴팩트 모드 (패딩 축소) */
  compact?: boolean;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 면책 조항 안내 컴포넌트
 *
 * 자격 검증 결과에 표시되는 면책 문구를 렌더링합니다.
 * - 정보 아이콘과 함께 표시
 * - 주요 정보를 가리지 않게 배치
 * - 스크린 리더 접근성 지원
 *
 * @example
 * ```tsx
 * <DisclaimerNotice colorScheme={colorScheme} />
 *
 * // 커스텀 메시지
 * <DisclaimerNotice
 *   message="이 정보는 참고용입니다."
 *   colorScheme={colorScheme}
 * />
 *
 * // 컴팩트 모드
 * <DisclaimerNotice compact colorScheme={colorScheme} />
 * ```
 */
export function DisclaimerNotice({
  colorScheme,
  message = ELIGIBILITY_DISCLAIMER,
  compact = false,
  testID = 'disclaimer-notice',
}: DisclaimerNoticeProps) {
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: surfaceColor },
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`안내 사항: ${message}`}
    >
      <IconSymbol
        name="info.circle"
        size={compact ? 14 : 16}
        color={mutedTextColor}
      />
      <Text
        style={[
          styles.text,
          compact && styles.textCompact,
          { color: mutedTextColor },
        ]}
        importantForAccessibility="no"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  containerCompact: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  text: {
    ...Typography.caption,
    flex: 1,
    lineHeight: 18,
  },
  textCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
});
