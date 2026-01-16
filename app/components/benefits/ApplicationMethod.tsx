/**
 * 신청 방법 컴포넌트
 * - 신청 방법 텍스트 표시
 * - 신청처(기관명) 표시
 * - 연락처 정보 표시
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ApplicationMethodProps {
  /** 신청 방법 */
  applicationMethod?: string;
  /** 신청처/기관명 */
  organization?: string;
  /** 담당 기관 연락처 */
  contactInfo?: string;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 신청 방법
 * 혜택 신청 방법, 담당 기관, 연락처 정보를 표시
 *
 * @example
 * ```tsx
 * <ApplicationMethod
 *   applicationMethod="온라인 신청 (복지로)"
 *   organization="서울시청 청년정책과"
 *   contactInfo="02-1234-5678"
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function ApplicationMethod({
  applicationMethod,
  organization,
  contactInfo,
  colorScheme,
}: ApplicationMethodProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 표시할 내용이 없으면 렌더링하지 않음
  if (!applicationMethod && !organization && !contactInfo) {
    return null;
  }

  const accessibilityLabel = [
    '신청 방법',
    applicationMethod && `신청 방법: ${applicationMethod}`,
    organization && `담당 기관: ${organization}`,
    contactInfo && `연락처: ${contactInfo}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View
      style={[styles.container, { backgroundColor: surfaceColor }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.headerRow}>
        <IconSymbol
          name="doc.text.fill"
          size={18}
          color={Palette.primary}
        />
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          신청 방법
        </Text>
      </View>

      <View style={styles.content}>
        {/* 신청 방법 */}
        {applicationMethod && (
          <Text style={[styles.methodText, { color: textColor }]}>
            {applicationMethod}
          </Text>
        )}

        {/* 담당 기관 */}
        {organization && (
          <View style={styles.infoRow}>
            <IconSymbol
              name="building.2.fill"
              size={14}
              color={mutedTextColor}
            />
            <Text style={[styles.infoText, { color: mutedTextColor }]}>
              {organization}
            </Text>
          </View>
        )}

        {/* 연락처 */}
        {contactInfo && (
          <View style={styles.infoRow}>
            <IconSymbol
              name="phone.fill"
              size={14}
              color={mutedTextColor}
            />
            <Text style={[styles.infoText, { color: mutedTextColor }]}>
              {contactInfo}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  content: {
    gap: Spacing.sm,
  },
  methodText: {
    ...Typography.body,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  infoText: {
    ...Typography.label,
    flex: 1,
  },
});
