/**
 * EligibilityCheckButton 테스트
 * Story 4.4: Implement Eligibility Check UI
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EligibilityCheckButton } from '@/components/eligibility/EligibilityCheckButton';

describe('EligibilityCheckButton', () => {
  const defaultProps = {
    hasProfile: true,
    onPress: jest.fn(),
    onSetupProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('프로필 미설정 상태', () => {
    it('프로필 설정 필요 메시지를 표시한다', () => {
      const { getByText } = render(
        <EligibilityCheckButton {...defaultProps} hasProfile={false} />
      );

      expect(getByText('프로필 설정 후 자격 확인')).toBeTruthy();
      expect(getByText('자격 확인을 위해 프로필 정보가 필요합니다')).toBeTruthy();
    });

    it('프로필 설정 버튼 클릭 시 onSetupProfile 호출', () => {
      const onSetupProfile = jest.fn();
      const { getByText } = render(
        <EligibilityCheckButton
          {...defaultProps}
          hasProfile={false}
          onSetupProfile={onSetupProfile}
        />
      );

      fireEvent.press(getByText('프로필 설정 후 자격 확인'));
      expect(onSetupProfile).toHaveBeenCalled();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중이면 스피너와 메시지를 표시한다', () => {
      const { getByText } = render(
        <EligibilityCheckButton {...defaultProps} isLoading={true} />
      );

      expect(getByText('자격 확인 중...')).toBeTruthy();
    });
  });

  describe('결과 표시', () => {
    it('결과 없으면 "자격 확인하기" 버튼 표시', () => {
      const { getByText } = render(
        <EligibilityCheckButton {...defaultProps} />
      );

      expect(getByText('자격 확인하기')).toBeTruthy();
    });

    it('버튼 클릭 시 onPress 호출', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <EligibilityCheckButton {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('자격 확인하기'));
      expect(onPress).toHaveBeenCalled();
    });

    it('eligible 상태면 "자격 충족" 배지 표시', () => {
      const { getByText } = render(
        <EligibilityCheckButton
          {...defaultProps}
          status="eligible"
          score={100}
        />
      );

      expect(getByText('자격 확인 결과 보기')).toBeTruthy();
      expect(getByText('자격 충족')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy();
    });

    it('ineligible 상태면 "자격 미충족" 배지 표시', () => {
      const { getByText } = render(
        <EligibilityCheckButton
          {...defaultProps}
          status="ineligible"
          score={25}
        />
      );

      expect(getByText('자격 미충족')).toBeTruthy();
      expect(getByText('25%')).toBeTruthy();
    });

    it('partial 상태면 "일부 조건 미충족" 배지 표시', () => {
      const { getByText } = render(
        <EligibilityCheckButton
          {...defaultProps}
          status="partial"
          score={75}
        />
      );

      expect(getByText('일부 조건 미충족')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });

    it('unknown 상태면 "직접 확인 필요" 배지 표시', () => {
      const { getByText } = render(
        <EligibilityCheckButton
          {...defaultProps}
          status="unknown"
          score={50}
        />
      );

      expect(getByText('직접 확인 필요')).toBeTruthy();
    });
  });

  describe('접근성', () => {
    it('프로필 미설정 버튼에 접근성 속성이 있다', () => {
      const { getByLabelText } = render(
        <EligibilityCheckButton {...defaultProps} hasProfile={false} />
      );

      expect(getByLabelText('프로필 설정 필요')).toBeTruthy();
    });

    it('결과 버튼에 접근성 속성이 있다', () => {
      const { getByLabelText } = render(
        <EligibilityCheckButton {...defaultProps} status="eligible" />
      );

      expect(getByLabelText('자격 확인 결과: 자격 충족')).toBeTruthy();
    });
  });
});
