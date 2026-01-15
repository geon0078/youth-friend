/**
 * React Query Provider with Persistent Cache
 * - MMKV 기반 영구 캐시 (앱 재시작 시 복원)
 * - NFR20: 혜택 데이터 1시간 캐시
 * - 오프라인 지원 (offlineFirst networkMode)
 */
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { PropsWithChildren, useState } from 'react';
import { queryPersister } from '@/services/storage/query-persister';

/** 캐시 유지 시간: 24시간 (gcTime) */
const GC_TIME = 1000 * 60 * 60 * 24;

/** 데이터 신선도 유지 시간: 1시간 (staleTime) - NFR20 */
const STALE_TIME = 1000 * 60 * 60;

/** 최대 캐시 유지 시간: 24시간 */
const MAX_AGE = 1000 * 60 * 60 * 24;

/**
 * QueryClient 생성 옵션
 * - 영구 캐시와 호환되도록 gcTime 설정
 * - 오프라인 우선 모드 (offlineFirst)
 */
const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME, // 1시간 캐시 (NFR20)
      gcTime: GC_TIME, // 24시간 가비지 컬렉션 (영구 캐시 지원)
      retry: 3, // 최대 3회 재시도 (NFR19)
      networkMode: 'offlineFirst' as const, // 오프라인 우선 모드
      refetchOnWindowFocus: false, // 포커스 시 자동 리프레시 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 리프레시
      refetchOnMount: true, // 마운트 시 stale 데이터 리프레시
    },
    mutations: {
      retry: 3,
      networkMode: 'offlineFirst' as const,
    },
  },
};

/**
 * QueryClient 팩토리 함수 (테스트용)
 * 테스트에서 격리된 QueryClient 인스턴스를 생성할 때 사용
 *
 * @example
 * ```tsx
 * // 테스트 코드에서
 * const queryClient = createQueryClient();
 * const wrapper = ({ children }) => (
 *   <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
 * );
 * ```
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientOptions);
}

/**
 * QueryProvider 컴포넌트
 * - PersistQueryClientProvider로 MMKV 영구 캐시 지원
 * - 앱 재시작 시 캐시 자동 복원
 * - QueryClient를 컴포넌트 내부에서 생성하여 테스트 격리 지원
 */
export function QueryProvider({ children }: PropsWithChildren) {
  // useState로 QueryClient 생성하여 리렌더링 시 재생성 방지
  const [queryClient] = useState(() => createQueryClient());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: MAX_AGE, // 24시간 이상 된 캐시는 삭제
        buster: '1', // 캐시 버전 (스키마 변경 시 증가)
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
