/**
 * Application 모델 타입 정의
 * Story 5.1: Define Application Types
 *
 * 혜택 신청 지원 기능을 위한 타입 정의
 */

/**
 * 신청 상태
 */
export type ApplicationStatus =
  | 'preparing' // 준비중 (서류 준비 단계)
  | 'applied' // 신청 완료
  | 'approved' // 승인
  | 'rejected' // 거부
  | 'withdrawn'; // 철회

/**
 * 신청 상태 레이블
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  preparing: '준비중',
  applied: '신청 완료',
  approved: '승인',
  rejected: '거부',
  withdrawn: '철회',
};

/**
 * 신청 상태 색상
 */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  preparing: '#FF8A34', // warning
  applied: '#3B82F6', // primary
  approved: '#22C55E', // success
  rejected: '#4B5565', // muted
  withdrawn: '#9CA3AF', // gray
};

/**
 * 서류 발급 방법
 */
export type DocumentIssuanceMethod = 'online' | 'offline' | 'both';

/**
 * 필요 서류
 */
export interface RequiredDocument {
  /** 서류 ID */
  id: string;
  /** 서류명 */
  name: string;
  /** 발급처 */
  issuer: string;
  /** 발급 방법 */
  issuanceMethod: DocumentIssuanceMethod;
  /** 발급 사이트 URL (온라인 발급 가능 시) */
  issuanceUrl?: string;
  /** 발급 방법 상세 설명 */
  issuanceDescription?: string;
  /** 필수 여부 */
  required: boolean;
  /** 유효 기간 (일) */
  validityDays?: number;
}

/**
 * 서류 발급 방법 레이블
 */
export const ISSUANCE_METHOD_LABELS: Record<DocumentIssuanceMethod, string> = {
  online: '온라인 발급',
  offline: '방문 발급',
  both: '온라인/방문 발급',
};

/**
 * 서류 체크 상태
 */
export interface DocumentCheckItem {
  /** 서류 ID */
  documentId: string;
  /** 체크 여부 */
  checked: boolean;
  /** 체크 일시 */
  checkedAt?: string;
}

/**
 * 서류 체크리스트
 */
export interface DocumentChecklist {
  /** 혜택 ID */
  benefitId: string;
  /** 서류 체크 목록 */
  items: DocumentCheckItem[];
  /** 마지막 업데이트 일시 */
  updatedAt: string;
}

/**
 * 신청 진행 단계
 */
export type ApplicationStep =
  | 'eligibility_check' // 자격 확인
  | 'document_prepare' // 서류 준비
  | 'application_submit' // 신청 제출
  | 'result_wait'; // 결과 대기

/**
 * 신청 진행 단계 레이블
 */
export const APPLICATION_STEP_LABELS: Record<ApplicationStep, string> = {
  eligibility_check: '자격 확인',
  document_prepare: '서류 준비',
  application_submit: '신청 제출',
  result_wait: '결과 대기',
};

/**
 * 신청 진행 상황
 */
export interface ApplicationProgress {
  /** 현재 단계 */
  currentStep: ApplicationStep;
  /** 완료된 단계 */
  completedSteps: ApplicationStep[];
  /** 진행률 (0-100) */
  progressPercent: number;
}

/**
 * 저장된 신청
 */
export interface SavedApplication {
  /** 저장 ID */
  id: string;
  /** 혜택 ID */
  benefitId: string;
  /** 혜택명 (표시용) */
  benefitTitle: string;
  /** 혜택 카테고리 */
  benefitCategory: string;
  /** 신청 마감일 */
  deadline?: string;
  /** 서류 체크리스트 */
  checklist: DocumentChecklist;
  /** 신청 진행 상황 */
  progress: ApplicationProgress;
  /** 신청 상태 */
  status: ApplicationStatus;
  /** 상태 변경 이력 */
  statusHistory: StatusHistoryItem[];
  /** 저장 일시 */
  savedAt: string;
  /** 마지막 업데이트 일시 */
  updatedAt: string;
  /** 메모 */
  notes?: string;
}

/**
 * 상태 변경 이력 항목
 */
export interface StatusHistoryItem {
  /** 변경된 상태 */
  status: ApplicationStatus;
  /** 변경 일시 */
  changedAt: string;
  /** 메모 */
  note?: string;
}

