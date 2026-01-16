/**
 * Accessibility Utilities Tests
 * Story 7.7: Conduct Accessibility Audit
 */
import {
  formatAmountForScreenReader,
  formatDateForScreenReader,
  formatDeadlineForScreenReader,
  formatProgressForScreenReader,
  formatEligibilityForScreenReader,
  createButtonLabel,
  createCardLabel,
  createFieldHint,
  createListItemPosition,
  createAccessibilityProps,
  ACCESSIBILITY_CHECKLIST,
  performAccessibilityAudit,
  getAccessibilityGrade,
  getPriorityIssues,
  getCategoryStats,
} from '@/utils/accessibility';

describe('Screen Reader Formatting Utilities', () => {
  describe('formatAmountForScreenReader', () => {
    it('handles undefined amount', () => {
      expect(formatAmountForScreenReader(undefined)).toBe('금액 정보 없음');
    });

    it('formats billions correctly', () => {
      expect(formatAmountForScreenReader(100000000)).toBe('1억원');
      expect(formatAmountForScreenReader(250000000)).toBe('2억 5000만원');
    });

    it('formats millions correctly', () => {
      expect(formatAmountForScreenReader(10000)).toBe('1만원');
      expect(formatAmountForScreenReader(500000)).toBe('50만원');
      expect(formatAmountForScreenReader(12340000)).toBe('1234만원');
    });

    it('formats small amounts correctly', () => {
      expect(formatAmountForScreenReader(5000)).toBe('5,000원');
      expect(formatAmountForScreenReader(100)).toBe('100원');
    });
  });

  describe('formatDateForScreenReader', () => {
    it('handles undefined date', () => {
      expect(formatDateForScreenReader(undefined)).toBe('날짜 정보 없음');
    });

    it('handles 상시 모집', () => {
      expect(formatDateForScreenReader('상시모집')).toBe('상시 모집');
      expect(formatDateForScreenReader('수시 모집')).toBe('상시 모집');
    });

    it('formats date strings correctly', () => {
      expect(formatDateForScreenReader('2024.12.31')).toBe('2024년 12월 31일');
      expect(formatDateForScreenReader('2024-01-15')).toBe('2024년 1월 15일');
      expect(formatDateForScreenReader('2024/6/5')).toBe('2024년 6월 5일');
    });
  });

  describe('formatDeadlineForScreenReader', () => {
    it('handles null deadline', () => {
      expect(formatDeadlineForScreenReader(null)).toBe('');
    });

    it('handles past deadlines', () => {
      expect(formatDeadlineForScreenReader(-1)).toBe('이미 마감됨');
      expect(formatDeadlineForScreenReader(-10)).toBe('이미 마감됨');
    });

    it('handles today deadline', () => {
      expect(formatDeadlineForScreenReader(0)).toBe('오늘 마감');
    });

    it('handles tomorrow deadline', () => {
      expect(formatDeadlineForScreenReader(1)).toBe('내일 마감');
    });

    it('handles future deadlines', () => {
      expect(formatDeadlineForScreenReader(7)).toBe('7일 후 마감');
      expect(formatDeadlineForScreenReader(30)).toBe('30일 후 마감');
    });
  });

  describe('formatProgressForScreenReader', () => {
    it('handles zero progress', () => {
      expect(formatProgressForScreenReader(0)).toBe('시작 전');
    });

    it('handles complete progress', () => {
      expect(formatProgressForScreenReader(100)).toBe('완료됨');
    });

    it('handles partial progress', () => {
      expect(formatProgressForScreenReader(50)).toBe('50% 진행됨');
      expect(formatProgressForScreenReader(75)).toBe('75% 진행됨');
    });
  });

  describe('formatEligibilityForScreenReader', () => {
    it('formats all eligibility statuses', () => {
      expect(formatEligibilityForScreenReader('eligible')).toBe('자격 조건 충족');
      expect(formatEligibilityForScreenReader('ineligible')).toBe('자격 조건 미충족');
      expect(formatEligibilityForScreenReader('partial')).toBe('일부 조건 충족, 확인 필요');
      expect(formatEligibilityForScreenReader('unknown')).toBe('자격 확인 필요');
    });
  });
});

