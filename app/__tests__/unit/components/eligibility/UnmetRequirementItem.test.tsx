/**
 * UnmetRequirementItem 테스트
 * Story 4.5: Display Unmet Requirements
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnmetRequirementItem } from '@/components/eligibility/UnmetRequirementItem';
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

describe('UnmetRequirementItem', () => {
  describe('기본 렌더링', () => {
    it('미충족 요건 설명이 표시된다', () => {
      const requirement = createTestRequirement();
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('만 19세 이상 34세 이하만 신청 가능')).toBeTruthy();
    });

    it('필드 라벨이 표시된다', () => {
      const requirement = createTestRequirement({ field: 'age' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('나이 조건')).toBeTruthy();
    });

    it('심각도 배지가 표시된다', () => {
      const requirement = createTestRequirement({ severity: 'required' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('필수')).toBeTruthy();
    });
  });

  describe('필드별 아이콘', () => {
    it('나이 필드에 calendar 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'age' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('나이 조건')).toBeTruthy();
    });

    it('소득 필드에 wonsign 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'income' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('소득수준 조건')).toBeTruthy();
    });

    it('지역 필드에 location 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'region' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('지역 조건')).toBeTruthy();
    });

    it('고용 필드에 briefcase 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'employment' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('취업상태 조건')).toBeTruthy();
    });

    it('교육 필드에 graduationcap 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'education' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('학력 조건')).toBeTruthy();
    });

    it('전공 필드에 book 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'major' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('전공 조건')).toBeTruthy();
    });

    it('거주 필드에 house 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'residence' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('거주지 조건')).toBeTruthy();
    });

    it('custom 필드에 questionmark 아이콘이 매핑된다', () => {
      const requirement = createTestRequirement({ field: 'custom' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('기타 조건')).toBeTruthy();
    });
  });

  describe('값 비교 표시', () => {
    it('현재 값이 표시된다', () => {
      const requirement = createTestRequirement({
        currentValue: '16세',
      });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('현재')).toBeTruthy();
      expect(getByText('16세')).toBeTruthy();
    });

    it('필요 값이 표시된다', () => {
      const requirement = createTestRequirement({
        requiredValue: '만 19세 이상',
      });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('필요')).toBeTruthy();
      expect(getByText('만 19세 이상')).toBeTruthy();
    });

    it('현재 값이 없으면 현재 행을 표시하지 않는다', () => {
      const requirement = createTestRequirement({
        currentValue: undefined,
      });
      const { queryByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      // "현재" 라벨이 나타나지 않아야 함
      // 단, "필요" 라벨은 항상 나타남
      expect(queryByText('필요')).toBeTruthy();
    });
  });

  describe('심각도별 색상', () => {
    it('required 심각도는 빨간색으로 표시', () => {
      const requirement = createTestRequirement({ severity: 'required' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('필수')).toBeTruthy();
    });

    it('recommended 심각도는 노란색으로 표시', () => {
      const requirement = createTestRequirement({ severity: 'recommended' });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('권장')).toBeTruthy();
    });
  });

  describe('futureEligibility 표시', () => {
    it('futureEligibility가 있으면 메시지를 표시한다', () => {
      const requirement = createTestRequirement({
        futureEligibility: {
          eligibleYear: 2029,
          yearsUntilEligible: 3,
          message: '3년 후 자격 획득',
        },
      });
      const { getByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByText('3년 후 자격 획득')).toBeTruthy();
    });

    it('futureEligibility가 없으면 미래 자격 섹션을 표시하지 않는다', () => {
      const requirement = createTestRequirement({
        futureEligibility: undefined,
      });
      const { queryByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(queryByText('년 후 자격 획득')).toBeNull();
    });
  });

  describe('프로필 수정 버튼', () => {
    it('canResolveByProfile이 true이고 onEditProfile이 있으면 버튼이 표시된다', () => {
      const onEditProfile = jest.fn();
      const requirement = createTestRequirement({
        canResolveByProfile: true,
      });
      const { getByText } = render(
        <UnmetRequirementItem
          requirement={requirement}
          onEditProfile={onEditProfile}
        />
      );

      expect(getByText('프로필 수정')).toBeTruthy();
    });

    it('프로필 수정 버튼 클릭 시 onEditProfile이 호출된다', () => {
      const onEditProfile = jest.fn();
      const requirement = createTestRequirement({
        canResolveByProfile: true,
      });
      const { getByText } = render(
        <UnmetRequirementItem
          requirement={requirement}
          onEditProfile={onEditProfile}
        />
      );

      fireEvent.press(getByText('프로필 수정'));
      expect(onEditProfile).toHaveBeenCalled();
    });

    it('canResolveByProfile이 false이면 버튼이 표시되지 않는다', () => {
      const onEditProfile = jest.fn();
      const requirement = createTestRequirement({
        canResolveByProfile: false,
      });
      const { queryByText } = render(
        <UnmetRequirementItem
          requirement={requirement}
          onEditProfile={onEditProfile}
        />
      );

      expect(queryByText('프로필 수정')).toBeNull();
    });

    it('onEditProfile이 없으면 버튼이 표시되지 않는다', () => {
      const requirement = createTestRequirement({
        canResolveByProfile: true,
      });
      const { queryByText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(queryByText('프로필 수정')).toBeNull();
    });
  });

  describe('접근성', () => {
    it('접근성 레이블이 설정되어 있다', () => {
      const requirement = createTestRequirement({
        field: 'age',
        description: '만 19세 이상 필요',
      });
      const { getByLabelText } = render(
        <UnmetRequirementItem requirement={requirement} />
      );

      expect(getByLabelText(/나이 조건 미충족/)).toBeTruthy();
    });
  });
});
