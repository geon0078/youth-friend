/**
 * ApplicationPeriod 컴포넌트 테스트
 * Story 3.7: 혜택 상세 화면
 */
import { render, screen } from '@testing-library/react-native';
import { ApplicationPeriod } from '@/components/benefits/ApplicationPeriod';

// 날짜 모킹
const mockToday = new Date('2026-01-16');
jest.useFakeTimers().setSystemTime(mockToday);

describe('ApplicationPeriod', () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  describe('기간 표시', () => {
    it('섹션 제목이 표시된다', () => {
      render(
        <ApplicationPeriod
          startDate="2026-01-01"
          deadline="2026-03-31"
        />
      );

      expect(screen.getByText('신청 기간')).toBeTruthy();
    });

    it('시작일과 종료일이 표시된다', () => {
      render(
        <ApplicationPeriod
          startDate="2026-01-01"
          deadline="2026-03-31"
        />
      );

      expect(screen.getByText('1월 1일 ~ 3월 31일')).toBeTruthy();
    });

    it('시작일만 있을 때 종료일은 상시로 표시된다', () => {
      render(<ApplicationPeriod startDate="2026-01-01" />);

      expect(screen.getByText('1월 1일 ~ 상시')).toBeTruthy();
    });

    it('종료일만 있을 때 시작일은 상시로 표시된다', () => {
      render(<ApplicationPeriod deadline="2026-03-31" />);

      expect(screen.getByText('상시 ~ 3월 31일')).toBeTruthy();
    });
  });

  describe('마감 상태', () => {
    it('마감이 임박하면 힌트 메시지가 표시된다', () => {
      // 7일 이내
      render(<ApplicationPeriod deadline="2026-01-20" />);

      expect(screen.getByText('마감이 임박했습니다. 서둘러 신청하세요!')).toBeTruthy();
    });

    it('마감된 경우 마감 메시지가 표시된다', () => {
      render(<ApplicationPeriod deadline="2026-01-10" />);

      expect(screen.getByText('신청이 마감되었습니다')).toBeTruthy();
    });

    it('마감일이 충분히 남았으면 긴급 힌트가 표시되지 않는다', () => {
      render(<ApplicationPeriod deadline="2026-03-31" />);

      expect(
        screen.queryByText('마감이 임박했습니다. 서둘러 신청하세요!')
      ).toBeNull();
    });
  });

  describe('접근성', () => {
    it('신청 기간에 접근성 라벨이 있다', () => {
      render(
        <ApplicationPeriod
          startDate="2026-01-01"
          deadline="2026-03-31"
        />
      );

      expect(
        screen.getByLabelText(/신청 기간:/)
      ).toBeTruthy();
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      render(
        <ApplicationPeriod
          deadline="2026-03-31"
          colorScheme="light"
        />
      );

      expect(screen.getByText('신청 기간')).toBeTruthy();
    });

    it('dark 모드에서 렌더링된다', () => {
      render(
        <ApplicationPeriod
          deadline="2026-03-31"
          colorScheme="dark"
        />
      );

      expect(screen.getByText('신청 기간')).toBeTruthy();
    });
  });
});
