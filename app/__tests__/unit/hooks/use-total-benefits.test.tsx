/**
 * 총 혜택 금액 훅 테스트
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { useTotalBenefits } from '@/hooks/use-total-benefits';
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
      amount: 5000000, // 500만원
    },
    {
      id: 'youth-policy-R002',
      originalId: 'R002',
      title: '청년 주거 지원금',
      source: 'youth-policy' as const,
      category: 'housing' as const,
      organization: '국토교통부',
      deadline: '2024-12-31',
      description: '청년 주거 지원 프로그램',
      requirements: ['만 18세 이상'],
      status: 'active' as const,
      amount: 7000000, // 700만원
    },
    {
      id: 'youth-policy-R003',
      originalId: 'R003',
      title: '청년 교육 바우처',
      source: 'youth-policy' as const,
      category: 'education' as const,
      organization: '교육부',
      deadline: '2024-12-31',
      description: '청년 교육 지원',
      requirements: ['만 18세 이상'],
      status: 'active' as const,
      // amount 없음
    },
  ],
  page: 1,
  pageSize: 10,
  totalCount: 3,
  totalPages: 1,
};

describe('useTotalBenefits', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    mockApi.fetchAllBenefits.mockResolvedValue(mockBenefitListResult);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('총 금액을 계산한다', async () => {
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 500만 + 700만 = 1200만
    expect(result.current.data?.totalAmount).toBe(12000000);
  });

  it('포맷팅된 금액을 반환한다', async () => {
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 1200만원 포맷팅
    expect(result.current.data?.formattedAmount).toBe('약 1,2백만원');
  });

  it('혜택 개수를 계산한다', async () => {
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.benefitCount).toBe(3);
  });

  it('포맷팅된 개수를 반환한다', async () => {
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.formattedCount).toBe('3개 혜택');
  });

  it('amount가 없는 혜택은 0으로 처리한다', async () => {
    // R003은 amount가 없음 - 0으로 처리
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 500만 + 700만 + 0 = 1200만
    expect(result.current.data?.totalAmount).toBe(12000000);
  });

  it('refresh 함수를 제공한다', async () => {
    const { result } = renderHook(() => useTotalBenefits(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  describe('빈 데이터 처리', () => {
    it('빈 목록일 때 0을 반환한다', async () => {
      mockApi.fetchAllBenefits.mockResolvedValue({
        items: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      });

      const { result } = renderHook(() => useTotalBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.totalAmount).toBe(0);
      expect(result.current.data?.benefitCount).toBe(0);
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 error를 반환한다', async () => {
      const error = new Error('API 오류');
      mockApi.fetchAllBenefits.mockRejectedValue(error);

      const { result } = renderHook(() => useTotalBenefits(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeUndefined();
    });
  });
});
