/**
 * 온통청년 API 서비스 테스트
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

// 성공 응답 XML
const mockListResponseXml = `
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>정상처리되었습니다.</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <bizId>R2024010100001</bizId>
        <polyBizSjnm>청년 취업 지원금</polyBizSjnm>
        <polyItcnCn>청년 취업을 위한 지원금 프로그램</polyItcnCn>
        <sporCn>월 50만원 지원</sporCn>
        <cnsgNmor>고용노동부</cnsgNmor>
        <rqutPrdCn>2024.01.01 ~ 2024.12.31</rqutPrdCn>
        <polyBizTy>023010</polyBizTy>
        <polyBizSecd>003001</polyBizSecd>
      </item>
    </items>
    <pageIndex>1</pageIndex>
    <totalCount>1</totalCount>
  </body>
</response>
`;

const mockDetailResponseXml = `
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <header>
    <resultCode>00</resultCode>
    <resultMsg>정상처리되었습니다.</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <bizId>R2024010100001</bizId>
        <polyBizSjnm>청년 취업 지원금</polyBizSjnm>
        <polyItcnCn>청년 취업을 위한 지원금 프로그램</polyItcnCn>
        <sporCn>월 50만원 지원</sporCn>
        <cnsgNmor>고용노동부</cnsgNmor>
        <rqutPrdCn>2024.01.01 ~ 2024.12.31</rqutPrdCn>
        <polyBizTy>023010</polyBizTy>
        <polyBizSecd>003001</polyBizSecd>
        <ageInfo>만 18세 ~ 34세</ageInfo>
        <accrRqisCn>제한없음</accrRqisCn>
        <empmSttsCn>미취업자</empmSttsCn>
        <prcpCn>기준 중위소득 100% 이하</prcpCn>
        <rqutUrla>https://example.com/apply</rqutUrla>
      </item>
    </items>
  </body>
</response>
`;

const mockErrorResponseXml = `
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <header>
    <resultCode>99</resultCode>
    <resultMsg>인증키가 유효하지 않습니다.</resultMsg>
  </header>
</response>
`;

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
        text: () => Promise.resolve(mockListResponseXml),
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
        text: () => Promise.resolve(mockListResponseXml),
      });

      await fetchYouthPolicyList();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('pageIndex=1');
      expect(url).toContain('display=10');
    });

    it('검색 키워드를 포함하여 조회한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockListResponseXml),
      });

      await fetchYouthPolicyList({ query: '취업' });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('query=%EC%B7%A8%EC%97%85');
    });

    it('API 에러 응답 시 에러를 던진다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockErrorResponseXml),
      });

      await expect(fetchYouthPolicyList()).rejects.toThrow('인증키가 유효하지 않습니다.');
    });

    it('HTTP 에러 시 재시도 후 에러를 던진다', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 });

      const promise = fetchYouthPolicyList();

      // 재시도 딜레이 처리
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toBeInstanceOf(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(4); // 초기 + 3회 재시도
    });

    it('타임아웃 시 에러를 던진다', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, text: () => Promise.resolve(mockListResponseXml) }), 15000);
          })
      );

      const promise = fetchYouthPolicyList();

      // 타임아웃 트리거
      jest.advanceTimersByTime(10000);
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
    });
  });

  describe('fetchYouthPolicyDetail', () => {
    it('정책 상세 정보를 조회한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockDetailResponseXml),
      });

      const result = await fetchYouthPolicyDetail('R2024010100001');

      expect(result).not.toBeNull();
      expect(result?.bizId).toBe('R2024010100001');
      expect(result?.ageInfo).toBe('만 18세 ~ 34세');
      expect(result?.rqutUrla).toBe('https://example.com/apply');
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
