/**
 * Accessibility Audit Utilities
 * Story 7.7: Conduct Accessibility Audit
 *
 * 접근성 감사를 위한 유틸리티 및 체크리스트
 */

/**
 * 접근성 문제 심각도
 */
export type AccessibilitySeverity = 'critical' | 'major' | 'minor';

/**
 * 접근성 카테고리
 */
export type AccessibilityCategory =
  | 'perceivable'      // 인지 가능
  | 'operable'         // 조작 가능
  | 'understandable'   // 이해 가능
  | 'robust';          // 견고함

/**
 * 접근성 검사 항목
 */
export interface AccessibilityCheckItem {
  id: string;
  category: AccessibilityCategory;
  severity: AccessibilitySeverity;
  description: string;
  wcagCriteria: string;
  howToCheck: string;
  status: 'pass' | 'fail' | 'partial' | 'not_applicable';
  notes?: string;
}

/**
 * 접근성 감사 결과
 */
export interface AccessibilityAuditResult {
  timestamp: string;
  totalChecks: number;
  passed: number;
  failed: number;
  partial: number;
  notApplicable: number;
  score: number; // 0-100
  checks: AccessibilityCheckItem[];
}

/**
 * 청소년 친구 앱 접근성 체크리스트
 * WCAG 2.1 AA 기준
 */
export const ACCESSIBILITY_CHECKLIST: Omit<AccessibilityCheckItem, 'status' | 'notes'>[] = [
  // Perceivable (인지 가능)
  {
    id: 'text-alternatives',
    category: 'perceivable',
    severity: 'critical',
    description: '모든 비텍스트 콘텐츠에 텍스트 대안 제공',
    wcagCriteria: '1.1.1',
    howToCheck: '이미지, 아이콘에 accessibilityLabel 또는 대체 텍스트 확인',
  },
  {
    id: 'color-contrast',
    category: 'perceivable',
    severity: 'critical',
    description: '텍스트와 배경 간 충분한 색상 대비 (4.5:1 이상)',
    wcagCriteria: '1.4.3',
    howToCheck: '고대비 모드에서 calculateContrastRatio 함수로 대비율 확인',
  },
  {
    id: 'text-resize',
    category: 'perceivable',
    severity: 'major',
    description: '텍스트 200%까지 확대 시 콘텐츠 손실 없음',
    wcagCriteria: '1.4.4',
    howToCheck: 'textSize: large 설정 시 레이아웃 깨짐 확인',
  },
  {
    id: 'orientation',
    category: 'perceivable',
    severity: 'minor',
    description: '화면 방향 제한 없음 (가로/세로 모두 지원)',
    wcagCriteria: '1.3.4',
    howToCheck: '가로/세로 모드 전환 시 정상 작동 확인',
  },
  {
    id: 'reflow',
    category: 'perceivable',
    severity: 'major',
    description: '가로 스크롤 없이 콘텐츠 표시 (320px 너비)',
    wcagCriteria: '1.4.10',
    howToCheck: '작은 화면에서 콘텐츠 잘림 확인',
  },

  // Operable (조작 가능)
  {
    id: 'touch-target-size',
    category: 'operable',
    severity: 'major',
    description: '터치 대상 최소 44x44pt 이상',
    wcagCriteria: '2.5.5',
    howToCheck: 'TouchTargets.minimum 사용 또는 hitSlop 적용 확인',
  },
  {
    id: 'focus-visible',
    category: 'operable',
    severity: 'major',
    description: '포커스 상태 시각적 표시',
    wcagCriteria: '2.4.7',
    howToCheck: '키보드/스위치 컨트롤로 포커스 이동 시 시각적 표시 확인',
  },
  {
    id: 'focus-order',
    category: 'operable',
    severity: 'major',
    description: '논리적 포커스 순서',
    wcagCriteria: '2.4.3',
    howToCheck: '스크린 리더로 탐색 시 순서 논리적인지 확인',
  },
  {
    id: 'skip-content',
    category: 'operable',
    severity: 'minor',
    description: '반복 콘텐츠 건너뛰기 기능',
    wcagCriteria: '2.4.1',
    howToCheck: '헤더 역할(accessibilityRole="header") 적절히 사용 확인',
  },
  {
    id: 'no-timing',
    category: 'operable',
    severity: 'major',
    description: '시간 제한 없거나 조절 가능',
    wcagCriteria: '2.2.1',
    howToCheck: '자동 로그아웃 등 시간 제한 기능의 경고/연장 기능 확인',
  },
  {
    id: 'motion-actuation',
    category: 'operable',
    severity: 'major',
    description: '흔들기 등 모션 작동 대안 제공',
    wcagCriteria: '2.5.4',
    howToCheck: '모션 기반 기능에 대안 버튼 제공 확인',
  },

  // Understandable (이해 가능)
  {
    id: 'language',
    category: 'understandable',
    severity: 'minor',
    description: '페이지 언어 명시',
    wcagCriteria: '3.1.1',
    howToCheck: '앱 언어 설정 확인',
  },
  {
    id: 'on-input',
    category: 'understandable',
    severity: 'major',
    description: '입력 시 예기치 않은 컨텍스트 변경 없음',
    wcagCriteria: '3.2.2',
    howToCheck: '입력 필드 변경 시 자동 제출/페이지 이동 없는지 확인',
  },
  {
    id: 'error-identification',
    category: 'understandable',
    severity: 'critical',
    description: '입력 오류 식별 및 설명',
    wcagCriteria: '3.3.1',
    howToCheck: '폼 유효성 검사 오류 메시지 명확한지 확인',
  },
  {
    id: 'labels-instructions',
    category: 'understandable',
    severity: 'major',
    description: '레이블 및 지시 사항 제공',
    wcagCriteria: '3.3.2',
    howToCheck: '모든 입력 필드에 레이블 연결 확인',
  },
  {
    id: 'error-suggestion',
    category: 'understandable',
    severity: 'major',
    description: '오류 수정 제안',
    wcagCriteria: '3.3.3',
    howToCheck: '오류 발생 시 수정 방법 안내 확인',
  },

  // Robust (견고함)
  {
    id: 'parsing',
    category: 'robust',
    severity: 'major',
    description: 'React Native 컴포넌트 올바른 사용',
    wcagCriteria: '4.1.1',
    howToCheck: '접근성 속성 중복/충돌 없는지 확인',
  },
  {
    id: 'name-role-value',
    category: 'robust',
    severity: 'critical',
    description: '이름, 역할, 값 프로그래밍 방식 결정',
    wcagCriteria: '4.1.2',
    howToCheck: 'accessibilityRole, accessibilityState, accessibilityValue 적절한지 확인',
  },
  {
    id: 'status-messages',
    category: 'robust',
    severity: 'major',
    description: '상태 메시지 스크린 리더에 전달',
    wcagCriteria: '4.1.3',
    howToCheck: '로딩, 성공, 오류 상태 announceForAccessibility 사용 확인',
  },
];

