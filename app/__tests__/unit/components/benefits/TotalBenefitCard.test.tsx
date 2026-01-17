/**
 * TotalBenefitCard 컴포넌트 테스트
 */
import { render, fireEvent } from '@testing-library/react-native';
import { TotalBenefitCard } from '@/components/benefits/TotalBenefitCard';
import { TotalBenefitCardSkeleton } from '@/components/benefits/TotalBenefitCardSkeleton';
import type { TotalBenefitsData } from '@/hooks';

const mockData: TotalBenefitsData = {
  totalAmount: 12000000,
  formattedAmount: '약 1,200만원 이상',
  benefitCount: 12,
  formattedCount: '12개 혜택',
  parsedBenefitCount: 8,
  coveragePercent: 67,
};

describe('TotalBenefitCard', () => {
  it('포맷팅된 금액을 표시한다', () => {
    const { getByText } = render(<TotalBenefitCard data={mockData} />);

    expect(getByText('약 1,200만원 이상')).toBeTruthy();
  });

  it('포맷팅된 혜택 개수를 표시한다', () => {
    const { getByText } = render(<TotalBenefitCard data={mockData} />);

    expect(getByText('12개 혜택')).toBeTruthy();
  });

  it('손실 회피 프레이밍 문구를 표시한다', () => {
    const { getByText } = render(<TotalBenefitCard data={mockData} />);

    expect(getByText('놓치면 아까운 혜택')).toBeTruthy();
  });

  it('탭 시 onPress 콜백을 호출한다', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <TotalBenefitCard data={mockData} onPress={onPress} />
    );

    const button = getByRole('button');
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('접근성 레이블을 제공한다', () => {
    const { getByLabelText } = render(<TotalBenefitCard data={mockData} />);

    const element = getByLabelText(
      '총 약 1,200만원 이상 혜택 받기 가능. 12개 혜택. 탭하여 목록 보기'
    );
    expect(element).toBeTruthy();
  });

  it('접근성 힌트를 제공한다', () => {
    const { getByRole } = render(<TotalBenefitCard data={mockData} />);

    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe(
      '탭하면 혜택 목록으로 이동합니다'
    );
  });

  it('onPress가 없어도 렌더링된다', () => {
    const { getByText } = render(<TotalBenefitCard data={mockData} />);

    expect(getByText('약 1,200만원 이상')).toBeTruthy();
  });
});

describe('TotalBenefitCardSkeleton', () => {
  it('렌더링된다', () => {
    const { getByLabelText } = render(<TotalBenefitCardSkeleton />);

    expect(getByLabelText('혜택 정보 로딩 중')).toBeTruthy();
  });

  it('progressbar 역할을 가진다', () => {
    const { getByLabelText } = render(<TotalBenefitCardSkeleton />);

    const element = getByLabelText('혜택 정보 로딩 중');
    expect(element.props.accessibilityRole).toBe('progressbar');
  });
});
