/**
 * 사용자 프로필 타입 (FR1 기반)
 * 온보딩에서 수집하는 기본 정보
 */
export interface UserProfile {
  /** 출생년도 (1991-2007) */
  birthYear: number;
  /** 지역 (시/도) */
  region: Region;
  /** 소득수준 */
  incomeLevel: IncomeLevel;
  /** 취업상태 */
  employmentStatus: EmploymentStatus;
}

/**
 * 17개 광역시/도 타입
 */
export type Region =
  | 'seoul' // 서울특별시
  | 'busan' // 부산광역시
  | 'daegu' // 대구광역시
  | 'incheon' // 인천광역시
  | 'gwangju' // 광주광역시
  | 'daejeon' // 대전광역시
  | 'ulsan' // 울산광역시
  | 'sejong' // 세종특별자치시
  | 'gyeonggi' // 경기도
  | 'gangwon' // 강원특별자치도
  | 'chungbuk' // 충청북도
  | 'chungnam' // 충청남도
  | 'jeonbuk' // 전북특별자치도
  | 'jeonnam' // 전라남도
  | 'gyeongbuk' // 경상북도
  | 'gyeongnam' // 경상남도
  | 'jeju'; // 제주특별자치도

/**
 * 지역 레이블 매핑
 */
export const REGION_LABELS: Record<Region, string> = {
  seoul: '서울특별시',
  busan: '부산광역시',
  daegu: '대구광역시',
  incheon: '인천광역시',
  gwangju: '광주광역시',
  daejeon: '대전광역시',
  ulsan: '울산광역시',
  sejong: '세종특별자치시',
  gyeonggi: '경기도',
  gangwon: '강원특별자치도',
  chungbuk: '충청북도',
  chungnam: '충청남도',
  jeonbuk: '전북특별자치도',
  jeonnam: '전라남도',
  gyeongbuk: '경상북도',
  gyeongnam: '경상남도',
  jeju: '제주특별자치도',
};

/**
 * 지역 목록 (선택 UI용)
 */
export const REGIONS: Region[] = [
  'seoul',
  'busan',
  'daegu',
  'incheon',
  'gwangju',
  'daejeon',
  'ulsan',
  'sejong',
  'gyeonggi',
  'gangwon',
  'chungbuk',
  'chungnam',
  'jeonbuk',
  'jeonnam',
  'gyeongbuk',
  'gyeongnam',
  'jeju',
];

/**
 * 소득수준 타입 (기준 중위소득 % 기준)
 */
export type IncomeLevel =
  | 'below50' // 50% 이하
  | '50to100' // 50-100%
  | '100to150' // 100-150%
  | 'above150'; // 150% 초과

/**
 * 소득수준 레이블 매핑
 */
export const INCOME_LEVEL_LABELS: Record<IncomeLevel, string> = {
  below50: '기준 중위소득 50% 이하',
  '50to100': '기준 중위소득 50~100%',
  '100to150': '기준 중위소득 100~150%',
  above150: '기준 중위소득 150% 초과',
};

/**
 * 소득수준 목록 (선택 UI용)
 */
export const INCOME_LEVELS: IncomeLevel[] = [
  'below50',
  '50to100',
  '100to150',
  'above150',
];

/**
 * 취업상태 타입
 */
export type EmploymentStatus =
  | 'employed' // 재직중
  | 'unemployed' // 미취업(구직중)
  | 'student' // 학생
  | 'self-employed' // 자영업
  | 'part-time'; // 아르바이트

/**
 * 취업상태 레이블 매핑
 */
export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: '재직중',
  unemployed: '미취업(구직중)',
  student: '학생',
  'self-employed': '자영업',
  'part-time': '아르바이트',
};

/**
 * 취업상태 목록 (선택 UI용)
 */
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'employed',
  'unemployed',
  'student',
  'self-employed',
  'part-time',
];

/**
 * 앱 설정 타입
 */
export interface AppSettings {
  /** 알림 활성화 여부 */
  notificationsEnabled: boolean;
  /** 마감 임박 알림 */
  deadlineAlertEnabled: boolean;
  /** 신규 혜택 알림 */
  newBenefitAlertEnabled: boolean;
  /** 신청 결과 알림 (FR21) */
  resultAlertEnabled: boolean;
  /** 방해 금지 시작 시간 (HH:mm) */
  quietHoursStart?: string;
  /** 방해 금지 종료 시간 (HH:mm) */
  quietHoursEnd?: string;
  /** 고대비 모드 (FR30) */
  highContrastMode: boolean;
  /** 텍스트 크기 (FR29) */
  textSize: TextSize;
  /** 모션 감소 */
  reduceMotion: boolean;
}

/** 텍스트 크기 타입 */
export type TextSize = 'small' | 'medium' | 'large';

/**
 * 혜택 필터 타입 (FR7 기반)
 */
export interface BenefitFilter {
  /** 카테고리 필터 (다중 선택 가능) */
  categories: BenefitCategory[];
  /** 검색어 */
  searchQuery: string;
  /** 정렬 기준 */
  sortBy: SortOption;
}

/** 혜택 카테고리 타입 */
export type BenefitCategory =
  | 'employment' // 취업
  | 'housing' // 주거
  | 'education' // 교육
  | 'welfare' // 복지
  | 'finance' // 금융
  | 'culture'; // 문화

/** 정렬 옵션 타입 */
export type SortOption =
  | 'deadline' // 마감일순
  | 'amount' // 금액순
  | 'relevance'; // 관련도순

/**
 * 개인정보 동의 항목 타입 (FR4)
 */
export interface ConsentItems {
  /** 서비스 이용약관 동의 (필수) */
  termsOfService: boolean;
  /** 개인정보 처리방침 동의 (필수) */
  privacyPolicy: boolean;
  /** 마케팅 알림 수신 동의 (선택) */
  marketingNotifications: boolean;
}

/**
 * 동의 상태 타입
 */
export interface ConsentState {
  /** 개별 동의 항목 */
  items: ConsentItems;
  /** 동의 완료 여부 (필수 항목 모두 동의) */
  isCompleted: boolean;
  /** 동의 일시 */
  consentedAt: string | null;
}

/**
 * 기본 동의 상태
 */
export const DEFAULT_CONSENT_ITEMS: ConsentItems = {
  termsOfService: false,
  privacyPolicy: false,
  marketingNotifications: false,
};
