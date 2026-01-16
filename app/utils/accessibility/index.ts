/**
 * Accessibility Utilities
 * Epic 7: Accessibility Enhancement (접근성 강화)
 *
 * 스크린 리더 지원 및 접근성 관련 유틸리티
 */
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * 스크린 리더에 메시지 읽기
 * @param message 읽을 메시지
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * 스크린 리더 활성화 여부 확인
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * 금액 포맷팅 (스크린 리더용)
 * @param amount 금액
 * @returns 읽기 쉬운 형식의 금액 문자열
 */
export function formatAmountForScreenReader(amount: number | undefined): string {
  if (!amount) return '금액 정보 없음';

  if (amount >= 100000000) {
    const billions = Math.floor(amount / 100000000);
    const millions = Math.floor((amount % 100000000) / 10000);
    if (millions > 0) {
      return `${billions}억 ${millions}만원`;
    }
    return `${billions}억원`;
  }

  if (amount >= 10000) {
    const millions = Math.floor(amount / 10000);
    return `${millions}만원`;
  }

  return `${amount.toLocaleString()}원`;
}

/**
 * 날짜 포맷팅 (스크린 리더용)
 * @param dateStr 날짜 문자열
 * @returns 읽기 쉬운 형식의 날짜 문자열
 */
export function formatDateForScreenReader(dateStr: string | undefined): string {
  if (!dateStr) return '날짜 정보 없음';

  if (dateStr.includes('상시') || dateStr.includes('수시')) {
    return '상시 모집';
  }

  // YYYY.MM.DD 형식 파싱
  const dateMatch = dateStr.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  }

  return dateStr;
}

/**
 * 마감일 D-day 포맷팅 (스크린 리더용)
 * @param daysLeft 남은 일수
 * @returns 읽기 쉬운 형식의 문자열
 */
export function formatDeadlineForScreenReader(daysLeft: number | null): string {
  if (daysLeft === null) return '';
  if (daysLeft < 0) return '이미 마감됨';
  if (daysLeft === 0) return '오늘 마감';
  if (daysLeft === 1) return '내일 마감';
  return `${daysLeft}일 후 마감`;
}

/**
 * 진행률 포맷팅 (스크린 리더용)
 * @param progress 진행률 (0-100)
 * @returns 읽기 쉬운 형식의 문자열
 */
export function formatProgressForScreenReader(progress: number): string {
  if (progress === 0) return '시작 전';
  if (progress === 100) return '완료됨';
  return `${progress}% 진행됨`;
}

/**
 * 자격 상태 포맷팅 (스크린 리더용)
 * @param status 자격 상태
 * @returns 읽기 쉬운 형식의 문자열
 */
export function formatEligibilityForScreenReader(
  status: 'eligible' | 'ineligible' | 'partial' | 'unknown'
): string {
  switch (status) {
    case 'eligible':
      return '자격 조건 충족';
    case 'ineligible':
      return '자격 조건 미충족';
    case 'partial':
      return '일부 조건 충족, 확인 필요';
    case 'unknown':
      return '자격 확인 필요';
  }
}

/**
 * 버튼 접근성 라벨 생성
 * @param action 버튼 동작 설명
 * @param context 추가 컨텍스트
 */
export function createButtonLabel(action: string, context?: string): string {
  return context ? `${action}, ${context}` : action;
}

/**
 * 카드 접근성 라벨 생성
 * @param title 카드 제목
 * @param details 추가 세부사항
 */
export function createCardLabel(title: string, details: string[]): string {
  return [title, ...details.filter(Boolean)].join(', ');
}

/**
 * 폼 필드 접근성 힌트 생성
 * @param fieldType 필드 유형
 * @param required 필수 여부
 */
export function createFieldHint(fieldType: string, required: boolean): string {
  const requiredText = required ? '필수 입력 항목' : '선택 입력 항목';
  return `${fieldType}. ${requiredText}`;
}

/**
 * 리스트 아이템 위치 라벨 생성
 * @param index 현재 인덱스 (0부터 시작)
 * @param total 전체 개수
 */
export function createListItemPosition(index: number, total: number): string {
  return `${total}개 중 ${index + 1}번째`;
}

/**
 * 접근성 속성 객체 생성 헬퍼
 */
export function createAccessibilityProps(options: {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'checkbox' | 'radio' | 'header' | 'image' | 'text' | 'none';
  state?: {
    selected?: boolean;
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}): Record<string, unknown> {
  const props: Record<string, unknown> = {
    accessible: true,
    accessibilityLabel: options.label,
  };

  if (options.hint) {
    props.accessibilityHint = options.hint;
  }

  if (options.role) {
    props.accessibilityRole = options.role;
  }

  if (options.state) {
    props.accessibilityState = options.state;
  }

  if (options.value) {
    props.accessibilityValue = options.value;
  }

  return props;
}

/**
 * 플랫폼별 접근성 설정
 */
export const platformAccessibility = {
  /**
   * iOS VoiceOver 전용 속성
   */
  ios: {
    accessibilityViewIsModal: true,
    accessibilityElementsHidden: false,
  },

  /**
   * Android TalkBack 전용 속성
   */
  android: {
    importantForAccessibility: 'yes' as const,
    accessibilityLiveRegion: 'polite' as const,
  },

  /**
   * 현재 플랫폼에 맞는 속성 반환
   */
  get current() {
    return Platform.OS === 'ios' ? this.ios : this.android;
  },
};

/**
 * 접근성 라이브 영역 타입
 */
export type LiveRegionType = 'none' | 'polite' | 'assertive';

/**
 * 라이브 영역 속성 생성 (동적 콘텐츠용)
 * @param type 라이브 영역 타입
 */
export function createLiveRegionProps(type: LiveRegionType): Record<string, unknown> {
  if (Platform.OS === 'android') {
    return {
      accessibilityLiveRegion: type,
    };
  }

  // iOS에서는 announceForAccessibility 사용 권장
  return {};
}

// Audit utilities
export * from './audit';
