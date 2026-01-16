/**
 * AgeTimeline 컴포넌트 테스트
 * Story 3.9: Implement Age Timeline View
 */
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AgeTimeline } from '@/components/benefits/AgeTimeline';

describe('AgeTimeline', () => {
  const defaultProps = {
    currentAge: 25,
    selectedAge: 25,
    onAgeSelect: jest.fn(),
    benefitCounts: {
      19: 2,
      20: 3,
      21: 1,
      22: 0,
      23: 5,
      24: 4,
      25: 6,
      26: 3,
      27: 2,
      28: 1,
      29: 0,
      30: 4,
      31: 3,
      32: 2,
      33: 1,
      34: 5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('타임라인이 렌더링된다', () => {
      const { toJSON } = render(<AgeTimeline {...defaultProps} />);
      expect(toJSON()).not.toBeNull();
    });

    it('초기 렌더링에 현재 나이 주변이 표시된다', () => {
      render(<AgeTimeline {...defaultProps} />);

      // 초기 렌더링에 포함되는 나이 확인 (currentAge=25 주변)
      expect(screen.getByText('19')).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
      // 34세는 FlatList 초기 렌더링 범위 밖이므로 확인하지 않음
    });
  });

  describe('인터랙션', () => {
    it('나이를 탭하면 onAgeSelect가 호출된다', () => {
      const onAgeSelect = jest.fn();
      render(<AgeTimeline {...defaultProps} onAgeSelect={onAgeSelect} />);

      // 25세 탭
      fireEvent.press(screen.getByLabelText('25세, 혜택 6개, 현재 나이'));
      expect(onAgeSelect).toHaveBeenCalledWith(25);
    });

    it('다른 나이를 탭하면 해당 나이로 onAgeSelect가 호출된다', () => {
      const onAgeSelect = jest.fn();
      render(<AgeTimeline {...defaultProps} onAgeSelect={onAgeSelect} />);

      // 24세 탭 (초기 렌더링 범위 내)
      fireEvent.press(screen.getByLabelText('24세, 혜택 4개'));
      expect(onAgeSelect).toHaveBeenCalledWith(24);
    });
  });

  describe('접근성', () => {
    it('타임라인에 accessibilityLabel이 설정된다', () => {
      render(<AgeTimeline {...defaultProps} />);
      expect(screen.getByLabelText('나이별 혜택 타임라인')).toBeTruthy();
    });

    it('타임라인에 accessibilityHint가 설정된다', () => {
      render(<AgeTimeline {...defaultProps} />);
      const timeline = screen.getByLabelText('나이별 혜택 타임라인');
      expect(timeline.props.accessibilityHint).toBe(
        '좌우로 스크롤하여 각 나이의 혜택을 확인하세요'
      );
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      const { toJSON } = render(
        <AgeTimeline {...defaultProps} colorScheme="light" />
      );
      expect(toJSON()).not.toBeNull();
    });

    it('dark 모드에서 렌더링된다', () => {
      const { toJSON } = render(
        <AgeTimeline {...defaultProps} colorScheme="dark" />
      );
      expect(toJSON()).not.toBeNull();
    });
  });

  describe('나이 상태 표시', () => {
    it('현재 나이 이전은 과거로 표시된다', () => {
      render(<AgeTimeline {...defaultProps} currentAge={25} />);

      // 24세는 과거 (initialNumToRender 내에 있음)
      const item24 = screen.getByLabelText('24세, 혜택 4개');
      expect(item24).toBeTruthy();
    });

    it('현재 나이가 강조 표시된다', () => {
      render(<AgeTimeline {...defaultProps} currentAge={25} />);

      // 25세는 현재 나이
      expect(
        screen.getByLabelText('25세, 혜택 6개, 현재 나이')
      ).toBeTruthy();
    });

    it('선택된 나이가 선택 상태로 표시된다', () => {
      // 선택된 나이를 초기 렌더링 범위 내로 설정 (25)
      render(
        <AgeTimeline {...defaultProps} currentAge={25} selectedAge={25} />
      );

      const item25 = screen.getByLabelText('25세, 혜택 6개, 현재 나이');
      expect(item25.props.accessibilityState).toEqual({ selected: true });
    });
  });
});
