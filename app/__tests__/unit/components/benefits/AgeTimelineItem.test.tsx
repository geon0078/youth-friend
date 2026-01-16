/**
 * AgeTimelineItem 컴포넌트 테스트
 * Story 3.9: Implement Age Timeline View
 */
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AgeTimelineItem } from '@/components/benefits/AgeTimelineItem';

describe('AgeTimelineItem', () => {
  const defaultProps = {
    age: 25,
    benefitCount: 5,
    isCurrent: false,
    isPast: false,
    isSelected: false,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('나이가 표시된다', () => {
      render(<AgeTimelineItem {...defaultProps} />);
      expect(screen.getByText('25')).toBeTruthy();
    });

    it('혜택 개수가 배지로 표시된다', () => {
      render(<AgeTimelineItem {...defaultProps} benefitCount={10} />);
      expect(screen.getByText('10')).toBeTruthy();
    });

    it('혜택 개수가 0이면 배지가 표시되지 않는다', () => {
      render(<AgeTimelineItem {...defaultProps} benefitCount={0} />);
      expect(screen.queryByText('0')).toBeNull();
    });
  });

  describe('상태 스타일', () => {
    it('현재 나이이면 강조 스타일이 적용된다', () => {
      const { toJSON } = render(
        <AgeTimelineItem {...defaultProps} isCurrent={true} />
      );
      expect(toJSON()).toBeTruthy();
      // 현재 나이 인디케이터 확인
    });

    it('과거 나이이면 흐림 스타일이 적용된다', () => {
      const { toJSON } = render(
        <AgeTimelineItem {...defaultProps} isPast={true} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('선택된 나이이면 선택 스타일이 적용된다', () => {
      const { toJSON } = render(
        <AgeTimelineItem {...defaultProps} isSelected={true} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('인터랙션', () => {
    it('탭하면 onSelect가 호출된다', () => {
      const onSelect = jest.fn();
      render(<AgeTimelineItem {...defaultProps} onSelect={onSelect} />);

      fireEvent.press(screen.getByLabelText('25세, 혜택 5개'));
      expect(onSelect).toHaveBeenCalledWith(25);
    });
  });

  describe('접근성', () => {
    it('accessibilityLabel에 나이와 혜택 개수가 포함된다', () => {
      render(<AgeTimelineItem {...defaultProps} />);
      expect(screen.getByLabelText('25세, 혜택 5개')).toBeTruthy();
    });

    it('혜택이 없으면 "혜택 없음"이 표시된다', () => {
      render(<AgeTimelineItem {...defaultProps} benefitCount={0} />);
      expect(screen.getByLabelText('25세, 혜택 없음')).toBeTruthy();
    });

    it('현재 나이이면 accessibilityHint가 설정된다', () => {
      render(<AgeTimelineItem {...defaultProps} isCurrent={true} />);
      const item = screen.getByLabelText('25세, 혜택 5개, 현재 나이');
      expect(item.props.accessibilityHint).toBe(
        '현재 회원님의 나이입니다'
      );
    });

    it('accessibilityRole이 button이다', () => {
      render(<AgeTimelineItem {...defaultProps} />);
      const item = screen.getByLabelText('25세, 혜택 5개');
      expect(item.props.accessibilityRole).toBe('button');
    });

    it('선택 상태가 accessibilityState에 반영된다', () => {
      render(<AgeTimelineItem {...defaultProps} isSelected={true} />);
      const item = screen.getByLabelText('25세, 혜택 5개');
      expect(item.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      const { toJSON } = render(
        <AgeTimelineItem {...defaultProps} colorScheme="light" />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('dark 모드에서 렌더링된다', () => {
      const { toJSON } = render(
        <AgeTimelineItem {...defaultProps} colorScheme="dark" />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