/**
 * 접근성 감사 수행
 * @param checkResults 각 항목의 검사 결과
 */
export function performAccessibilityAudit(
  checkResults: Array<{ id: string; status: AccessibilityCheckItem['status']; notes?: string }>
): AccessibilityAuditResult {
  const checks: AccessibilityCheckItem[] = ACCESSIBILITY_CHECKLIST.map((item) => {
    const result = checkResults.find((r) => r.id === item.id);
    return {
      ...item,
      status: result?.status ?? 'not_applicable',
      notes: result?.notes,
    };
  });

  const passed = checks.filter((c) => c.status === 'pass').length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const partial = checks.filter((c) => c.status === 'partial').length;
  const notApplicable = checks.filter((c) => c.status === 'not_applicable').length;

  // 심각도 가중치 적용 점수 계산
  const applicableChecks = checks.filter((c) => c.status !== 'not_applicable');
  const totalWeight = applicableChecks.reduce((sum, check) => {
    const weight = check.severity === 'critical' ? 3 : check.severity === 'major' ? 2 : 1;
    return sum + weight;
  }, 0);

  const earnedWeight = applicableChecks.reduce((sum, check) => {
    const weight = check.severity === 'critical' ? 3 : check.severity === 'major' ? 2 : 1;
    if (check.status === 'pass') return sum + weight;
    if (check.status === 'partial') return sum + weight * 0.5;
    return sum;
  }, 0);

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    timestamp: new Date().toISOString(),
    totalChecks: checks.length,
    passed,
    failed,
    partial,
    notApplicable,
    score,
    checks,
  };
}

/**
 * 접근성 점수 등급 반환
 */
export function getAccessibilityGrade(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
} {
  if (score >= 90) return { grade: 'A', label: '우수', color: '#22C55E' };
  if (score >= 80) return { grade: 'B', label: '양호', color: '#3B82F6' };
  if (score >= 70) return { grade: 'C', label: '보통', color: '#F59E0B' };
  if (score >= 60) return { grade: 'D', label: '개선 필요', color: '#F97316' };
  return { grade: 'F', label: '미흡', color: '#EF4444' };
}

/**
 * 접근성 개선 우선순위 정렬
 */
export function getPriorityIssues(
  auditResult: AccessibilityAuditResult
): AccessibilityCheckItem[] {
  const failedChecks = auditResult.checks.filter(
    (c) => c.status === 'fail' || c.status === 'partial'
  );

  // 심각도 순으로 정렬 (critical > major > minor)
  return failedChecks.sort((a, b) => {
    const severityOrder = { critical: 0, major: 1, minor: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * 카테고리별 통계
 */
export function getCategoryStats(auditResult: AccessibilityAuditResult): Record<
  AccessibilityCategory,
  { passed: number; failed: number; total: number }
> {
  const categories: AccessibilityCategory[] = [
    'perceivable',
    'operable',
    'understandable',
    'robust',
  ];

  const stats = {} as Record<
    AccessibilityCategory,
    { passed: number; failed: number; total: number }
  >;

  categories.forEach((category) => {
    const categoryChecks = auditResult.checks.filter(
      (c) => c.category === category && c.status !== 'not_applicable'
    );
    stats[category] = {
      passed: categoryChecks.filter((c) => c.status === 'pass').length,
      failed: categoryChecks.filter((c) => c.status === 'fail' || c.status === 'partial').length,
      total: categoryChecks.length,
    };
  });

  return stats;
}
