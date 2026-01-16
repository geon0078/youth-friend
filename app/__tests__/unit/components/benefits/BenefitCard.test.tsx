/**
 * BenefitCard 컴포넌트 테스트
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BenefitCard } from '@/components/benefits';
import type { Benefit } from '@/types';

// Mock data
const mockBenefit: Benefit = {
  id: 'youth-policy-123',
  originalId: '123',
  source: 'youth-policy',
  title: '청년 취업지원금',
  description: '청년 취업을 지원하는 정책입니다',
  category: 'employment',
  amount: 5000000,
  deadline: '2026-01-23',
  status: 'active',
  requirements: ['만 19-34세', '미취업자'],
  organization: '고용노동부',
};

const mockBenefitNoAmount: Benefit = {
  ...mockBenefit,
  id: 'youth-policy-456',
  amount: undefined,
  supportContent: '취업 컨설팅 제공',
};

const mockBenefitUrgent: Benefit = {
  ...mockBenefit,
  id: 'youth-policy-789',
  deadline: '2026-01-18', // 2 days from test date
};

describe('BenefitCard', () => {
  // 테스트 날짜 설정 (2026-01-16 기준)
  const mockDate = new Date('2026-01-16T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render benefit title', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
    expect(getByText('청년 취업지원금')).toBeTruthy();
  });

  it('should render category label', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
    expect(getByText('취업')).toBeTruthy();
  });

  it('should render formatted amount when available', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
    expect(getByText('약 500만원')).toBeTruthy();
  });

  it('should render supportContent when amount is not available', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefitNoAmount} />);
    expect(getByText('취업 컨설팅 제공')).toBeTruthy();
  });

  it('should render organization name', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
    expect(getByText('고용노동부')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <BenefitCard benefit={mockBenefit} onPress={onPress} />
    );

    const button = getByRole('button');
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility label', () => {
    const { getByRole } = render(<BenefitCard benefit={mockBenefit} />);
    const button = getByRole('button');

    expect(button.props.accessibilityLabel).toContain('청년 취업지원금');
    expect(button.props.accessibilityLabel).toContain('취업');
    expect(button.props.accessibilityLabel).toContain('약 500만원');
  });

  it('should have accessibility hint', () => {
    const { getByRole } = render(<BenefitCard benefit={mockBenefit} />);
    const button = getByRole('button');

    expect(button.props.accessibilityHint).toBe(
      '탭하면 혜택 상세 화면으로 이동합니다'
    );
  });

  it('should show deadline badge for urgent deadlines', () => {
    const { getByText } = render(<BenefitCard benefit={mockBenefitUrgent} />);
    // D-2 badge should be visible
    expect(getByText('D-2')).toBeTruthy();
  });
});
