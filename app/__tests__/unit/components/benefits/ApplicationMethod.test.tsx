/**
 * ApplicationMethod 컴포넌트 테스트
 * Story 3.7: 혜택 상세 화면
 */
import { render, screen } from '@testing-library/react-native';
import { ApplicationMethod } from '@/components/benefits/ApplicationMethod';

describe('ApplicationMethod', () => {
  describe('렌더링', () => {
    it('섹션 제목이 표시된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청 (복지로)"
          organization="서울시청 청년정책과"
          contactInfo="02-1234-5678"
        />
      );

      expect(screen.getByText('신청 방법')).toBeTruthy();
    });

    it('신청 방법이 표시된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청 (복지로)"
        />
      );

      expect(screen.getByText('온라인 신청 (복지로)')).toBeTruthy();
    });

    it('기관명이 표시된다', () => {
      render(
        <ApplicationMethod
          organization="서울시청 청년정책과"
        />
      );

      expect(screen.getByText('서울시청 청년정책과')).toBeTruthy();
    });

    it('연락처가 표시된다', () => {
      render(
        <ApplicationMethod
          contactInfo="02-1234-5678"
        />
      );

      expect(screen.getByText('02-1234-5678')).toBeTruthy();
    });

    it('모든 정보가 함께 표시된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청 (복지로)"
          organization="서울시청 청년정책과"
          contactInfo="02-1234-5678"
        />
      );

      expect(screen.getByText('신청 방법')).toBeTruthy();
      expect(screen.getByText('온라인 신청 (복지로)')).toBeTruthy();
      expect(screen.getByText('서울시청 청년정책과')).toBeTruthy();
      expect(screen.getByText('02-1234-5678')).toBeTruthy();
    });
  });

  describe('빈 상태 처리', () => {
    it('모든 props가 없으면 null을 반환한다', () => {
      const { toJSON } = render(<ApplicationMethod />);

      expect(toJSON()).toBeNull();
    });

    it('applicationMethod만 없으면 다른 정보는 표시된다', () => {
      render(
        <ApplicationMethod
          organization="서울시청 청년정책과"
          contactInfo="02-1234-5678"
        />
      );

      expect(screen.getByText('신청 방법')).toBeTruthy();
      expect(screen.getByText('서울시청 청년정책과')).toBeTruthy();
      expect(screen.getByText('02-1234-5678')).toBeTruthy();
    });
  });

  describe('접근성', () => {
    it('전체 컴포넌트에 접근성 라벨이 있다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청 (복지로)"
          organization="서울시청 청년정책과"
          contactInfo="02-1234-5678"
        />
      );

      expect(
        screen.getByLabelText(/신청 방법/)
      ).toBeTruthy();
    });

    it('신청 방법 정보가 접근성 라벨에 포함된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청 (복지로)"
        />
      );

      expect(
        screen.getByLabelText(/온라인 신청/)
      ).toBeTruthy();
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청"
          colorScheme="light"
        />
      );

      expect(screen.getByText('신청 방법')).toBeTruthy();
    });

    it('dark 모드에서 렌더링된다', () => {
      render(
        <ApplicationMethod
          applicationMethod="온라인 신청"
          colorScheme="dark"
        />
      );

      expect(screen.getByText('신청 방법')).toBeTruthy();
    });
  });
});
