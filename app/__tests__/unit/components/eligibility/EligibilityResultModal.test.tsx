/**
 * EligibilityResultModal 테스트
 * Story 4.4: Implement Eligibility Check UI
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EligibilityResultModal } from '@/components/eligibility/EligibilityResultModal';
import type { EligibilityResult } from '@/types/models/eligibility';
import { ELIGIBILITY_DISCLAIMER } from '@/types/models/eligibility';

// 테스트용 결과 생성
const createTestResult = (overrides?: Partial<EligibilityResult>): EligibilityResult => ({
  benefitId: 'test-benefit',
  status: 'eligible',
  score: {
    total: 100,
    metCount: 4,
    unmetCount: 0,
    unknownCount: 0,
    totalRules: 4,
  },
  ruleResults: [],
  unmetRequirements: [],
  checkedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  ...overrides,
});

describe('EligibilityResultModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    result: createTestResult(),
    benefitTitle: '테스트 혜택',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('모달이 visible=true일 때 렌더링된다', () => {
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} />
      );

      expect(getByText('자격 확인 결과')).toBeTruthy();
    });

    it('혜택 제목이 표시된다', () => {
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} benefitTitle="청년 취업 지원금" />
      );

      expect(getByText('청년 취업 지원금')).toBeTruthy();
    });

    it('면책 조항이 표시된다', () => {
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} />
      );

      expect(getByText(ELIGIBILITY_DISCLAIMER)).toBeTruthy();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중이면 로딩 메시지를 표시한다', () => {
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} isLoading={true} />
      );

      expect(getByText('자격을 확인하고 있습니다...')).toBeTruthy();
    });
  });

  describe('상태별 표시', () => {
    it('eligible 상태면 "자격 충족" 표시', () => {
      const result = createTestResult({ status: 'eligible' });
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('자격 충족')).toBeTruthy();
      expect(getByText('이 혜택에 대한 자격 요건을 모두 충족합니다.')).toBeTruthy();
    });

    it('ineligible 상태면 "자격 미충족" 표시', () => {
      const result = createTestResult({ status: 'ineligible', score: { ...createTestResult().score, total: 25 } });
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('자격 미충족')).toBeTruthy();
      expect(getByText('일부 필수 자격 요건을 충족하지 못합니다.')).toBeTruthy();
    });

    it('partial 상태면 "일부 조건 미충족" 표시', () => {
      const result = createTestResult({ status: 'partial', score: { ...createTestResult().score, total: 75 } });
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('일부 조건 미충족')).toBeTruthy();
      expect(getByText('대부분의 조건을 충족하나 일부 확인이 필요합니다.')).toBeTruthy();
    });

    it('unknown 상태면 "직접 확인 필요" 표시', () => {
      const result = createTestResult({ status: 'unknown', score: { ...createTestResult().score, total: 50 } });
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('직접 확인 필요')).toBeTruthy();
      expect(getByText('자동 검증이 어려운 조건이 있습니다. 담당 기관에 문의하세요.')).toBeTruthy();
    });
  });

  describe('점수 표시', () => {
    it('매칭 점수가 표시된다', () => {
      const result = createTestResult({ score: { ...createTestResult().score, total: 75 } });
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('매칭 점수')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });
  });

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose 호출', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} onClose={onClose} />
      );

      fireEvent.press(getByText('확인'));
      expect(onClose).toHaveBeenCalled();
    });

    it('헤더 X 버튼 클릭 시 onClose 호출', () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <EligibilityResultModal {...defaultProps} onClose={onClose} />
      );

      fireEvent.press(getByLabelText('닫기'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('result가 null인 경우', () => {
    it('unknown 상태로 기본 표시', () => {
      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={null} />
      );

      expect(getByText('직접 확인 필요')).toBeTruthy();
    });
  });

  describe('미충족 요건 통합 (Story 4.5)', () => {
    it('ineligible 상태에서 미충족 요건 목록이 표시된다', () => {
      const result = createTestResult({
        status: 'ineligible',
        score: { ...createTestResult().score, total: 25 },
        unmetRequirements: [
          {
            ruleId: 'age-rule',
            field: 'age',
            severity: 'required',
            description: '만 19세 이상 필요',
            currentValue: '16세',
            requiredValue: '만 19세 이상',
            canResolveByProfile: false,
          },
        ],
      });

      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('미충족 요건')).toBeTruthy();
      expect(getByText('만 19세 이상 필요')).toBeTruthy();
    });

    it('partial 상태에서 미충족 요건 목록이 표시된다', () => {
      const result = createTestResult({
        status: 'partial',
        score: { ...createTestResult().score, total: 75 },
        unmetRequirements: [
          {
            ruleId: 'income-rule',
            field: 'income',
            severity: 'recommended',
            description: '중위소득 100% 이하 권장',
            currentValue: '120%',
            requiredValue: '100% 이하',
            canResolveByProfile: true,
          },
        ],
      });

      const { getByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(getByText('미충족 요건')).toBeTruthy();
      expect(getByText('중위소득 100% 이하 권장')).toBeTruthy();
    });

    it('eligible 상태에서는 미충족 요건 목록이 표시되지 않는다', () => {
      const result = createTestResult({
        status: 'eligible',
        unmetRequirements: [],
      });

      const { queryByText } = render(
        <EligibilityResultModal {...defaultProps} result={result} />
      );

      expect(queryByText('미충족 요건')).toBeNull();
    });

    it('onEditProfile 핸들러가 프로필 수정 버튼에 전달된다', () => {
      const onEditProfile = jest.fn();
      const result = createTestResult({
        status: 'ineligible',
        score: { ...createTestResult().score, total: 50 },
        unmetRequirements: [
          {
            ruleId: 'region-rule',
            field: 'region',
            severity: 'required',
            description: '서울 거주 필요',
            currentValue: '부산',
            requiredValue: '서울특별시',
            canResolveByProfile: true,
          },
        ],
      });

      const { getByText } = render(
        <EligibilityResultModal
          {...defaultProps}
          result={result}
          onEditProfile={onEditProfile}
        />
      );

      fireEvent.press(getByText('프로필 수정'));
      expect(onEditProfile).toHaveBeenCalled();
    });
  });
});
