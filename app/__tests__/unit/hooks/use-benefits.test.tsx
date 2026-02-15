/**
 * 혜택 조회 훅 테스트
 * - useBenefits: 혜택 목록 조회
 * - usePersonalizedBenefits: 맞춤 혜택 조회
 * - useBenefitDetail: 혜택 상세 조회
 * - Pull-to-refresh 기능 (refresh, isRefetching)
 * - 캐시 무효화 (invalidate)
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import {
  useBenefits,
  usePersonalizedBenefits,
  useInvalidateAllBenefits,
  BENEFITS_QUERY_KEY,
} from '@/hooks/use-benefits';
import {
  useBenefitDetail,
  BENEFIT_DETAIL_QUERY_KEY,
} from '@/hooks/use-benefit-detail';
import * as api from '@/services/api';

// API 모킹
jest.mock('@/services/api', () => ({
  fetchAllBenefits: jest.fn(),
  fetchPersonalizedBenefits: jest.fn(),
  fetchBenefitDetail: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

// 테스트용 QueryClient wrapper
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock 데이터
const mockBenefitListResult = {
  items: [
    {
      id: 'youth-policy-R001',
      originalId: 'R001',
      title: '청년 취업 지원금',
      source: 'youth-policy' as const,
      category: 'employment' as const,
      organization: '고용노동부',
      deadline: '2024-12-31',
      description: '청년 취업 지원 프로그램',
      requirements: ['만 18세 이상', '미취업자'],
      status: 'active' as const,
    },
  ],
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

const mockBenefitDetail = {
  id: 'youth-policy-R001',
  originalId: 'R001',
  title: '청년 취업 지원금',
  source: 'youth-policy' as const,
  category: 'employment' as const,
  organization: '고용노동부',
  deadline: '2024-12-31',
  description: '상세 설명',
  requirements: ['만 18세 이상', '미취업자'],
  status: 'active' as const,
  ageRequirement: '만 18세 ~ 34세',
  applicationUrl: 'https://example.com',
};

describe('useBenefits', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    mockApi.fetchAllBenefits.mockResolvedValue(mockBenefitListResult);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('혜택 목록을 조회한다', async () => {
    const { result } = renderHook(() => useBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBenefitListResult);
    expect(mockApi.fetchAllBenefits).toHaveBeenNthCalledWith(1, { includeGov24: false });
    expect(mockApi.fetchAllBenefits).toHaveBeenNthCalledWith(2, { source: 'gov24' });
  });

  it('필터를 적용하여 조회한다', async () => {
    const filters = { category: 'education' as const };

    const { result } = renderHook(() => useBenefits(filters), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.fetchAllBenefits).toHaveBeenNthCalledWith(1, {
      ...filters,
      includeGov24: false,
    });
    expect(mockApi.fetchAllBenefits).toHaveBeenNthCalledWith(2, {
      ...filters,
      source: 'gov24',
    });
  });

  describe('refresh (Pull-to-refresh)', () => {
    it('refresh 함수를 제공한다', async () => {
      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('refresh 호출 시 데이터를 다시 가져온다', async () => {
      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApi.fetchAllBenefits).toHaveBeenCalledTimes(2);

      // refresh 호출
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApi.fetchAllBenefits).toHaveBeenCalledTimes(4);
    });

    it('refresh 중 isRefetching이 true가 된다', async () => {
      let resolvePrimary: (value: any) => void;
      let resolveGov24: (value: any) => void;
      mockApi.fetchAllBenefits
        .mockResolvedValueOnce(mockBenefitListResult)
        .mockResolvedValueOnce(mockBenefitListResult)
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolvePrimary = resolve;
          })
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveGov24 = resolve;
          })
        );

      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // refresh 시작
      let refreshPromise: Promise<void>;
      act(() => {
        refreshPromise = result.current.refresh();
      });

      // isRefetching 확인
      await waitFor(() => {
        expect(result.current.isRefetching).toBe(true);
      });

      // resolve
      await act(async () => {
        resolvePrimary!(mockBenefitListResult);
        resolveGov24!(mockBenefitListResult);
        await refreshPromise;
      });

      await waitFor(() => {
        expect(result.current.isRefetching).toBe(false);
      });
    });
  });

  describe('invalidate (캐시 무효화)', () => {
    it('invalidate 함수를 제공한다', async () => {
      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(typeof result.current.invalidate).toBe('function');
    });

    it('invalidate 호출 시 캐시를 무효화한다', async () => {
      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // invalidate 호출
      await act(async () => {
        await result.current.invalidate();
      });

      // 캐시가 무효화되어 다시 fetch됨
      expect(mockApi.fetchAllBenefits).toHaveBeenCalledTimes(4);
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 error를 반환한다', async () => {
      const error = new Error('API 오류');
      mockApi.fetchAllBenefits.mockRejectedValue(error);

      const { result } = renderHook(() => useBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });
});

describe('usePersonalizedBenefits', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    mockApi.fetchPersonalizedBenefits.mockResolvedValue(mockBenefitListResult);
    mockApi.fetchAllBenefits.mockResolvedValue(mockBenefitListResult);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('사용자 프로필이 없으면 쿼리가 비활성화된다', async () => {
    const { result } = renderHook(() => usePersonalizedBenefits(null), {
      wrapper: createWrapper(queryClient),
    });

    // 쿼리가 실행되지 않음
    expect(result.current.isLoading).toBe(false);
    expect(mockApi.fetchPersonalizedBenefits).not.toHaveBeenCalled();
  });

  it('사용자 프로필이 있으면 맞춤 혜택을 조회한다', async () => {
    const userProfile = {
      birthYear: 1995,
      region: '서울',
      incomeLevel: 'middle',
      employmentStatus: 'unemployed',
    };

    const { result } = renderHook(
      () => usePersonalizedBenefits(userProfile),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.fetchPersonalizedBenefits).toHaveBeenCalledWith(
      userProfile,
      { includeGov24: false }
    );
    expect(mockApi.fetchAllBenefits).toHaveBeenCalledWith({ source: 'gov24' });
  });

  it('refresh와 invalidate 함수를 제공한다', async () => {
    const userProfile = { birthYear: 1995 };

    const { result } = renderHook(
      () => usePersonalizedBenefits(userProfile),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.invalidate).toBe('function');
  });
});

describe('useInvalidateAllBenefits', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    mockApi.fetchAllBenefits.mockResolvedValue(mockBenefitListResult);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('모든 혜택 캐시를 무효화한다', async () => {
    // 먼저 데이터 로드
    const { result: benefitsResult } = renderHook(() => useBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(benefitsResult.current.isSuccess).toBe(true);
    });

    // invalidateAll 훅
    const { result: invalidateResult } = renderHook(
      () => useInvalidateAllBenefits(),
      { wrapper: createWrapper(queryClient) }
    );

    expect(mockApi.fetchAllBenefits).toHaveBeenCalledTimes(2);

    // 무효화 호출
    await act(async () => {
      await invalidateResult.current();
    });

    // 캐시가 무효화되어 다시 fetch됨
    expect(mockApi.fetchAllBenefits).toHaveBeenCalledTimes(4);
  });
});

describe('useBenefitDetail', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    mockApi.fetchBenefitDetail.mockResolvedValue(mockBenefitDetail);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('혜택 상세를 조회한다', async () => {
    const benefitId = 'youth-policy-R001';

    const { result } = renderHook(() => useBenefitDetail(benefitId), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBenefitDetail);
    expect(mockApi.fetchBenefitDetail).toHaveBeenCalledWith(benefitId);
  });

  it('benefitId가 없으면 쿼리가 비활성화된다', async () => {
    const { result } = renderHook(() => useBenefitDetail(null), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockApi.fetchBenefitDetail).not.toHaveBeenCalled();
  });

  it('benefitId가 undefined면 쿼리가 비활성화된다', async () => {
    const { result } = renderHook(() => useBenefitDetail(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockApi.fetchBenefitDetail).not.toHaveBeenCalled();
  });

  describe('refresh (Pull-to-refresh)', () => {
    it('refresh 함수를 제공한다', async () => {
      const { result } = renderHook(
        () => useBenefitDetail('youth-policy-R001'),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('refresh 호출 시 데이터를 다시 가져온다', async () => {
      const { result } = renderHook(
        () => useBenefitDetail('youth-policy-R001'),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApi.fetchBenefitDetail).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApi.fetchBenefitDetail).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidate (캐시 무효화)', () => {
    it('invalidate 함수를 제공한다', async () => {
      const { result } = renderHook(
        () => useBenefitDetail('youth-policy-R001'),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(typeof result.current.invalidate).toBe('function');
    });

    it('invalidate 호출 시 캐시를 무효화한다', async () => {
      const { result } = renderHook(
        () => useBenefitDetail('youth-policy-R001'),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await act(async () => {
        await result.current.invalidate();
      });

      expect(mockApi.fetchBenefitDetail).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Query Keys', () => {
  it('BENEFITS_QUERY_KEY가 정의되어 있다', () => {
    expect(BENEFITS_QUERY_KEY).toBe('benefits');
  });

  it('BENEFIT_DETAIL_QUERY_KEY가 정의되어 있다', () => {
    expect(BENEFIT_DETAIL_QUERY_KEY).toBe('benefit-detail');
  });
});
