/**
 * 외부 링크 버튼 컴포넌트
 * - 공식 페이지 보기 버튼
 * - 인앱 브라우저로 열기
 * - Story 3.8: Implement External Link to Government Page
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { openExternalLink, isValidUrl } from '@/utils/external-link';

interface ExternalLinkButtonProps {
  /** 외부 URL */
  url?: string;
  /** 버튼 라벨 (기본: "공식 페이지 보기") */
  label?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 확인 다이얼로그 표시 여부 */
  showConfirmDialog?: boolean;
}

/**
 * 외부 링크 버튼
 * 정부 공식 페이지로 이동하는 버튼
 *
 * @example
 * ```tsx
 * <ExternalLinkButton
 *   url="https://www.example.go.kr"
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function ExternalLinkButton({
  url,
  label = '공식 페이지 보기',
  disabled = false,
  colorScheme,
  showConfirmDialog = true,
}: ExternalLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const hasValidUrl = isValidUrl(url);
  const isDisabled = disabled || !hasValidUrl || isLoading;

  // URL이 유효하지 않으면 렌더링하지 않음 (비활성화 여부와 무관)
  if (!hasValidUrl) {
    return null;
  }

  const handlePress = async () => {
    if (isDisabled) return;

    if (showConfirmDialog) {
      Alert.alert(
        '외부 페이지 이동',
        '정부 공식 페이지로 이동합니다.\n이동하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '이동', onPress: openLink },
        ]
      );
    } else {
      await openLink();
    }
  };

  const openLink = async () => {
    setIsLoading(true);
    const result = await openExternalLink(url);
    setIsLoading(false);

    if (!result.success && result.error) {
      Alert.alert('오류', result.error);
    }
  };

  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
        accessibilityRole="link"
        accessibilityLabel={`${label} 새 창에서 열기`}
        accessibilityHint="외부 브라우저로 이동합니다"
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text
          style={[
            styles.buttonText,
            isDisabled && styles.buttonTextDisabled,
          ]}
        >
          {isLoading ? '여는 중...' : label}
        </Text>
        <IconSymbol
          name="arrow.up.right.square"
          size={20}
          color={isDisabled ? Palette.textMuted : Palette.textOnPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: Palette.border,
  },
  buttonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
  buttonTextDisabled: {
    color: Palette.textMuted,
  },
});
