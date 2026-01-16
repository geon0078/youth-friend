/**
 * CategoryFilter 컴포넌트 테스트
 * Story 3.5: 카테고리 필터 구현
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryFilter } from '@/components/benefits';
import { useFilterStore } from '@/stores/filter-store';

// 스토어 직접 접근 헬퍼
const getStoreState = () => useFilterStore.getState();

// 각 테스트 전 스토어 초기화
beforeEach(() => {
  useFilterStore.getState().resetFilter();
});

describe('CategoryFilter', () => {
  describe('렌더링 (AC1)', () => {
    it('모든 카테고리 칩을 렌더링한다', () => {
      const { getByText } = render(<CategoryFilter />);

      expect(getByText('전체')).toBeTruthy();
      expect(getByText('취업')).toBeTruthy();
      expect(getByText('주거')).toBeTruthy();
      expect(getByText('교육')).toBeTruthy();
      expect(getByText('복지')).toBeTruthy();
      expect(getByText('금융')).toBeTruthy();
      expect(getByText('문화')).toBeTruthy();
    });

    it('초기 상태에서 "전체" 칩이 선택된다', () => {
      const { getByLabelText } = render(<CategoryFilter />);
      const allChip = getByLabelText('전체 필터, 선택됨');

      // 초기 상태에서 categories가 비어있으므로 "전체"가 선택됨
      expect(allChip.props.accessibilityState?.checked).toBe(true);
    });
  });

  describe('카테고리 토글 (AC2)', () => {
    it('카테고리 칩을 누르면 해당 카테고리가 선택된다', () => {
      const { getByLabelText } = render(<CategoryFilter />);

      const employmentChip = getByLabelText('취업 필터');
      fireEvent.press(employmentChip);

      expect(getStoreState().filter.categories).toContain('employment');
    });

    it('선택된 카테고리를 다시 누르면 선택이 해제된다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      // 첫 번째 클릭 - 선택
      fireEvent.press(getByLabelText('취업 필터'));
      expect(getStoreState().filter.categories).toContain('employment');

      // 컴포넌트 리렌더링 후 선택된 상태로 다시 클릭
      rerender(<CategoryFilter />);
      fireEvent.press(getByLabelText('취업 필터, 선택됨'));
      expect(getStoreState().filter.categories).not.toContain('employment');
    });

    it('여러 카테고리를 동시에 선택할 수 있다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      fireEvent.press(getByLabelText('취업 필터'));
      rerender(<CategoryFilter />);
      fireEvent.press(getByLabelText('주거 필터'));
      rerender(<CategoryFilter />);
      fireEvent.press(getByLabelText('교육 필터'));

      expect(getStoreState().filter.categories).toHaveLength(3);
      expect(getStoreState().filter.categories).toContain('employment');
      expect(getStoreState().filter.categories).toContain('housing');
      expect(getStoreState().filter.categories).toContain('education');
    });
  });

  describe('선택 상태 표시 (AC4)', () => {
    it('선택된 카테고리는 checked 상태가 true이다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      getStoreState().toggleCategory('employment');

      rerender(<CategoryFilter />);

      const employmentChip = getByLabelText('취업 필터, 선택됨');
      expect(employmentChip.props.accessibilityState?.checked).toBe(true);
    });

    it('선택되지 않은 카테고리는 checked 상태가 false이다', () => {
      const { getByLabelText } = render(<CategoryFilter />);

      const housingChip = getByLabelText('주거 필터');
      expect(housingChip.props.accessibilityState?.checked).toBe(false);
    });

    it('카테고리 선택 시 "전체" 칩은 선택 해제된다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      getStoreState().toggleCategory('employment');

      rerender(<CategoryFilter />);

      const allChip = getByLabelText('전체 필터');
      expect(allChip.props.accessibilityState?.checked).toBe(false);
    });
  });

  describe('필터 초기화 (AC5)', () => {
    it('"전체" 칩을 누르면 모든 필터가 초기화된다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      // 먼저 카테고리 선택
      getStoreState().toggleCategory('employment');
      getStoreState().toggleCategory('housing');
      expect(getStoreState().filter.categories).toHaveLength(2);

      // 리렌더링 후 "전체" 클릭으로 초기화
      rerender(<CategoryFilter />);
      const allChip = getByLabelText('전체 필터');
      fireEvent.press(allChip);

      expect(getStoreState().filter.categories).toHaveLength(0);
    });
  });

  describe('접근성', () => {
    it('모든 칩에 checkbox 역할이 있다', () => {
      const { getAllByRole } = render(<CategoryFilter />);

      const checkboxes = getAllByRole('checkbox');
      // 전체 + 6개 카테고리 = 7개
      expect(checkboxes.length).toBe(7);
    });

    it('선택된 칩에 accessibilityLabel이 ", 선택됨"을 포함한다', () => {
      const { getByLabelText, rerender } = render(<CategoryFilter />);

      getStoreState().toggleCategory('employment');

      rerender(<CategoryFilter />);

      // 선택된 칩은 ", 선택됨"이 포함된 라벨로 찾을 수 있다
      const employmentChip = getByLabelText('취업 필터, 선택됨');
      expect(employmentChip).toBeTruthy();
    });

    it('선택되지 않은 칩에는 ", 선택됨"이 없다', () => {
      const { getByLabelText, queryByLabelText } = render(<CategoryFilter />);

      // 선택되지 않은 칩은 "필터"로만 끝나는 라벨
      const housingChip = getByLabelText('주거 필터');
      expect(housingChip).toBeTruthy();

      // ", 선택됨"이 포함된 라벨은 없어야 함
      expect(queryByLabelText('주거 필터, 선택됨')).toBeNull();
    });
  });
});
