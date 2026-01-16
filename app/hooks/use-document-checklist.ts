/**
 * 서류 체크리스트 훅
 * Story 5.3: Implement Document Checklist
 *
 * 혜택별 서류 준비 상태를 관리
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { cacheStorage } from '@/services/storage/cache-storage';
import type {
  DocumentChecklist,
  DocumentCheckItem,
  RequiredDocument,
} from '@/types/models/application';
import { calculateChecklistProgress } from '@/types/models/application';

const CHECKLIST_STORAGE_KEY = 'document_checklists';

/**
 * 체크리스트 저장소에서 모든 체크리스트 로드
 */
function loadAllChecklists(): Record<string, DocumentChecklist> {
  try {
    const stored = cacheStorage.get<Record<string, DocumentChecklist>>(CHECKLIST_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.warn('[DocumentChecklist] Failed to load checklists:', error);
  }
  return {};
}

/**
 * 모든 체크리스트 저장
 */
function saveAllChecklists(checklists: Record<string, DocumentChecklist>): void {
  try {
    cacheStorage.set(CHECKLIST_STORAGE_KEY, checklists);
  } catch (error) {
    console.warn('[DocumentChecklist] Failed to save checklists:', error);
  }
}

/**
 * 서류 체크리스트 훅
 *
 * @example
 * ```tsx
 * const {
 *   checklist,
 *   progress,
 *   toggleDocument,
 *   resetChecklist,
 * } = useDocumentChecklist(benefitId, documents);
 * ```
 */
export function useDocumentChecklist(
  benefitId: string,
  documents: RequiredDocument[]
) {
  const [checklist, setChecklist] = useState<DocumentChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    if (!benefitId || documents.length === 0) {
      setChecklist(null);
      setIsLoading(false);
      return;
    }

    const allChecklists = loadAllChecklists();
    const existingChecklist = allChecklists[benefitId];

    if (existingChecklist) {
      // 기존 체크리스트가 있으면 문서 목록과 동기화
      const updatedItems = documents.map((doc) => {
        const existingItem = existingChecklist.items.find(
          (item) => item.documentId === doc.id
        );
        return existingItem || { documentId: doc.id, checked: false };
      });

      const updatedChecklist: DocumentChecklist = {
        ...existingChecklist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
      setChecklist(updatedChecklist);
    } else {
      // 새 체크리스트 생성
      const newChecklist: DocumentChecklist = {
        benefitId,
        items: documents.map((doc) => ({
          documentId: doc.id,
          checked: false,
        })),
        updatedAt: new Date().toISOString(),
      };
      setChecklist(newChecklist);
    }

    setIsLoading(false);
  }, [benefitId, documents]);

  // 체크리스트 변경 시 저장
  useEffect(() => {
    if (checklist && benefitId) {
      const allChecklists = loadAllChecklists();
      allChecklists[benefitId] = checklist;
      saveAllChecklists(allChecklists);
    }
  }, [checklist, benefitId]);

  // 서류 체크 토글
  const toggleDocument = useCallback((documentId: string) => {
    setChecklist((prev) => {
      if (!prev) return prev;

      const updatedItems = prev.items.map((item) => {
        if (item.documentId === documentId) {
          return {
            ...item,
            checked: !item.checked,
            checkedAt: !item.checked ? new Date().toISOString() : undefined,
          };
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 특정 서류 체크 상태 설정
  const setDocumentChecked = useCallback(
    (documentId: string, checked: boolean) => {
      setChecklist((prev) => {
        if (!prev) return prev;

        const updatedItems = prev.items.map((item) => {
          if (item.documentId === documentId) {
            return {
              ...item,
              checked,
              checkedAt: checked ? new Date().toISOString() : undefined,
            };
          }
          return item;
        });

        return {
          ...prev,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // 전체 체크/해제
  const setAllChecked = useCallback((checked: boolean) => {
    setChecklist((prev) => {
      if (!prev) return prev;

      const updatedItems = prev.items.map((item) => ({
        ...item,
        checked,
        checkedAt: checked ? new Date().toISOString() : undefined,
      }));

      return {
        ...prev,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 체크리스트 초기화
  const resetChecklist = useCallback(() => {
    setChecklist((prev) => {
      if (!prev) return prev;

      const updatedItems = prev.items.map((item) => ({
        ...item,
        checked: false,
        checkedAt: undefined,
      }));

      return {
        ...prev,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 서류별 체크 상태 조회
  const isDocumentChecked = useCallback(
    (documentId: string): boolean => {
      if (!checklist) return false;
      const item = checklist.items.find((i) => i.documentId === documentId);
      return item?.checked || false;
    },
    [checklist]
  );

  // 진행률 계산
  const progress = useMemo(() => {
    if (!checklist) return 0;
    return calculateChecklistProgress(checklist);
  }, [checklist]);

  // 체크된 개수
  const checkedCount = useMemo(() => {
    if (!checklist) return 0;
    return checklist.items.filter((item) => item.checked).length;
  }, [checklist]);

  // 전체 개수
  const totalCount = useMemo(() => {
    if (!checklist) return 0;
    return checklist.items.length;
  }, [checklist]);

  // 모두 체크됨 여부
  const isAllChecked = useMemo(() => {
    if (!checklist || checklist.items.length === 0) return false;
    return checklist.items.every((item) => item.checked);
  }, [checklist]);

  return {
    checklist,
    isLoading,
    progress,
    checkedCount,
    totalCount,
    isAllChecked,
    toggleDocument,
    setDocumentChecked,
    setAllChecked,
    resetChecklist,
    isDocumentChecked,
  };
}

/**
 * 저장된 모든 체크리스트 삭제
 */
export function clearAllChecklists(): void {
  try {
    cacheStorage.remove(CHECKLIST_STORAGE_KEY);
  } catch (error) {
    console.warn('[DocumentChecklist] Failed to clear checklists:', error);
  }
}

/**
 * 특정 혜택의 체크리스트 삭제
 */
export function deleteChecklist(benefitId: string): void {
  try {
    const allChecklists = loadAllChecklists();
    delete allChecklists[benefitId];
    saveAllChecklists(allChecklists);
  } catch (error) {
    console.warn('[DocumentChecklist] Failed to delete checklist:', error);
  }
}
