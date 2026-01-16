/**
 * Animation Utilities
 * Story 7.5: Implement Reduce Motion Support
 *
 * 모션 축소 설정을 존중하는 애니메이션 유틸리티
 */
import { Animated, Easing } from 'react-native';

/**
 * 애니메이션 설정 타입
 */
interface AnimationConfig {
  /** 애니메이션 지속 시간 (ms) */
  duration: number;
  /** 이징 함수 */
  easing?: (value: number) => number;
  /** 모션 축소 시 지속 시간 (기본: 0) */
  reducedDuration?: number;
  /** 네이티브 드라이버 사용 여부 */
  useNativeDriver?: boolean;
}

/**
 * 페이드 인 애니메이션
 */
export function createFadeInAnimation(
  animatedValue: Animated.Value,
  config: AnimationConfig,
  reducedMotion: boolean
): Animated.CompositeAnimation {
  const { duration, easing = Easing.ease, reducedDuration = 0, useNativeDriver = true } = config;

  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: reducedMotion ? reducedDuration : duration,
    easing,
    useNativeDriver,
  });
}

/**
 * 페이드 아웃 애니메이션
 */
export function createFadeOutAnimation(
  animatedValue: Animated.Value,
  config: AnimationConfig,
  reducedMotion: boolean
): Animated.CompositeAnimation {
  const { duration, easing = Easing.ease, reducedDuration = 0, useNativeDriver = true } = config;

  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: reducedMotion ? reducedDuration : duration,
    easing,
    useNativeDriver,
  });
}

/**
 * 슬라이드 인 애니메이션
 */
export function createSlideInAnimation(
  animatedValue: Animated.Value,
  config: AnimationConfig & { fromValue: number },
  reducedMotion: boolean
): Animated.CompositeAnimation {
  const {
    duration,
    easing = Easing.out(Easing.cubic),
    reducedDuration = 0,
    useNativeDriver = true,
    fromValue,
  } = config;

  // 모션 축소 시 슬라이드 대신 페이드만 사용
  if (reducedMotion) {
    animatedValue.setValue(0);
    return Animated.timing(animatedValue, {
      toValue: 0, // 이미 목표 위치에 즉시 배치
      duration: reducedDuration,
      easing,
      useNativeDriver,
    });
  }

  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing,
    useNativeDriver,
  });
}

/**
 * 스케일 애니메이션
 */
export function createScaleAnimation(
  animatedValue: Animated.Value,
  config: AnimationConfig & { toValue: number; fromValue?: number },
  reducedMotion: boolean
): Animated.CompositeAnimation {
  const {
    duration,
    easing = Easing.out(Easing.back(1.2)),
    reducedDuration = 0,
    useNativeDriver = true,
    toValue,
    fromValue = 1,
  } = config;

  if (reducedMotion) {
    // 모션 축소 시 즉시 최종 값으로 설정
    animatedValue.setValue(toValue);
    return Animated.timing(animatedValue, {
      toValue,
      duration: reducedDuration,
      easing,
      useNativeDriver,
    });
  }

  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver,
  });
}

/**
 * 스프링 애니메이션 (모션 축소 시 타이밍으로 대체)
 */
export function createSpringAnimation(
  animatedValue: Animated.Value,
  config: {
    toValue: number;
    friction?: number;
    tension?: number;
    useNativeDriver?: boolean;
  },
  reducedMotion: boolean
): Animated.CompositeAnimation {
  const { toValue, friction = 7, tension = 40, useNativeDriver = true } = config;

  if (reducedMotion) {
    return Animated.timing(animatedValue, {
      toValue,
      duration: 0,
      useNativeDriver,
    });
  }

  return Animated.spring(animatedValue, {
    toValue,
    friction,
    tension,
    useNativeDriver,
  });
}

/**
 * 시퀀스 애니메이션 (모션 축소 시 병렬 실행)
 */
export function createSequence(
  animations: Animated.CompositeAnimation[],
  reducedMotion: boolean
): Animated.CompositeAnimation {
  if (reducedMotion) {
    // 모션 축소 시 모든 애니메이션을 동시에 실행 (즉시 완료)
    return Animated.parallel(animations);
  }

  return Animated.sequence(animations);
}

/**
 * 루프 애니메이션 (모션 축소 시 비활성화)
 */
export function createLoop(
  animation: Animated.CompositeAnimation,
  config: { iterations?: number } = {},
  reducedMotion: boolean
): Animated.CompositeAnimation | null {
  if (reducedMotion) {
    // 모션 축소 시 루프 애니메이션 비활성화
    return null;
  }

  return Animated.loop(animation, config);
}

/**
 * 펄스 애니메이션 (주의 끌기용)
 * 모션 축소 시 비활성화됨
 */
export function createPulseAnimation(
  animatedValue: Animated.Value,
  reducedMotion: boolean
): Animated.CompositeAnimation | null {
  if (reducedMotion) {
    animatedValue.setValue(1);
    return null;
  }

  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
}

/**
 * 기본 애니메이션 지속 시간
 */
export const AnimationDurations = {
  /** 빠른 전환 (150ms) */
  fast: 150,
  /** 보통 전환 (250ms) */
  normal: 250,
  /** 느린 전환 (350ms) */
  slow: 350,
  /** 매우 느린 전환 (500ms) */
  slower: 500,
};

/**
 * 모션 축소를 고려한 지속 시간 반환
 */
export function getAnimationDuration(
  duration: number,
  reducedMotion: boolean
): number {
  return reducedMotion ? 0 : duration;
}

/**
 * 애니메이션 값 초기화 헬퍼
 */
export function createAnimatedValue(initialValue: number): Animated.Value {
  return new Animated.Value(initialValue);
}

/**
 * 투명도 애니메이션 스타일 생성
 */
export function getOpacityStyle(animatedValue: Animated.Value) {
  return { opacity: animatedValue };
}

/**
 * 변환 애니메이션 스타일 생성
 */
export function getTransformStyle(
  translateY?: Animated.Value,
  translateX?: Animated.Value,
  scale?: Animated.Value
) {
  const transforms: { translateY?: Animated.Value; translateX?: Animated.Value; scale?: Animated.Value }[] = [];

  if (translateY) {
    transforms.push({ translateY });
  }
  if (translateX) {
    transforms.push({ translateX });
  }
  if (scale) {
    transforms.push({ scale });
  }

  return { transform: transforms };
}
