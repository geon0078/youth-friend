/**
 * DisclaimerNotice 테스트
 * Story 4.6: Display Disclaimer Notice
 * FR14: 자격 검증 결과가 참고용임을 명시
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { DisclaimerNotice } from '@/components/eligibility/DisclaimerNotice';
import { ELIGIBILITY_DISCLAIMER } from '@/types/models/eligibility';

describe('DisclaimerNotice', () => {
  describe('기본 렌더링', () => {
    it('기본 면책 문구가 표시된다', () => {
      const { getByText } = render(<DisclaimerNotice />);

      expect(getByText(ELIGIBILITY_DISCLAIMER)).toBeTruthy();
    });

    it('testID가 적용된다', () => {
      const { getByTestId } = render(<DisclaimerNotice testID="test-disclaimer" />);

      expect(getByTestId('test-disclaimer')).toBeTruthy();
    });

    it('기본 testID는 disclaimer-notice이다', () => {
      const { getByTestId } = render(<DisclaimerNotice />);

      expect(getByTestId('disclaimer-notice')).toBeTruthy();
    });
  });

  describe('커스텀 메시지', () => {
    it('커스텀 메시지가 표시된다', () => {
      const customMessage = '이 정보는 참고용입니다.';
      const { getByText, queryByText } = render(
        <DisclaimerNotice message={customMessage} />
      );

      expect(getByText(customMessage)).toBeTruthy();
      expect(queryByText(ELIGIBILITY_DISCLAIMER)).toBeNull();
    });
  });

  describe('컴팩트 모드', () => {
    it('compact 모드에서도 렌더링된다', () => {
      const { getByText } = render(<DisclaimerNotice compact />);

      expect(getByText(ELIGIBILITY_DISCLAIMER)).toBeTruthy();
    });
  });

  describe('접근성', () => {
    it('accessible 속성이 true로 설정된다', () => {
      const { getByTestId } = render(<DisclaimerNotice />);
      const container = getByTestId('disclaimer-notice');

      expect(container.props.accessible).toBe(true);
    });

    it('accessibilityRole이 text로 설정된다', () => {
      const { getByTestId } = render(<DisclaimerNotice />);
      const container = getByTestId('disclaimer-notice');

      expect(container.props.accessibilityRole).toBe('text');
    });

    it('accessibilityLabel에 안내 사항 메시지가 포함된다', () => {
      const { getByTestId } = render(<DisclaimerNotice />);
      const container = getByTestId('disclaimer-notice');

      expect(container.props.accessibilityLabel).toBe(`안내 사항: ${ELIGIBILITY_DISCLAIMER}`);
    });

    it('커스텀 메시지도 accessibilityLabel에 반영된다', () => {
      const customMessage = '테스트 면책 문구';
      const { getByTestId } = render(
        <DisclaimerNotice message={customMessage} />
      );
      const container = getByTestId('disclaimer-notice');

      expect(container.props.accessibilityLabel).toBe(`안내 사항: ${customMessage}`);
    });

    it('스크린 리더가 전체 면책 문구를 읽을 수 있다', () => {
      const { getByLabelText } = render(<DisclaimerNotice />);

      // accessibilityLabel로 찾을 수 있어야 함
      expect(getByLabelText(`안내 사항: ${ELIGIBILITY_DISCLAIMER}`)).toBeTruthy();
    });
  });

  describe('다크모드 지원', () => {
    it('light 컬러스킴에서 렌더링된다', () => {
      const { getByText } = render(<DisclaimerNotice colorScheme="light" />);

      expect(getByText(ELIGIBILITY_DISCLAIMER)).toBeTruthy();
    });

    it('dark 컬러스킴에서 렌더링된다', () => {
      const { getByText } = render(<DisclaimerNotice colorScheme="dark" />);

      expect(getByText(ELIGIBILITY_DISCLAIMER)).toBeTruthy();
    });
  });

  describe('FR14 요구사항 충족', () => {
    it('면책 문구 내용이 올바르다: "이 결과는 참고용이며, 실제 자격 여부는 담당 기관에서 최종 결정합니다"', () => {
      const expectedText = '이 결과는 참고용이며, 실제 자격 여부는 담당 기관에서 최종 결정합니다.';

      expect(ELIGIBILITY_DISCLAIMER).toBe(expectedText);
    });
  });
});