/**
 * 저장된 신청 목록 필터
 */
export interface SavedApplicationFilters {
  /** 상태 필터 */
  status?: ApplicationStatus;
  /** 카테고리 필터 */
  category?: string;
  /** 정렬 기준 */
  sortBy?: 'deadline' | 'savedAt' | 'updatedAt';
  /** 정렬 순서 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 기본 신청 진행 상황
 */
export const DEFAULT_APPLICATION_PROGRESS: ApplicationProgress = {
  currentStep: 'eligibility_check',
  completedSteps: [],
  progressPercent: 0,
};

/**
 * 자주 사용되는 서류 목록 (공통)
 */
export const COMMON_DOCUMENTS: RequiredDocument[] = [
  {
    id: 'resident-register',
    name: '주민등록등본',
    issuer: '주민센터, 정부24',
    issuanceMethod: 'both',
    issuanceUrl: 'https://www.gov.kr',
    issuanceDescription: '정부24에서 온라인 발급 가능',
    required: true,
    validityDays: 90,
  },
  {
    id: 'income-certificate',
    name: '소득금액증명원',
    issuer: '국세청, 홈택스',
    issuanceMethod: 'both',
    issuanceUrl: 'https://www.hometax.go.kr',
    issuanceDescription: '홈택스에서 온라인 발급 가능',
    required: true,
    validityDays: 30,
  },
  {
    id: 'health-insurance',
    name: '건강보험자격득실확인서',
    issuer: '국민건강보험공단',
    issuanceMethod: 'online',
    issuanceUrl: 'https://www.nhis.or.kr',
    issuanceDescription: '건강보험공단 홈페이지에서 발급',
    required: false,
  },
  {
    id: 'employment-certificate',
    name: '재직증명서',
    issuer: '재직 회사',
    issuanceMethod: 'offline',
    issuanceDescription: '재직 중인 회사에서 발급',
    required: false,
  },
  {
    id: 'unemployment-certificate',
    name: '구직등록확인증',
    issuer: '고용센터, 워크넷',
    issuanceMethod: 'both',
    issuanceUrl: 'https://www.work.go.kr',
    issuanceDescription: '워크넷에서 온라인 발급 가능',
    required: false,
  },
  {
    id: 'family-relation',
    name: '가족관계증명서',
    issuer: '대법원, 정부24',
    issuanceMethod: 'both',
    issuanceUrl: 'https://efamily.scourt.go.kr',
    issuanceDescription: '대법원 전자가족관계등록시스템에서 발급',
    required: false,
    validityDays: 90,
  },
  {
    id: 'bank-account',
    name: '통장사본',
    issuer: '본인 은행',
    issuanceMethod: 'both',
    issuanceDescription: '은행 앱 또는 지점에서 발급',
    required: true,
  },
];

/**
 * 서류 ID로 공통 서류 찾기
 */
export function findCommonDocument(id: string): RequiredDocument | undefined {
  return COMMON_DOCUMENTS.find((doc) => doc.id === id);
}

/**
 * 체크리스트 진행률 계산
 */
export function calculateChecklistProgress(checklist: DocumentChecklist): number {
  if (checklist.items.length === 0) return 0;
  const checkedCount = checklist.items.filter((item) => item.checked).length;
  return Math.round((checkedCount / checklist.items.length) * 100);
}

/**
 * 신청 진행 단계별 진행률
 */
export const APPLICATION_STEP_PROGRESS: Record<ApplicationStep, number> = {
  eligibility_check: 25,
  document_prepare: 50,
  application_submit: 75,
  result_wait: 100,
};

/**
 * 마감 임박 여부 확인 (7일 이내)
 */
export function isDeadlineApproaching(deadline?: string): boolean {
  if (!deadline) return false;

  // 상시, 수시 등의 경우 false
  if (deadline.includes('상시') || deadline.includes('수시')) {
    return false;
  }

  // 날짜 파싱
  const dateMatch = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (!dateMatch) return false;

  const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
  const now = new Date();
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= 7;
}

/**
 * 마감일까지 남은 일수
 */
export function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null;

  if (deadline.includes('상시') || deadline.includes('수시')) {
    return null;
  }

  const dateMatch = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (!dateMatch) return null;

  const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
  const now = new Date();
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
