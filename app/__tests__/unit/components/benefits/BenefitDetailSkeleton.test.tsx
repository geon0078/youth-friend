/**
 * BenefitDetailSkeleton 컴포넌트 테스트
 * Story 3.7: 혜택 상세 화면
 */
import { render, screen } from '@testing-library/react-native';
import { BenefitDetailSkeleton } from '@/components/benefits/BenefitDetailSkeleton';

describe('BenefitDetailSkeleton', () => {
  describe('렌더링', () => {
    it('스켈레톤 컴포넌트가 렌더링된다', () => {
      const { toJSON } = render(<BenefitDetailSkeleton />);

      expect(toJSON()).not.toBeNull();
    });

    it('여러 섹션 스켈레톤이 렌더링된다', () => {
      const { toJSON } = render(<BenefitDetailSkeleton />);
      const json = toJSON();

      // 컨테이너가 존재하는지 확인
      expect(json).toBeTruthy();
      // 자식 요소들이 있는지 확인 (여러 섹션)
      if (json && 'children' in json) {
        expect(json.children?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('접근성', () => {
    it('로딩 중 접근성 라벨이 있다', () => {
      render(<BenefitDetailSkeleton />);

      expect(
        screen.getByLabelText('혜택 상세 정보 로딩 중')
      ).toBeTruthy();
    });

    it('progressbar 접근성 역할이 있다', () => {
      render(<BenefitDetailSkeleton />);

      // accessibilityRole="progressbar"가 설정된 요소 확인
      const skeleton = screen.getByLabelText('혜택 상세 정보 로딩 중');
      expect(skeleton.props.accessibilityRole).toBe('progressbar');
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      const { toJSON } = render(<BenefitDetailSkeleton colorScheme="light" />);

      expect(toJSON()).not.toBeNull();
    });

    it('dark 모드에서 렌더링된다', () => {
      const { toJSON } = render(<BenefitDetailSkeleton colorScheme="dark" />);

      expect(toJSON()).not.toBeNull();
    });
  });
});
