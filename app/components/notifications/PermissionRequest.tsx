/**
 * 알림 권한 요청 컴포넌트
 * Story 6.2: Implement Permission Request Flow
 *
 * 온보딩 완료 후 알림 권한 요청 화면
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { useNotificationPermission } from '@/hooks';

interface PermissionRequestProps {
  /** 권한 허용 후 콜백 */
  onComplete: (granted: boolean) => void;
  /** 건너뛰기 콜백 */
  onSkip?: () => void;
  /** 제목 (기본값: 알림 받기) */
  title?: string;
  /** 설명 (기본값 제공) */
  description?: string;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 알림 권한 요청 컴포넌트
 *
 * 손실 회피 프레이밍을 적용하여 사용자가 알림을 허용하도록 유도
 */
export function PermissionRequest({
  onComplete,
  onSkip,
  title = '알림 받기',
  description,
  testID = 'permission-request',
}: PermissionRequestProps) {
  const colorScheme = useColorScheme();
  const { status, request } = useNotificationPermission();
  const [isLoading, setIsLoading] = useState(false);

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const defaultDescription =
    '마감 임박 혜택, 새로운 혜택 소식을 받아보세요.\n놓치면 아까운 기회를 알림으로 알려드립니다.';

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      const granted = await request();
      onComplete(granted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete(false);
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // 이미 거부된 경우 설정으로 안내
  if (status === 'denied') {
    return (
      <View style={[styles.container, { backgroundColor: surfaceColor }]} testID={testID}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: Palette.warningBackground }]}>
            <IconSymbol
              name="bell.slash.fill"
              size={48}
              color={Palette.warning}
            />
          </View>
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          알림이 꺼져 있어요
        </Text>

        <Text style={[styles.description, { color: mutedTextColor }]}>
          마감 임박 혜택을 놓치지 않으려면{'\n'}
          설정에서 알림을 허용해주세요.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleOpenSettings}
            style={[styles.button, styles.primaryButton]}
            accessibilityRole="button"
            accessibilityLabel="설정 열기"
          >
            <IconSymbol name="gearshape" size={20} color={Palette.textOnPrimary} />
            <Text style={styles.primaryButtonText}>설정 열기</Text>
          </Pressable>

          {onSkip && (
            <Pressable
              onPress={handleSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="나중에 하기"
            >
              <Text style={[styles.skipButtonText, { color: mutedTextColor }]}>
                나중에
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]} testID={testID}>
      {/* 아이콘 */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: Palette.primaryBackground }]}>
          <IconSymbol
            name="bell.badge.fill"
            size={48}
            color={Palette.primary}
          />
        </View>
      </View>

      {/* 제목 */}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>

      {/* 설명 */}
      <Text style={[styles.description, { color: mutedTextColor }]}>
        {description || defaultDescription}
      </Text>

      {/* 혜택 목록 */}
      <View style={styles.benefitsList}>
        <BenefitItem
          icon="clock.badge.exclamationmark"
          text="마감 임박 혜택 알림"
          colorScheme={colorScheme}
        />
        <BenefitItem
          icon="star.fill"
          text="새로운 혜택 소식"
          colorScheme={colorScheme}
        />
        <BenefitItem
          icon="checkmark.circle.fill"
          text="신청 결과 알림"
          colorScheme={colorScheme}
        />
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleAllow}
          style={[styles.button, styles.primaryButton]}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="알림 받기"
        >
          {isLoading ? (
            <Text style={styles.primaryButtonText}>확인 중...</Text>
          ) : (
            <>
              <IconSymbol name="bell.fill" size={20} color={Palette.textOnPrimary} />
              <Text style={styles.primaryButtonText}>알림 받기</Text>
            </>
          )}
        </Pressable>

        {onSkip && (
          <Pressable
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="나중에 하기"
          >
            <Text style={[styles.skipButtonText, { color: mutedTextColor }]}>
              나중에
            </Text>
          </Pressable>
        )}
      </View>

      {/* 안내 문구 */}
      <Text style={[styles.disclaimer, { color: mutedTextColor }]}>
        설정에서 언제든지 변경할 수 있어요
      </Text>
    </View>
  );
}

/**
 * 혜택 아이템 컴포넌트
 */
function BenefitItem({
  icon,
  text,
  colorScheme,
}: {
  icon: string;
  text: string;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');

  return (
    <View style={styles.benefitItem}>
      <View style={[styles.benefitIcon, { backgroundColor: Palette.successBackground }]}>
        <IconSymbol name={icon as any} size={16} color={Palette.success} />
      </View>
      <Text style={[styles.benefitText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  benefitsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...Typography.body,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
  },
  primaryButtonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
    fontSize: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    ...Typography.label,
  },
  disclaimer: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
