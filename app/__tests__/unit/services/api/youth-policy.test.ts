/**
 * 온통청년 API 서비스 테스트
 * 2026년 새 API 엔드포인트 기준
 */
import {
  fetchYouthPolicyList,
  fetchYouthPolicyDetail,
  POLICY_TYPE_CODES,
  REGION_CODES,
} from '@/services/api/youth-policy';
import { ApiError } from '@/services/api/client';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 성공 응답 JSON (새 API 형식)
const mockListResponseJson = {
  resultCode: 200,
  resultMessage: '정상처리되었습니다.',
  result: {
    pagging: {
      totCount: 1,
      pageNum: 1,
      pageSize: 10,
    },
    youthPolicyList: [
      {
        plcyNo: 'R2024010100001',
        plcyNm: '청년 취업 지원금',
        plcyExplnCn: '청년 취업을 위한 지원금 프로그램',
        plcySprtCn: '월 50만원 지원',
        lclsfNm: '일자리',
        sprvsnInstCdNm: '고용노동부',
        operInstCdNm: '고용노동부',
        rgtrInstCdNm: '서울특별시',
        aplyYmd: '2024.01.01 ~ 2024.12.31',
        sprtTrgtMinAge: '18',
        sprtTrgtMaxAge: '34',
        zipCd: '003001',
      },
    ],
  },
};

const mockEmptyListResponseJson = {
  resultCode: 200,
  resultMessage: '정상처리되었습니다.',
  result: {
    pagging: {
      totCount: 0,
      pageNum: 1,
      pageSize: 10,
    },
    youthPolicyList: [],
  },
};

const mockErrorResponseJson = {
  resultCode: 401,
  resultMessage: '인증키가 유효하지 않습니다.',
  result: null,
};

describe('youth-policy API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fetchYouthPolicyList', () => {
    it('정책 목록을 조회한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponseJson),
      });

      const result = await fetchYouthPolicyList({ pageIndex: 1, display: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].bizId).toBe('R2024010100001');
      expect(result.items[0].polyBizSjnm).toBe('청년 취업 지원금');
      expect(result.totalCount).toBe(1);
      expect(result.pageIndex).toBe(1);
    });

    it('기본 파라미터로 조회한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponseJson),
      });

      await fetchYouthPolicyList();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('pageNum=1');
      expect(url).toContain('pageSize=10');
    });

    it('정책 유형 코드를 카테고리에 맞게 변환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponseJson),
      });

      const result = await fetchYouthPolicyList();

      // 일자리 → 023010
      expect(result.items[0].polyBizTy).toBe('023010');
    });

    it('빈 목록 응답을 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEmptyListResponseJson),
      });

      const result = await fetchYouthPolicyList();

      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('API 에러 응답 시 에러를 던진다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponseJson),
      });

      await expect(fetchYouthPolicyList()).rejects.toThrow('인증키가 유효하지 않습니다.');
    });

    it('HTTP 에러 시 재시도 후 에러를 던진다', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 });

      const promise = fetchYouthPolicyList().catch((err) => err as Error);

      // 재시도 딜레이 처리
      await jest.runAllTimersAsync();

      const error = await promise;
      expect(error).toBeInstanceOf(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(4); // 초기 + 3회 재시도
    });

    it('타임아웃 시 에러를 던진다', async () => {
      mockFetch.mockImplementation((_, options) =>
        new Promise((resolve, reject) => {
          const signal = options?.signal as AbortSignal | undefined;
          if (signal) {
            signal.addEventListener('abort', () => {
              const abortError = new Error('AbortError');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }

          setTimeout(
            () => resolve({ ok: true, json: () => Promise.resolve(mockListResponseJson) }),
            15000
          );
        })
      );

      const promise = fetchYouthPolicyList().catch((err) => err as Error);

      // 타임아웃 트리거
      jest.advanceTimersByTime(10000);
      await jest.runAllTimersAsync();

      const error = await promise;
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('fetchYouthPolicyDetail', () => {
    it('정책 상세 정보를 조회한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponseJson),
      });

      const result = await fetchYouthPolicyDetail('R2024010100001');

      expect(result).not.toBeNull();
      expect(result?.bizId).toBe('R2024010100001');
      expect(result?.ageInfo).toBe('만 18세 ~ 34세');
    });

    it('정책을 찾지 못하면 null을 반환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListResponseJson),
      });

      const result = await fetchYouthPolicyDetail('NON_EXISTENT_ID');

      expect(result).toBeNull();
    });

    it('빈 bizId에 대해 에러를 던진다', async () => {
      await expect(fetchYouthPolicyDetail('')).rejects.toThrow('bizId is required');
    });
  });

  describe('상수', () => {
    it('정책 유형 코드가 정의되어 있다', () => {
      expect(POLICY_TYPE_CODES.JOB).toBe('023010');
      expect(POLICY_TYPE_CODES.HOUSING).toBe('023020');
      expect(POLICY_TYPE_CODES.EDUCATION).toBe('023030');
      expect(POLICY_TYPE_CODES.WELFARE).toBe('023040');
      expect(POLICY_TYPE_CODES.PARTICIPATION).toBe('023050');
    });

    it('지역 코드가 정의되어 있다', () => {
      expect(REGION_CODES.SEOUL).toBe('003001');
      expect(REGION_CODES.BUSAN).toBe('003002');
      expect(REGION_CODES.SEJONG).toBe('003017');
    });
  });
});
