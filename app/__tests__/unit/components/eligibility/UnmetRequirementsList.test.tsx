/**
 * UnmetRequirementsList 테스트
 * Story 4.5: Display Unmet Requirements
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnmetRequirementsList } from '@/components/eligibility/UnmetRequirementsList';
import type { UnmetRequirement } from '@/types/models/eligibility';

// 테스트용 미충족 요건 생성
const createTestRequirement = (overrides?: Partial<UnmetRequirement>): UnmetRequirement => ({
  ruleId: 'test-rule-1',
  field: 'age',
  severity: 'required',
  description: '만 19세 이상 34세 이하만 신청 가능',
  currentValue: '16세',
  requiredValue: '만 19세 이상 34세 이하',
  canResolveByProfile: false,
  ...overrides,
});

describe('UnmetRequirementsList', () => {
  describe('기본 렌더링', () => {
    it('미충족 요건 목록을 렌더링한다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1', field: 'age' }),
        createTestRequirement({ ruleId: 'rule-2', field: 'region' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByText('미충족 요건')).toBeTruthy();
      expect(getByText('2개')).toBeTruthy();
    });

    it('각 요건 아이템이 표시된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({
          ruleId: 'rule-1',
          field: 'age',
          description: '나이 조건 미충족',
        }),
        createTestRequirement({
          ruleId: 'rule-2',
          field: 'region',
          description: '지역 조건 미충족',
        }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByText('나이 조건 미충족')).toBeTruthy();
      expect(getByText('지역 조건 미충족')).toBeTruthy();
    });
  });

  describe('빈 목록 처리', () => {
    it('빈 목록이면 적절한 메시지를 표시한다', () => {
      const { getByText } = render(
        <UnmetRequirementsList requirements={[]} />
      );

      expect(getByText('모든 조건 충족')).toBeTruthy();
      expect(getByText('이 혜택의 모든 자격 요건을 충족하였습니다.')).toBeTruthy();
    });

    it('빈 목록에서 접근성 레이블이 설정된다', () => {
      const { getByLabelText } = render(
        <UnmetRequirementsList requirements={[]} />
      );

      expect(getByLabelText('모든 조건을 충족합니다')).toBeTruthy();
    });
  });

  describe('심각도별 그룹화', () => {
    it('필수 조건 섹션이 표시된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1', severity: 'required' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByText('필수 조건 미충족')).toBeTruthy();
    });

    it('권장 조건 섹션이 표시된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1', severity: 'recommended' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByText('권장 조건 미충족')).toBeTruthy();
    });

    it('필수와 권장 조건이 모두 있으면 둘 다 표시된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1', severity: 'required' }),
        createTestRequirement({ ruleId: 'rule-2', severity: 'recommended' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByText('필수 조건 미충족')).toBeTruthy();
      expect(getByText('권장 조건 미충족')).toBeTruthy();
    });

    it('필수 조건만 있으면 권장 섹션은 표시되지 않는다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1', severity: 'required' }),
        createTestRequirement({ ruleId: 'rule-2', severity: 'required' }),
      ];

      const { queryByText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(queryByText('필수 조건 미충족')).toBeTruthy();
      expect(queryByText('권장 조건 미충족')).toBeNull();
    });
  });

  describe('프로필 수정 핸들러', () => {
    it('onEditProfile이 하위 아이템에 전달된다', () => {
      const onEditProfile = jest.fn();
      const requirements: UnmetRequirement[] = [
        createTestRequirement({
          ruleId: 'rule-1',
          canResolveByProfile: true,
        }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList
          requirements={requirements}
          onEditProfile={onEditProfile}
        />
      );

      fireEvent.press(getByText('프로필 수정'));
      expect(onEditProfile).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('목록에 접근성 역할이 설정된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1' }),
      ];

      const { getByLabelText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByLabelText('미충족 요건 1개')).toBeTruthy();
    });

    it('여러 요건에 대해 올바른 개수가 표시된다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1' }),
        createTestRequirement({ ruleId: 'rule-2' }),
        createTestRequirement({ ruleId: 'rule-3' }),
      ];

      const { getByLabelText } = render(
        <UnmetRequirementsList requirements={requirements} />
      );

      expect(getByLabelText('미충족 요건 3개')).toBeTruthy();
    });
  });

  describe('컬러 스킴', () => {
    it('light 컬러 스킴을 전달받을 수 있다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList
          requirements={requirements}
          colorScheme="light"
        />
      );

      expect(getByText('미충족 요건')).toBeTruthy();
    });

    it('dark 컬러 스킴을 전달받을 수 있다', () => {
      const requirements: UnmetRequirement[] = [
        createTestRequirement({ ruleId: 'rule-1' }),
      ];

      const { getByText } = render(
        <UnmetRequirementsList
          requirements={requirements}
          colorScheme="dark"
        />
      );

      expect(getByText('미충족 요건')).toBeTruthy();
    });
  });
});
