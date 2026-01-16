/**
 * 저장된 신청 관리 훅
 * Story 5.5: Implement Application Progress Saving
 *
 * 진행 중인 신청 목록을 관리
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  loadSavedApplications,
  saveApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  findApplicationByBenefitId,
  getFilteredApplications,
  getDeadlineApproachingApplications,
  getApplicationCountByStatus,
} from '@/services/storage/application-storage';
import type {
  SavedApplication,
  ApplicationStatus,
  DocumentChecklist,
  ApplicationProgress,
  SavedApplicationFilters,
} from '@/types/models/application';

/**
 * 저장된 신청 관리 훅
 *
 * @example
 * ```tsx
 * const {
 *   applications,
 *   saveForLater,
 *   updateStatus,
 *   removeApplication,
 * } = useSavedApplications();
 * ```
 */
export function useSavedApplications(filters?: SavedApplicationFilters) {
  const [applications, setApplications] = useState<SavedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드
  const loadApplications = useCallback(() => {
    setIsLoading(true);
    try {
      const loaded = getFilteredApplications(filters);
      setApplications(loaded);
    } catch (error) {
      console.warn('[useSavedApplications] Failed to load:', error);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // 신청 저장
  const saveForLater = useCallback(
    (
      benefitId: string,
      benefitTitle: string,
      benefitCategory: string,
      deadline?: string,
      checklist?: DocumentChecklist
    ): SavedApplication => {
      const saved = saveApplication(
        benefitId,
        benefitTitle,
        benefitCategory,
        deadline,
        checklist
      );
      loadApplications();
      return saved;
    },
    [loadApplications]
  );

  // 상태 업데이트
  const updateStatus = useCallback(
    (
      applicationId: string,
      status: ApplicationStatus,
      note?: string
    ): boolean => {
      const result = updateApplicationStatus(applicationId, status, note);
      if (result) {
        loadApplications();
        return true;
      }
      return false;
    },
    [loadApplications]
  );

  // 신청 업데이트
  const update = useCallback(
    (
      applicationId: string,
      updates: Partial<Omit<SavedApplication, 'id' | 'benefitId' | 'savedAt'>>
    ): boolean => {
      const result = updateApplication(applicationId, updates);
      if (result) {
        loadApplications();
        return true;
      }
      return false;
    },
    [loadApplications]
  );

  // 신청 삭제
  const removeApplication = useCallback(
    (applicationId: string): boolean => {
      const result = deleteApplication(applicationId);
      if (result) {
        loadApplications();
      }
      return result;
    },
    [loadApplications]
  );

  // 혜택 ID로 저장된 신청 찾기
  const findByBenefitId = useCallback(
    (benefitId: string): SavedApplication | null => {
      return findApplicationByBenefitId(benefitId);
    },
    []
  );

  // 혜택이 저장되어 있는지 확인
  const isApplicationSaved = useCallback(
    (benefitId: string): boolean => {
      return applications.some((app) => app.benefitId === benefitId);
    },
    [applications]
  );

  // 마감 임박 신청
  const deadlineApproaching = useMemo(
    () => getDeadlineApproachingApplications(),
    [applications]
  );

  // 상태별 개수
  const countByStatus = useMemo(
    () => getApplicationCountByStatus(),
    [applications]
  );

  // 새로고침
  const refresh = useCallback(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    isLoading,
    saveForLater,
    updateStatus,
    update,
    removeApplication,
    findByBenefitId,
    isApplicationSaved,
    deadlineApproaching,
    countByStatus,
    refresh,
  };
}

/**
 * 특정 혜택의 저장 상태 훅
 *
 * @example
 * ```tsx
 * const { isSaved, savedApplication, save, remove } = useBenefitSaveStatus(benefitId);
 * ```
 */
export function useBenefitSaveStatus(
  benefitId: string,
  benefitTitle: string,
  benefitCategory: string,
  deadline?: string
) {
  const [savedApplication, setSavedApplication] = useState<SavedApplication | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    setIsLoading(true);
    const found = findApplicationByBenefitId(benefitId);
    setSavedApplication(found);
    setIsLoading(false);
  }, [benefitId]);

  // 저장
  const save = useCallback(
    (checklist?: DocumentChecklist): SavedApplication => {
      const saved = saveApplication(
        benefitId,
        benefitTitle,
        benefitCategory,
        deadline,
        checklist
      );
      setSavedApplication(saved);
      return saved;
    },
    [benefitId, benefitTitle, benefitCategory, deadline]
  );

  // 삭제
  const remove = useCallback((): boolean => {
    if (!savedApplication) return false;
    const result = deleteApplication(savedApplication.id);
    if (result) {
      setSavedApplication(null);
    }
    return result;
  }, [savedApplication]);

  // 상태 업데이트
  const updateStatus = useCallback(
    (status: ApplicationStatus, note?: string): boolean => {
      if (!savedApplication) return false;
      const result = updateApplicationStatus(savedApplication.id, status, note);
      if (result) {
        setSavedApplication(result);
        return true;
      }
      return false;
    },
    [savedApplication]
  );

  return {
    isSaved: !!savedApplication,
    savedApplication,
    isLoading,
    save,
    remove,
    updateStatus,
  };
}
