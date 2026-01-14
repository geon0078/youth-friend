import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getSemanticColor,
  SemanticColors,
  Palette,
  Spacing,
  Radius,
  Typography,
} from '@/design-system';
import { Card, SectionHeader, Badge, PrimaryButton } from '@/components/design-system';
import { fetchJobs, JobPosting } from '@/services/work24-jobs';
import { fetchTrainingCourses, TrainingCourse } from '@/services/work24-training';

type TabType = 'jobs' | 'training';

export default function ExploreScreen() {
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';

  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = getSemanticColor(scheme, 'background');
  const textColor = getSemanticColor(scheme, 'text');
  const mutedText = SemanticColors[resolvedScheme].mutedText;

  const loadData = async (tab: TabType) => {
    try {
      setError(null);
      setLoading(true);

      if (tab === 'jobs') {
        const result = await fetchJobs({ pageSize: 10 });
        setJobs(result.jobs);
      } else {
        const result = await fetchTrainingCourses({ pageSize: 10 });
        setCourses(result.courses);
      }
    } catch (err) {
      const message = tab === 'jobs'
        ? '채용정보를 불러오는데 실패했습니다.'
        : '훈련과정을 불러오는데 실패했습니다.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(activeTab);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {/* 탭 헤더 */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'jobs' && styles.activeTab,
            { borderBottomColor: activeTab === 'jobs' ? Palette.primary : 'transparent' },
          ]}
          onPress={() => handleTabChange('jobs')}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'jobs' ? Palette.primary : mutedText },
            ]}>
            채용정보
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'training' && styles.activeTab,
            { borderBottomColor: activeTab === 'training' ? Palette.primary : 'transparent' },
          ]}
          onPress={() => handleTabChange('training')}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'training' ? Palette.primary : mutedText },
            ]}>
            훈련과정
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* 섹션 헤더 */}
        <SectionHeader
          title={activeTab === 'jobs' ? '청년 채용정보' : '직업훈련 과정'}
          subtitle={activeTab === 'jobs' ? '고용24 API 실시간 연동' : '내일배움카드 훈련과정'}
        />

        {/* 콘텐츠 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={[styles.loadingText, { color: mutedText }]}>
              {activeTab === 'jobs' ? '채용정보를 불러오는 중...' : '훈련과정을 불러오는 중...'}
            </Text>
          </View>
        ) : error ? (
          <Card>
            <Text style={styles.errorText}>{error}</Text>
            <PrimaryButton label="다시 시도" onPress={() => loadData(activeTab)} />
          </Card>
        ) : activeTab === 'jobs' ? (
          jobs.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: mutedText }]}>
                표시할 채용정보가 없습니다.
              </Text>
            </Card>
          ) : (
            jobs.map((job, index) => (
              <JobCard key={`${job.wantedAuthNo}-${index}`} job={job} />
            ))
          )
        ) : courses.length === 0 ? (
          <Card>
            <Text style={[styles.emptyText, { color: mutedText }]}>
              표시할 훈련과정이 없습니다.
            </Text>
          </Card>
        ) : (
          courses.map((course, index) => (
            <TrainingCard key={`${course.trprId}-${index}`} course={course} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function JobCard({ job }: { job: JobPosting }) {
  const handlePress = () => {
    if (job.wantedInfoUrl) {
      Linking.openURL(job.wantedInfoUrl);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Card>
        <View style={styles.cardBadgeRow}>
          <Badge label={job.jobsNm || '채용'} />
          {job.closeDt && <Badge label={formatDate(job.closeDt)} tone="alert" />}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {job.wantedTitle}
        </Text>
        <Text style={styles.cardCompany}>{job.company}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {[job.region, job.employType, job.salTp].filter(Boolean).join(' · ')}
        </Text>
        {job.career && (
          <Text style={styles.cardMeta}>경력: {job.career}</Text>
        )}
      </Card>
    </Pressable>
  );
}

function TrainingCard({ course }: { course: TrainingCourse }) {
  const handlePress = () => {
    if (course.titleLink) {
      Linking.openURL(course.titleLink);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Card>
        <View style={styles.cardBadgeRow}>
          <Badge label={course.trainType || '훈련'} />
          {course.trprDegr && <Badge label={`${course.trprDegr}기`} tone="info" />}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.cardCompany}>{course.subTitle}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {[course.address, course.traStartDate && `${course.traStartDate} ~ ${course.traEndDate}`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View style={styles.trainingInfo}>
          {course.courseMan && (
            <Text style={styles.cardMeta}>정원: {course.courseMan}명</Text>
          )}
          {course.realExpPer && (
            <Text style={styles.cardMeta}>실제부담: {Number(course.realExpPer).toLocaleString()}원</Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `~${month}/${day}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    color: Palette.accent,
    marginBottom: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginTop: Spacing.xs,
  },
  cardCompany: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.primary,
  },
  cardDescription: {
    color: Palette.textMuted,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  cardMeta: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  trainingInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
});
