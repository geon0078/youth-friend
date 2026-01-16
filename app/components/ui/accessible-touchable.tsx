/**
 * AccessibleTouchable Component
 * Story 7.4: Ensure Touch Target Sizes
 *
 * WCAG 2.1 AA 기준 (44x44pt 최소) 터치 타겟 보장
 */
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  AccessibilityRole,
} from 'react-native';
import {
  TouchTargets,
  createHitSlop,
  calculateAccessibleHitSlop,
} from '@/design-system/layout';
import { useReducedMotion } from '@/hooks/use-accessibility';

/**
 * AccessibleTouchable Props
 */
interface AccessibleTouchableProps extends Omit<PressableProps, 'style'> {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 스타일 */
  style?: StyleProp<ViewStyle>;
  /** 터치 타겟 크기 */
  targetSize?: keyof typeof TouchTargets;
  /** 커스텀 히트 슬롭 */
  customHitSlop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** 접근성 레이블 (필수) */
  accessibilityLabel: string;
  /** 접근성 힌트 */
  accessibilityHint?: string;
  /** 접근성 역할 */
  accessibilityRole?: AccessibilityRole;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 프레스 효과 강도 (0-1) */
  pressOpacity?: number;
  /** 프레스 스케일 효과 */
  pressScale?: number;
  /** 클릭 핸들러 */
  onPress?: (event: GestureResponderEvent) => void;
}

/**
 * WCAG 2.1 AA 준수 터치 가능 컴포넌트
 *
 * @example
 * ```tsx
 * <AccessibleTouchable
 *   accessibilityLabel="프로필 설정"
 *   accessibilityHint="탭하여 프로필 설정을 엽니다"
 *   onPress={handlePress}
 * >
 *   <Icon name="settings" />
 * </AccessibleTouchable>
 * ```
 */
export function AccessibleTouchable({
  children,
  style,
  targetSize = 'minimum',
  customHitSlop,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  pressOpacity = 0.7,
  pressScale = 0.98,
  onPress,
  ...pressableProps
}: AccessibleTouchableProps) {
  const reducedMotion = useReducedMotion();

  // 최소 터치 타겟 크기 스타일
  const minSizeStyle = useMemo(() => {
    const size = TouchTargets[targetSize];
    return {
      minWidth: size,
      minHeight: size,
    };
  }, [targetSize]);

  // 히트 슬롭 계산
  const hitSlop = useMemo(() => {
    if (customHitSlop) {
      return customHitSlop;
    }
    // 기본 히트 슬롭 제공
    return createHitSlop(8, 8);
  }, [customHitSlop]);

  // 프레스 스타일 함수
  const getPressedStyle = useCallback(
    ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
      const baseStyle = [styles.base, minSizeStyle, style];

      if (!pressed || disabled) {
        return baseStyle;
      }

      // 모션 축소 모드에서는 스케일 효과 비활성화
      if (reducedMotion) {
        return [...baseStyle, { opacity: pressOpacity }];
      }

      return [
        ...baseStyle,
        {
          opacity: pressOpacity,
          transform: [{ scale: pressScale }],
        },
      ];
    },
    [minSizeStyle, style, disabled, reducedMotion, pressOpacity, pressScale]
  );

  return (
    <Pressable
      {...pressableProps}
      style={getPressedStyle}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled,
        ...pressableProps.accessibilityState,
      }}
    >
      {children}
    </Pressable>
  );
}

/**
 * 아이콘 버튼용 AccessibleTouchable
 * 더 큰 터치 영역과 중앙 정렬 제공
 */
export function AccessibleIconButton({
  children,
  style,
  targetSize = 'recommended',
  ...props
}: AccessibleTouchableProps) {
  return (
    <AccessibleTouchable
      {...props}
      targetSize={targetSize}
      style={[styles.iconButton, style]}
    >
      {children}
    </AccessibleTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});

export default AccessibleTouchable;
