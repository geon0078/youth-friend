export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#1F2A44',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

/**
 * Touch Target Sizes (WCAG 2.1 Success Criterion 2.5.5)
 * 최소 터치 영역 크기 정의
 */
export const TouchTargets = {
  /** WCAG AA 최소 크기 (44x44 points) */
  minimum: 44,
  /** 권장 크기 (48x48 points) - Material Design 기준 */
  recommended: 48,
  /** 여유 있는 크기 (56x56 points) */
  comfortable: 56,
  /** 큰 버튼용 (64x64 points) */
  large: 64,
};

/**
 * 터치 타겟 스타일 생성
 * @param size 터치 타겟 크기
 */
export function createTouchTargetStyle(size: keyof typeof TouchTargets = 'minimum') {
  const dimension = TouchTargets[size];
  return {
    minWidth: dimension,
    minHeight: dimension,
  };
}

/**
 * 히트 슬롭 (터치 영역 확장) 생성
 * 실제 버튼보다 터치 영역을 넓힘
 * @param vertical 상하 확장 크기
 * @param horizontal 좌우 확장 크기
 */
export function createHitSlop(vertical: number = 10, horizontal: number = 10) {
  return {
    top: vertical,
    bottom: vertical,
    left: horizontal,
    right: horizontal,
  };
}

/**
 * 접근성 준수 터치 영역 확보를 위한 히트 슬롭 계산
 * @param elementHeight 요소의 실제 높이
 * @param elementWidth 요소의 실제 너비
 * @param targetSize 목표 터치 크기 (기본: minimum = 44)
 */
export function calculateAccessibleHitSlop(
  elementHeight: number,
  elementWidth: number,
  targetSize: keyof typeof TouchTargets = 'minimum'
) {
  const target = TouchTargets[targetSize];
  const verticalPadding = Math.max(0, (target - elementHeight) / 2);
  const horizontalPadding = Math.max(0, (target - elementWidth) / 2);

  return {
    top: Math.ceil(verticalPadding),
    bottom: Math.ceil(verticalPadding),
    left: Math.ceil(horizontalPadding),
    right: Math.ceil(horizontalPadding),
  };
}

/**
 * 터치 타겟 크기 검증
 * @param width 요소 너비
 * @param height 요소 높이
 * @returns WCAG AA 준수 여부
 */
export function validateTouchTarget(width: number, height: number): boolean {
  return width >= TouchTargets.minimum && height >= TouchTargets.minimum;
}
