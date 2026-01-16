/**
 * SearchBar 컴포넌트 테스트
 * Story 3.6: 검색 기능
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/search';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('검색 입력 필드를 렌더링한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByPlaceholderText('혜택 검색...')).toBeTruthy();
    });

    it('커스텀 플레이스홀더를 표시한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value=""
          onChangeText={mockOnChangeText}
          placeholder="검색어를 입력하세요"
        />
      );

      expect(getByPlaceholderText('검색어를 입력하세요')).toBeTruthy();
    });

    it('입력된 값을 표시한다', () => {
      const { getByDisplayValue } = render(
        <SearchBar value="취업" onChangeText={mockOnChangeText} />
      );

      expect(getByDisplayValue('취업')).toBeTruthy();
    });
  });

  describe('입력 이벤트', () => {
    it('텍스트 입력 시 onChangeText를 호출한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      fireEvent.changeText(getByPlaceholderText('혜택 검색...'), '청년');

      expect(mockOnChangeText).toHaveBeenCalledWith('청년');
    });

    it('Enter 키 입력 시 onSubmit을 호출한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value="검색어"
          onChangeText={mockOnChangeText}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent(getByPlaceholderText('혜택 검색...'), 'submitEditing');

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('포커스 시 onFocus를 호출한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value=""
          onChangeText={mockOnChangeText}
          onFocus={mockOnFocus}
        />
      );

      fireEvent(getByPlaceholderText('혜택 검색...'), 'focus');

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('블러 시 onBlur를 호출한다', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value=""
          onChangeText={mockOnChangeText}
          onBlur={mockOnBlur}
        />
      );

      fireEvent(getByPlaceholderText('혜택 검색...'), 'blur');

      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('Clear 버튼', () => {
    it('입력값이 없으면 Clear 버튼이 보이지 않는다', () => {
      const { queryByLabelText } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(queryByLabelText('검색어 지우기')).toBeNull();
    });

    it('입력값이 있으면 Clear 버튼이 보인다', () => {
      const { getByLabelText } = render(
        <SearchBar value="검색어" onChangeText={mockOnChangeText} />
      );

      expect(getByLabelText('검색어 지우기')).toBeTruthy();
    });

    it('Clear 버튼 클릭 시 빈 문자열로 onChangeText를 호출한다', () => {
      const { getByLabelText } = render(
        <SearchBar value="검색어" onChangeText={mockOnChangeText} />
      );

      fireEvent.press(getByLabelText('검색어 지우기'));

      expect(mockOnChangeText).toHaveBeenCalledWith('');
    });
  });

  describe('접근성', () => {
    it('검색 입력 필드에 accessibilityLabel이 있다', () => {
      const { getByLabelText } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByLabelText('혜택 검색')).toBeTruthy();
    });

    it('검색 입력 필드에 accessibilityRole이 search이다', () => {
      const { getByRole } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByRole('search')).toBeTruthy();
    });

    it('Clear 버튼에 accessibilityRole이 button이다', () => {
      const { getByLabelText } = render(
        <SearchBar value="검색어" onChangeText={mockOnChangeText} />
      );

      const clearButton = getByLabelText('검색어 지우기');
      expect(clearButton.props.accessibilityRole).toBe('button');
    });
  });
});