describe('Label Creation Utilities', () => {
  describe('createButtonLabel', () => {
    it('creates simple label', () => {
      expect(createButtonLabel('저장')).toBe('저장');
    });

    it('creates label with context', () => {
      expect(createButtonLabel('저장', '프로필 정보')).toBe('저장, 프로필 정보');
    });
  });

  describe('createCardLabel', () => {
    it('creates label from title and details', () => {
      expect(createCardLabel('청년 취업 지원금', ['100만원', '30일 후 마감']))
        .toBe('청년 취업 지원금, 100만원, 30일 후 마감');
    });

    it('filters empty details', () => {
      expect(createCardLabel('혜택 이름', ['', '세부사항', '']))
        .toBe('혜택 이름, 세부사항');
    });
  });

  describe('createFieldHint', () => {
    it('creates required field hint', () => {
      expect(createFieldHint('텍스트 입력 필드', true))
        .toBe('텍스트 입력 필드. 필수 입력 항목');
    });

    it('creates optional field hint', () => {
      expect(createFieldHint('이메일 입력 필드', false))
        .toBe('이메일 입력 필드. 선택 입력 항목');
    });
  });

  describe('createListItemPosition', () => {
    it('creates correct position label', () => {
      expect(createListItemPosition(0, 10)).toBe('10개 중 1번째');
      expect(createListItemPosition(4, 10)).toBe('10개 중 5번째');
      expect(createListItemPosition(9, 10)).toBe('10개 중 10번째');
    });
  });
});

describe('createAccessibilityProps', () => {
  it('creates basic props', () => {
    const props = createAccessibilityProps({ label: '저장 버튼' });
    expect(props).toEqual({
      accessible: true,
      accessibilityLabel: '저장 버튼',
    });
  });

  it('includes optional props when provided', () => {
    const props = createAccessibilityProps({
      label: '체크박스',
      hint: '탭하여 선택/해제',
      role: 'checkbox',
      state: { checked: true },
      value: { text: '선택됨' },
    });

    expect(props).toEqual({
      accessible: true,
      accessibilityLabel: '체크박스',
      accessibilityHint: '탭하여 선택/해제',
      accessibilityRole: 'checkbox',
      accessibilityState: { checked: true },
      accessibilityValue: { text: '선택됨' },
    });
  });
});

describe('Accessibility Audit Utilities', () => {
  describe('ACCESSIBILITY_CHECKLIST', () => {
    it('has all required WCAG categories', () => {
      const categories = [...new Set(ACCESSIBILITY_CHECKLIST.map(c => c.category))];
      expect(categories).toContain('perceivable');
      expect(categories).toContain('operable');
      expect(categories).toContain('understandable');
      expect(categories).toContain('robust');
    });

    it('has all severity levels', () => {
      const severities = [...new Set(ACCESSIBILITY_CHECKLIST.map(c => c.severity))];
      expect(severities).toContain('critical');
      expect(severities).toContain('major');
      expect(severities).toContain('minor');
    });

    it('has unique IDs', () => {
      const ids = ACCESSIBILITY_CHECKLIST.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('performAccessibilityAudit', () => {
    it('calculates correct statistics', () => {
      const results = [
        { id: 'text-alternatives', status: 'pass' as const },
        { id: 'color-contrast', status: 'fail' as const },
        { id: 'text-resize', status: 'partial' as const },
      ];

      const audit = performAccessibilityAudit(results);

      expect(audit.passed).toBe(1);
      expect(audit.failed).toBe(1);
      expect(audit.partial).toBe(1);
      expect(audit.totalChecks).toBe(ACCESSIBILITY_CHECKLIST.length);
    });

    it('includes notes in results', () => {
      const results = [
        { id: 'text-alternatives', status: 'pass' as const, notes: '모든 이미지에 alt 텍스트 적용됨' },
      ];

      const audit = performAccessibilityAudit(results);
      const check = audit.checks.find(c => c.id === 'text-alternatives');

      expect(check?.notes).toBe('모든 이미지에 alt 텍스트 적용됨');
    });
  });

  describe('getAccessibilityGrade', () => {
    it('returns correct grades', () => {
      expect(getAccessibilityGrade(95).grade).toBe('A');
      expect(getAccessibilityGrade(85).grade).toBe('B');
      expect(getAccessibilityGrade(75).grade).toBe('C');
      expect(getAccessibilityGrade(65).grade).toBe('D');
      expect(getAccessibilityGrade(50).grade).toBe('F');
    });
  });

  describe('getPriorityIssues', () => {
    it('sorts by severity', () => {
      const results = [
        { id: 'orientation', status: 'fail' as const }, // minor
        { id: 'text-alternatives', status: 'fail' as const }, // critical
        { id: 'touch-target-size', status: 'fail' as const }, // major
      ];

      const audit = performAccessibilityAudit(results);
      const priorities = getPriorityIssues(audit);

      expect(priorities[0].severity).toBe('critical');
      expect(priorities[1].severity).toBe('major');
      expect(priorities[2].severity).toBe('minor');
    });
  });

  describe('getCategoryStats', () => {
    it('calculates stats per category', () => {
      const results = [
        { id: 'text-alternatives', status: 'pass' as const }, // perceivable
        { id: 'color-contrast', status: 'pass' as const }, // perceivable
        { id: 'touch-target-size', status: 'fail' as const }, // operable
      ];

      const audit = performAccessibilityAudit(results);
      const stats = getCategoryStats(audit);

      expect(stats.perceivable.passed).toBe(2);
      expect(stats.operable.failed).toBe(1);
    });
  });
});
