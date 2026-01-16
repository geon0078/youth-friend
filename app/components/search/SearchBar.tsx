/**
 * 검색바 컴포넌트
 * - 검색 입력 필드 (AC1)
 * - Clear 버튼
 * - 접근성 지원
 */
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';

interface SearchBarProps {
  /** 현재 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChangeText: (text: string) => void;
  /** 검색 실행 핸들러 (Enter 키) */
  onSubmit?: () => void;
  /** 포커스 핸들러 */
  onFocus?: () => void;
  /** 블러 핸들러 */
  onBlur?: () => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 검색바
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onSubmit={handleSearch}
 *   placeholder="혜택 검색..."
 * />
 * ```
 */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = '혜택 검색...',
  colorScheme,
}: SearchBarProps) {
  const backgroundColor = getSemanticColor(colorScheme, 'surface');
  const borderColor = getSemanticColor(colorScheme, 'border');
  const textColor = getSemanticColor(colorScheme, 'text');
  const placeholderColor = getSemanticColor(colorScheme, 'mutedText');
  const iconColor = getSemanticColor(colorScheme, 'mutedText');

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderColor },
      ]}
    >
      <IconSymbol
        name="magnifyingglass"
        size={18}
        color={iconColor}
      />
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="혜택 검색"
        accessibilityRole="search"
        accessibilityHint="혜택 제목, 설명, 기관명으로 검색할 수 있습니다"
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityLabel="검색어 지우기"
          accessibilityRole="button"
        >
          <IconSymbol
            name="xmark.circle.fill"
            size={18}
            color={iconColor}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    padding: 0,
  },
});
