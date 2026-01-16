/**
 * RequirementsList 컴포넌트 테스트
 * Story 3.7: 혜택 상세 화면
 */
import { render, screen } from '@testing-library/react-native';
import { RequirementsList } from '@/components/benefits/RequirementsList';

describe('RequirementsList', () => {
  const mockRequirements = [
    '만 19~34세 청년',
    '서울시 거주자',
    '소득 기준 충족',
  ];

  describe('렌더링', () => {
    it('섹션 제목이 표시된다', () => {
      render(<RequirementsList requirements={mockRequirements} />);

      expect(screen.getByText('자격 요건')).toBeTruthy();
    });

    it('모든 요건 항목이 표시된다', () => {
      render(<RequirementsList requirements={mockRequirements} />);

      mockRequirements.forEach((requirement) => {
        expect(screen.getByText(requirement)).toBeTruthy();
      });
    });

    it('요건이 없을 때 빈 상태 메시지가 표시된다', () => {
      render(<RequirementsList requirements={[]} />);

      expect(
        screen.getByText('자격 요건 정보가 없습니다. 상세 페이지에서 확인해주세요.')
      ).toBeTruthy();
    });
  });

  describe('접근성', () => {
    it('요건 목록에 접근성 라벨이 있다', () => {
      render(<RequirementsList requirements={mockRequirements} />);

      expect(
        screen.getByLabelText(`자격 요건 ${mockRequirements.length}개`)
      ).toBeTruthy();
    });

    it('각 요건 항목에 접근성 라벨이 있다', () => {
      render(<RequirementsList requirements={mockRequirements} />);

      mockRequirements.forEach((requirement, index) => {
        expect(
          screen.getByLabelText(`요건 ${index + 1}: ${requirement}`)
        ).toBeTruthy();
      });
    });

    it('빈 상태에 접근성 라벨이 있다', () => {
      render(<RequirementsList requirements={[]} />);

      expect(
        screen.getByLabelText('자격 요건 정보가 없습니다')
      ).toBeTruthy();
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      render(
        <RequirementsList
          requirements={mockRequirements}
          colorScheme="light"
        />
      );

      expect(screen.getByText('자격 요건')).toBeTruthy();
    });

    it('dark 모드에서 렌더링된다', () => {
      render(
        <RequirementsList
          requirements={mockRequirements}
          colorScheme="dark"
        />
      );

      expect(screen.getByText('자격 요건')).toBeTruthy();
    });
  });
});
