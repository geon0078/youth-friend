/**
 * 필요 서류 목록 컴포넌트
 * Story 5.2: Implement Document List Display
 *
 * 혜택 신청에 필요한 서류 목록을 표시
 */
import { View, Text, StyleSheet, Pressable, Linking, type ColorSchemeName } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { RequiredDocument } from '@/types/models/application';
import { ISSUANCE_METHOD_LABELS } from '@/types/models/application';

interface DocumentListProps {
  /** 서류 목록 */
  documents: RequiredDocument[];
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 개별 서류 아이템 컴포넌트
 */
function DocumentItem({
  document,
  colorScheme,
}: {
  document: RequiredDocument;
  colorScheme?: ColorSchemeName;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const handleOpenLink = async () => {
    if (document.issuanceUrl) {
      const canOpen = await Linking.canOpenURL(document.issuanceUrl);
      if (canOpen) {
        await Linking.openURL(document.issuanceUrl);
      }
    }
  };

  const isOnlineAvailable =
    document.issuanceMethod === 'online' || document.issuanceMethod === 'both';

  return (
    <View
      style={[styles.documentItem, { backgroundColor: surfaceColor }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${document.name}, ${document.issuer}에서 발급, ${
        document.required ? '필수 서류' : '선택 서류'
      }`}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <IconSymbol
            name="doc.fill"
            size={20}
            color={document.required ? Palette.primary : mutedTextColor}
          />
        </View>
        <View style={styles.documentInfo}>
          <View style={styles.documentTitleRow}>
            <Text style={[styles.documentName, { color: textColor }]}>
              {document.name}
            </Text>
            {document.required && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>필수</Text>
              </View>
            )}
          </View>
          <Text style={[styles.documentIssuer, { color: mutedTextColor }]}>
            {document.issuer}
          </Text>
        </View>
      </View>

      <View style={styles.documentDetails}>
        <View style={styles.issuanceMethod}>
          <IconSymbol
            name={isOnlineAvailable ? 'globe' : 'building.2.fill'}
            size={14}
            color={mutedTextColor}
          />
          <Text style={[styles.issuanceMethodText, { color: mutedTextColor }]}>
            {ISSUANCE_METHOD_LABELS[document.issuanceMethod]}
          </Text>
        </View>

        {document.validityDays && (
          <View style={styles.validity}>
            <IconSymbol
              name="clock.fill"
              size={14}
              color={mutedTextColor}
            />
            <Text style={[styles.validityText, { color: mutedTextColor }]}>
              유효기간 {document.validityDays}일
            </Text>
          </View>
        )}
      </View>

      {document.issuanceDescription && (
        <Text style={[styles.description, { color: mutedTextColor }]}>
          {document.issuanceDescription}
        </Text>
      )}

      {document.issuanceUrl && (
        <Pressable
          onPress={handleOpenLink}
          style={({ pressed }) => [
            styles.linkButton,
            pressed && styles.linkButtonPressed,
          ]}
          accessibilityRole="link"
          accessibilityLabel={`${document.issuer} 발급 사이트로 이동`}
        >
          <IconSymbol name="arrow.up.right.square" size={16} color={Palette.primary} />
          <Text style={styles.linkButtonText}>온라인 발급 사이트</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * 필요 서류 목록
 *
 * @example
 * ```tsx
 * <DocumentList
 *   documents={[
 *     { id: '1', name: '주민등록등본', issuer: '정부24', ... },
 *   ]}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function DocumentList({
  documents,
  colorScheme,
  testID = 'document-list',
}: DocumentListProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 서류가 없는 경우
  if (documents.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: surfaceColor }]}
        testID={testID}
        accessible={true}
        accessibilityLabel="필요 서류 없음"
      >
        <View style={styles.header}>
          <IconSymbol name="doc.text.fill" size={20} color={textColor} />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            필요 서류
          </Text>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={32}
            color={Palette.success}
          />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            별도 서류 없음
          </Text>
          <Text style={[styles.emptyDescription, { color: mutedTextColor }]}>
            이 혜택은 별도의 서류 제출 없이{'\n'}신청할 수 있습니다
          </Text>
        </View>
      </View>
    );
  }

  const requiredCount = documents.filter((d) => d.required).length;
  const optionalCount = documents.length - requiredCount;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <IconSymbol name="doc.text.fill" size={20} color={textColor} />
        <Text style={[styles.headerTitle, { color: textColor }]}>
          필요 서류
        </Text>
        <Text style={[styles.headerCount, { color: mutedTextColor }]}>
          {requiredCount > 0 && `필수 ${requiredCount}개`}
          {requiredCount > 0 && optionalCount > 0 && ' · '}
          {optionalCount > 0 && `선택 ${optionalCount}개`}
        </Text>
      </View>

      <View style={styles.documentList}>
        {documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            colorScheme={colorScheme}
          />
        ))}
      </View>

      <View style={[styles.tipContainer, { backgroundColor: Palette.infoBackground }]}>
        <IconSymbol name="lightbulb.fill" size={16} color={Palette.info} />
        <Text style={[styles.tipText, { color: Palette.info }]}>
          서류는 신청일 기준 유효한 것으로 준비해주세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.labelBold,
    flex: 1,
  },
  headerCount: {
    ...Typography.caption,
  },
  documentList: {
    gap: Spacing.sm,
  },
  documentItem: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  documentIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Palette.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    gap: 2,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  documentName: {
    ...Typography.labelBold,
  },
  requiredBadge: {
    backgroundColor: Palette.errorBackground,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  requiredText: {
    ...Typography.caption,
    fontSize: 10,
    color: Palette.error,
  },
  documentIssuer: {
    ...Typography.caption,
  },
  documentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginLeft: 44,
  },
  issuanceMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  issuanceMethodText: {
    ...Typography.caption,
  },
  validity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validityText: {
    ...Typography.caption,
  },
  description: {
    ...Typography.caption,
    marginLeft: 44,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 44,
    paddingVertical: Spacing.xs,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkButtonText: {
    ...Typography.caption,
    color: Palette.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.labelBold,
  },
  emptyDescription: {
    ...Typography.caption,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  tipText: {
    ...Typography.caption,
    flex: 1,
  },
});
