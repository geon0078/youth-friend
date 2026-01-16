/**
 * 신청 저장소 서비스
 * Story 5.5: Implement Application Progress Saving
 *
 * 진행 중인 신청 건을 저장하고 관리
 */
import { cacheStorage } from './cache-storage';
import type {
  SavedApplication,
  ApplicationStatus,
  DocumentChecklist,
  ApplicationProgress,
  StatusHistoryItem,
  SavedApplicationFilters,
} from '@/types/models/application';
import {
  DEFAULT_APPLICATION_PROGRESS,
  isDeadlineApproaching,
} from '@/types/models/application';

const SAVED_APPLICATIONS_KEY = 'saved_applications';

/**
 * 저장된 신청 목록 로드
 */
export function loadSavedApplications(): SavedApplication[] {
  try {
    const stored = cacheStorage.get<SavedApplication[]>(SAVED_APPLICATIONS_KEY);
    return stored || [];
  } catch (error) {
    console.warn('[ApplicationStorage] Failed to load applications:', error);
    return [];
  }
}

/**
 * 저장된 신청 목록 저장
 */
function saveApplicationsList(applications: SavedApplication[]): void {
  try {
    cacheStorage.set(SAVED_APPLICATIONS_KEY, applications);
  } catch (error) {
    console.warn('[ApplicationStorage] Failed to save applications:', error);
  }
}

/**
 * 새 신청 저장
 */
export function saveApplication(
  benefitId: string,
  benefitTitle: string,
  benefitCategory: string,
  deadline?: string,
  checklist?: DocumentChecklist
): SavedApplication {
  const applications = loadSavedApplications();
  const now = new Date().toISOString();

  // 기존 신청이 있는지 확인
  const existingIndex = applications.findIndex((app) => app.benefitId === benefitId);

  const newApplication: SavedApplication = {
    id: `app-${benefitId}-${Date.now()}`,
    benefitId,
    benefitTitle,
    benefitCategory,
    deadline,
    checklist: checklist || {
      benefitId,
      items: [],
      updatedAt: now,
    },
    progress: DEFAULT_APPLICATION_PROGRESS,
    status: 'preparing',
    statusHistory: [
      {
        status: 'preparing',
        changedAt: now,
        note: '신청 준비 시작',
      },
    ],
    savedAt: now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    // 기존 신청 업데이트
    applications[existingIndex] = {
      ...applications[existingIndex],
      ...newApplication,
      id: applications[existingIndex].id,
      savedAt: applications[existingIndex].savedAt,
      statusHistory: applications[existingIndex].statusHistory,
    };
  } else {
    // 새 신청 추가
    applications.unshift(newApplication);
  }

  saveApplicationsList(applications);
  return existingIndex >= 0 ? applications[existingIndex] : newApplication;
}

/**
 * 신청 업데이트
 */
export function updateApplication(
  applicationId: string,
  updates: Partial<Omit<SavedApplication, 'id' | 'benefitId' | 'savedAt'>>
): SavedApplication | null {
  const applications = loadSavedApplications();
  const index = applications.findIndex((app) => app.id === applicationId);

  if (index === -1) {
    return null;
  }

  applications[index] = {
    ...applications[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveApplicationsList(applications);
  return applications[index];
}

/**
 * 신청 상태 변경
 */
export function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note?: string
): SavedApplication | null {
  const applications = loadSavedApplications();
  const index = applications.findIndex((app) => app.id === applicationId);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const historyItem: StatusHistoryItem = {
    status,
    changedAt: now,
    note,
  };

  applications[index] = {
    ...applications[index],
    status,
    statusHistory: [...applications[index].statusHistory, historyItem],
    updatedAt: now,
  };

  saveApplicationsList(applications);
  return applications[index];
}

/**
 * 신청 체크리스트 업데이트
 */
export function updateApplicationChecklist(
  applicationId: string,
  checklist: DocumentChecklist
): SavedApplication | null {
  return updateApplication(applicationId, { checklist });
}

/**
 * 신청 진행 상황 업데이트
 */
export function updateApplicationProgress(
  applicationId: string,
  progress: ApplicationProgress
): SavedApplication | null {
  return updateApplication(applicationId, { progress });
}

/**
 * 신청 삭제
 */
export function deleteApplication(applicationId: string): boolean {
  const applications = loadSavedApplications();
  const index = applications.findIndex((app) => app.id === applicationId);

  if (index === -1) {
    return false;
  }

  applications.splice(index, 1);
  saveApplicationsList(applications);
  return true;
}

/**
 * 혜택 ID로 저장된 신청 찾기
 */
export function findApplicationByBenefitId(
  benefitId: string
): SavedApplication | null {
  const applications = loadSavedApplications();
  return applications.find((app) => app.benefitId === benefitId) || null;
}

/**
 * 신청 ID로 저장된 신청 찾기
 */
export function findApplicationById(
  applicationId: string
): SavedApplication | null {
  const applications = loadSavedApplications();
  return applications.find((app) => app.id === applicationId) || null;
}

/**
 * 필터링된 신청 목록 조회
 */
export function getFilteredApplications(
  filters?: SavedApplicationFilters
): SavedApplication[] {
  let applications = loadSavedApplications();

  // 상태 필터
  if (filters?.status) {
    applications = applications.filter((app) => app.status === filters.status);
  }

  // 카테고리 필터
  if (filters?.category) {
    applications = applications.filter(
      (app) => app.benefitCategory === filters.category
    );
  }

  // 정렬
  const sortBy = filters?.sortBy || 'updatedAt';
  const sortOrder = filters?.sortOrder || 'desc';

  applications.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'deadline':
        // 마감일 없는 경우 맨 뒤로
        aValue = a.deadline || 'zzz';
        bValue = b.deadline || 'zzz';
        break;
      case 'savedAt':
        aValue = a.savedAt;
        bValue = b.savedAt;
        break;
      case 'updatedAt':
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return applications;
}

/**
 * 마감 임박 신청 목록 조회
 */
export function getDeadlineApproachingApplications(): SavedApplication[] {
  const applications = loadSavedApplications();
  return applications
    .filter(
      (app) =>
        app.status === 'preparing' && isDeadlineApproaching(app.deadline)
    )
    .sort((a, b) => {
      // 마감일 빠른 순
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
}

/**
 * 상태별 신청 수 조회
 */
export function getApplicationCountByStatus(): Record<ApplicationStatus, number> {
  const applications = loadSavedApplications();
  const counts: Record<ApplicationStatus, number> = {
    preparing: 0,
    applied: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  };

  applications.forEach((app) => {
    counts[app.status]++;
  });

  return counts;
}

/**
 * 모든 저장된 신청 삭제
 */
export function clearAllApplications(): void {
  try {
    cacheStorage.remove(SAVED_APPLICATIONS_KEY);
  } catch (error) {
    console.warn('[ApplicationStorage] Failed to clear applications:', error);
  }
}
