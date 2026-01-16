/**
 * 신청하기 버튼 컴포넌트
 * Story 5.4: Implement Application Page Link
 *
 * 서류 준비 후 신청 페이지로 이동하는 CTA 버튼
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  type ColorSchemeName,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';

interface ApplyButtonProps {
  /** 신청 페이지 URL */
  applicationUrl?: string;
  /** 혜택명 */
  benefitTitle: string;
  /** 서류 준비 완료 여부 */
  isChecklistComplete?: boolean;
  /** 체크리스트 진행률 */
  checklistProgress?: number;
  /** 신청 완료 콜백 */
  onApplyComplete?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 체크리스트 미완료 경고 모달
 */
function IncompleteWarningModal({
  visible,
  onClose,
  onProceed,
  progress,
  colorScheme,
}: {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
  progress: number;
  colorScheme?: ColorSchemeName;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
          <View style={styles.modalIcon}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={40}
              color={Palette.warning}
            />
          </View>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            서류 준비가 완료되지 않았습니다
          </Text>
          <Text style={[styles.modalDescription, { color: mutedTextColor }]}>
            현재 {progress}%의 서류만 준비되었습니다.{'\n'}
            그래도 신청 페이지로 이동하시겠습니까?
          </Text>
          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={[styles.modalButton, styles.modalButtonSecondary]}
              accessibilityRole="button"
              accessibilityLabel="취소"
            >
              <Text style={[styles.modalButtonText, { color: mutedTextColor }]}>
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={onProceed}
              style={[styles.modalButton, styles.modalButtonPrimary]}
              accessibilityRole="button"
              accessibilityLabel="그래도 이동"
            >
              <Text style={[styles.modalButtonText, { color: Palette.textOnPrimary }]}>
                그래도 이동
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * 신청하기 버튼
 *
 * @example
 * ```tsx
 * <ApplyButton
 *   applicationUrl="https://apply.example.com"
 *   benefitTitle="청년 월세 지원"
 *   isChecklistComplete={isComplete}
 *   checklistProgress={progress}
 * />
 * ```
 */
export function ApplyButton({
  applicationUrl,
  benefitTitle,
  isChecklistComplete = false,
  checklistProgress = 0,
  onApplyComplete,
  colorScheme,
  testID = 'apply-button',
}: ApplyButtonProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  const hasUrl = !!applicationUrl;

  // 신청 페이지 열기
  const openApplicationPage = async () => {
    if (!applicationUrl) return;

    setIsOpening(true);
    try {
      // 인앱 브라우저로 열기
      const result = await WebBrowser.openBrowserAsync(applicationUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: Palette.primary,
        toolbarColor: Palette.surface,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // 신청 완료 여부 확인
        Alert.alert(
          '신청 완료 확인',
          '신청을 완료하셨나요?',
          [
            { text: '아니오', style: 'cancel' },
            {
              text: '예, 완료했습니다',
              onPress: onApplyComplete,
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      // 인앱 브라우저 실패 시 외부 브라우저로 열기
      try {
        const canOpen = await Linking.canOpenURL(applicationUrl);
        if (canOpen) {
          await Linking.openURL(applicationUrl);
        } else {
          Alert.alert(
            '링크 열기 실패',
            '신청 페이지를 열 수 없습니다. 나중에 다시 시도해주세요.',
            [{ text: '확인' }]
          );
        }
      } catch {
        Alert.alert(
          '오류',
          '신청 페이지를 열 수 없습니다.',
          [{ text: '확인' }]
        );
      }
    } finally {
      setIsOpening(false);
    }
  };

  // 버튼 클릭 핸들러
  const handlePress = () => {
    if (!hasUrl) return;

    // 체크리스트 미완료 시 경고
    if (!isChecklistComplete && checklistProgress < 100) {
      setShowWarning(true);
      return;
    }

    openApplicationPage();
  };

  // 경고 무시하고 진행
  const handleProceedAnyway = () => {
    setShowWarning(false);
    openApplicationPage();
  };

  // URL이 없는 경우
  if (!hasUrl) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={[styles.disabledButton, { backgroundColor: Palette.border }]}>
          <IconSymbol name="link.badge.plus" size={20} color={mutedTextColor} />
          <Text style={[styles.buttonText, { color: mutedTextColor }]}>
            온라인 신청 불가
          </Text>
        </View>
        <Text style={[styles.helpText, { color: mutedTextColor }]}>
          이 혜택은 온라인 신청을 지원하지 않습니다.{'\n'}
          담당 기관에 직접 문의해주세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* 준비 상태 안내 */}
      {!isChecklistComplete && checklistProgress > 0 && (
        <View style={styles.statusBanner}>
          <IconSymbol
            name="doc.text.magnifyingglass"
            size={16}
            color={Palette.warning}
          />
          <Text style={styles.statusText}>
            서류 {checklistProgress}% 준비 완료
          </Text>
        </View>
      )}

      {isChecklistComplete && (
        <View style={[styles.statusBanner, styles.statusBannerComplete]}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={16}
            color={Palette.success}
          />
          <Text style={[styles.statusText, { color: Palette.success }]}>
            서류 준비 완료! 신청하러 가세요
          </Text>
        </View>
      )}

      {/* 신청 버튼 */}
      <Pressable
        onPress={handlePress}
        disabled={isOpening}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isOpening && styles.buttonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${benefitTitle} 신청하기`}
        accessibilityHint="신청 페이지로 이동합니다"
      >
        <IconSymbol
          name={isOpening ? 'hourglass' : 'arrow.up.right.square.fill'}
          size={20}
          color={Palette.textOnPrimary}
        />
        <Text style={styles.buttonText}>
          {isOpening ? '페이지 여는 중...' : '신청하기'}
        </Text>
      </Pressable>

      {/* 안내 문구 */}
      <Text style={[styles.helpText, { color: mutedTextColor }]}>
        신청 페이지로 이동합니다. 신청 후 돌아와서 상태를 업데이트해주세요.
      </Text>

      {/* 경고 모달 */}
      <IncompleteWarningModal
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        onProceed={handleProceedAnyway}
        progress={checklistProgress}
        colorScheme={colorScheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.warningBackground,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  statusBannerComplete: {
    backgroundColor: Palette.successBackground,
  },
  statusText: {
    ...Typography.caption,
    color: Palette.warning,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  helpText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  modalIcon: {
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.heading,
    textAlign: 'center',
  },
  modalDescription: {
    ...Typography.body,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: Palette.border,
  },
  modalButtonPrimary: {
    backgroundColor: Palette.primary,
  },
  modalButtonText: {
    ...Typography.labelBold,
  },
});
