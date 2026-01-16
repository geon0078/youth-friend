/**
 * 저장된 신청 화면
 * Story 5.6: Implement Saved Applications Screen
 *
 * 진행 중인 신청 목록을 관리
 */
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSavedApplications } from '@/hooks';
import { SavedApplicationCard, StatusUpdateModal } from '@/components/application';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { SavedApplication, ApplicationStatus } from '@/types/models/application';
import { APPLICATION_STATUS_LABELS } from '@/types/models/application';

/**
 * 상태 필터 칩
 */
function StatusFilterChip({
  status,
  label,
  count,
  isActive,
  onPress,
  colorScheme,
}: {
  status: ApplicationStatus | 'all';
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        isActive && styles.filterChipActive,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isActive ? Palette.textOnPrimary : textColor },
        ]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.filterChipBadge,
            isActive && styles.filterChipBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipBadgeText,
              { color: isActive ? Palette.primary : mutedTextColor },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({ colorScheme }: { colorScheme: ReturnType<typeof useColorScheme> }) {
  const router = useRouter();
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <View style={styles.emptyState}>
      <IconSymbol
        name="doc.text.magnifyingglass"
        size={64}
        color={Palette.border}
      />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        저장된 신청이 없습니다
      </Text>
      <Text style={[styles.emptyDescription, { color: mutedTextColor }]}>
        혜택 상세 페이지에서 "나중에 하기"를 눌러{'\n'}
        신청을 저장하고 관리하세요
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/benefits' as Href)}
        style={styles.emptyButton}
        accessibilityRole="button"
      >
        <Text style={styles.emptyButtonText}>혜택 둘러보기</Text>
      </Pressable>
    </View>
  );
}

/**
 * 저장된 신청 화면
 */
export default function ApplicationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<SavedApplication | null>(null);

  const {
    applications,
    isLoading,
    countByStatus,
    removeApplication,
    updateStatus,
    refresh,
  } = useSavedApplications(
    statusFilter === 'all' ? undefined : { status: statusFilter }
  );

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const textColor = getSemanticColor(colorScheme, 'text');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 500);
  }, [refresh]);

  // 카드 탭 핸들러
  const handleCardPress = useCallback(
    (application: SavedApplication) => {
      router.push(`/benefit/${application.benefitId}` as Href);
    },
    [router]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(
    (application: SavedApplication) => {
      Alert.alert(
        '저장된 신청 삭제',
        `"${application.benefitTitle}" 신청을 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => removeApplication(application.id),
          },
        ]
      );
    },
    [removeApplication]
  );

  // 상태 변경 모달 열기
  const handleOpenStatusModal = useCallback(
    (application: SavedApplication) => {
      setSelectedApplication(application);
      setStatusModalVisible(true);
    },
    []
  );

  // 상태 변경 핸들러
  const handleStatusChange = useCallback(
    (status: ApplicationStatus, note?: string) => {
      if (selectedApplication) {
        updateStatus(selectedApplication.id, status, note);
      }
    },
    [selectedApplication, updateStatus]
  );

  // 전체 개수
  const totalCount = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  // 필터 옵션
  const filterOptions: { status: ApplicationStatus | 'all'; label: string }[] = [
    { status: 'all', label: '전체' },
    { status: 'preparing', label: '준비중' },
    { status: 'applied', label: '신청 완료' },
    { status: 'approved', label: '승인' },
    { status: 'rejected', label: '거부' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          저장된 신청
        </Text>
        {totalCount > 0 && (
          <Text style={[styles.headerCount, { color: Palette.primary }]}>
            {totalCount}개
          </Text>
        )}
      </View>

      {/* 필터 */}
      {totalCount > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            keyExtractor={(item) => item.status}
            renderItem={({ item }) => (
              <StatusFilterChip
                status={item.status}
                label={item.label}
                count={
                  item.status === 'all'
                    ? totalCount
                    : countByStatus[item.status as ApplicationStatus] || 0
                }
                isActive={statusFilter === item.status}
                onPress={() => setStatusFilter(item.status)}
                colorScheme={colorScheme}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      {/* 안내 문구 */}
      {totalCount > 0 && (
        <View style={styles.tipContainer}>
          <IconSymbol name="hand.tap" size={14} color={Palette.textMuted} />
          <Text style={[styles.tipText, { color: Palette.textMuted }]}>
            길게 눌러 상태 변경
          </Text>
        </View>
      )}

      {/* 목록 */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedApplicationCard
            application={item}
            onPress={handleCardPress}
            onDelete={handleDelete}
            onLongPress={() => handleOpenStatusModal(item)}
            colorScheme={colorScheme}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState colorScheme={colorScheme} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* 상태 변경 모달 */}
      {selectedApplication && (
        <StatusUpdateModal
          visible={statusModalVisible}
          currentStatus={selectedApplication.status}
          onStatusChange={handleStatusChange}
          onClose={() => {
            setStatusModalVisible(false);
            setSelectedApplication(null);
          }}
          colorScheme={colorScheme}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerTitle: {
    ...Typography.sectionTitle,
  },
  headerCount: {
    ...Typography.labelBold,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Palette.background,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Palette.primary,
  },
  filterChipText: {
    ...Typography.caption,
  },
  filterChipBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterChipBadgeActive: {
    backgroundColor: Palette.textOnPrimary,
  },
  filterChipBadgeText: {
    ...Typography.caption,
    fontSize: 10,
  },
  listContent: {
    padding: Spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.heading,
    marginTop: Spacing.md,
  },
  emptyDescription: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  emptyButtonText: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    backgroundColor: Palette.background,
  },
  tipText: {
    ...Typography.caption,
    fontSize: 11,
  },
});
