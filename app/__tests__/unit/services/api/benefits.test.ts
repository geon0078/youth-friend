/**
 * 통합 혜택 서비스 테스트
 * 2026년 새 API 엔드포인트 기준
 */
import { fetchAllBenefits, fetchBenefitDetail } from '@/services/api/benefits';
import * as youthPolicyApi from '@/services/api/youth-policy';
import * as employment24Api from '@/services/api/employment24';

// API 모듈 모킹
jest.mock('@/services/api/youth-policy');
jest.mock('@/services/api/employment24');

const mockYouthPolicyApi = youthPolicyApi as jest.Mocked<typeof youthPolicyApi>;
const mockEmployment24Api = employment24Api as jest.Mocked<typeof employment24Api>;

describe('benefits 서비스', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 온통청년 API 모킹
    mockYouthPolicyApi.fetchYouthPolicyList.mockResolvedValue({
      items: [
        {
          bizId: 'R2024010100001',
          polyBizSjnm: '청년 취업 지원금',
          polyItcnCn: '청년 취업 지원 프로그램',
          sporCn: '월 50만원',
          cnsgNmor: '고용노동부',
          rqutPrdCn: '2024.01.01 ~ 2024.12.31',
          polyBizTy: '023010',
          polyBizSecd: '003001',
        },
      ],
      totalCount: 1,
      pageIndex: 1,
    });

    // 훈련과정 API 모킹 (새 API 형식)
    mockEmployment24Api.fetchTrainingCardList.mockResolvedValue({
      items: [
        {
          trprId: 'T001',
          trprNm: '웹개발 훈련과정',
          instNm: '테스트 훈련기관',
          trprDegr: '1',
          address: '서울 강남구',
          traStartDate: '2026-01-16',
          traEndDate: '2026-06-30',
          trainTarget: '국민내일배움카드(일반)',
          trainTargetCd: 'C0061',
          courseMan: '1000000',
          realMan: '1000000',
          telNo: '02-1234-5678',
          ncsCd: '20010201',
          titleLink: 'https://example.com/course',
          subTitleLink: 'https://example.com/inst',
        },
      ],
      totalCount: 1,
    });

    // 취업지원프로그램 API 모킹 (새 API 형식)
    mockEmployment24Api.fetchEmploymentProgramList.mockResolvedValue({
      items: [
        {
          pgmId: 'P001',
          pgmNm: '취업특강',
          pgmSubNm: '면접 준비 전략',
          orgNm: '서울고용센터',
          pgmTarget: '만 34세이하 청년',
          pgmStdt: '20260116',
          pgmEndt: '20260116',
          openTime: '14:00',
          operationTime: '2',
          openPlcCont: '서울고용센터 4층',
        },
      ],
      totalCount: 1,
    });
  });

  describe('fetchAllBenefits', () => {
    it('온통청년과 고용24 API를 병렬로 호출한다', async () => {
      const result = await fetchAllBenefits();

      expect(mockYouthPolicyApi.fetchYouthPolicyList).toHaveBeenCalledTimes(1);
      expect(mockEmployment24Api.fetchTrainingCardList).toHaveBeenCalledTimes(1);
      expect(mockEmployment24Api.fetchEmploymentProgramList).toHaveBeenCalledTimes(1);
    });

    it('온통청년 정책을 Benefit 모델로 정규화한다', async () => {
      const result = await fetchAllBenefits();

      const youthBenefit = result.items.find((b) => b.source === 'youth-policy');
      expect(youthBenefit).toBeDefined();
      expect(youthBenefit?.id).toBe('youth-policy-R2024010100001');
      expect(youthBenefit?.title).toBe('청년 취업 지원금');
      expect(youthBenefit?.category).toBe('employment');
    });

    it('훈련과정을 Benefit 모델로 정규화한다', async () => {
      const result = await fetchAllBenefits({ category: 'education' });

      const trainingBenefit = result.items.find((b) => b.id === 'employment24-training-T001');
      expect(trainingBenefit).toBeDefined();
      expect(trainingBenefit?.title).toBe('웹개발 훈련과정');
      expect(trainingBenefit?.organization).toBe('테스트 훈련기관');
      expect(trainingBenefit?.category).toBe('education');
    });

    it('취업지원프로그램을 Benefit 모델로 정규화한다', async () => {
      const result = await fetchAllBenefits();

      const programBenefit = result.items.find((b) => b.id === 'employment24-program-P001');
      expect(programBenefit).toBeDefined();
      expect(programBenefit?.title).toBe('면접 준비 전략');
      expect(programBenefit?.organization).toBe('서울고용센터');
      expect(programBenefit?.category).toBe('employment');
    });

    it('source 필터를 적용한다', async () => {
      await fetchAllBenefits({ source: 'youth-policy' });

      expect(mockYouthPolicyApi.fetchYouthPolicyList).toHaveBeenCalledTimes(1);
      expect(mockEmployment24Api.fetchTrainingCardList).not.toHaveBeenCalled();
    });

    it('category 필터를 적용한다', async () => {
      await fetchAllBenefits({ category: 'education' });

      // education 카테고리에서는 trainingCard만 호출
      expect(mockEmployment24Api.fetchTrainingCardList).toHaveBeenCalled();
      expect(mockEmployment24Api.fetchEmploymentProgramList).not.toHaveBeenCalled();
    });

    it('페이지네이션 파라미터를 전달한다', async () => {
      await fetchAllBenefits({ page: 2, pageSize: 20 });

      expect(mockYouthPolicyApi.fetchYouthPolicyList).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 2,
          display: 20,
        })
      );
    });

    it('일부 API 실패 시에도 다른 API 결과를 반환한다', async () => {
      mockYouthPolicyApi.fetchYouthPolicyList.mockRejectedValue(new Error('API 오류'));

      const result = await fetchAllBenefits();

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((b) => b.source === 'employment24')).toBe(true);
    });

    it('모든 API 실패 시 Mock 데이터를 반환한다', async () => {
      mockYouthPolicyApi.fetchYouthPolicyList.mockRejectedValue(new Error('API 오류'));
      mockEmployment24Api.fetchTrainingCardList.mockRejectedValue(new Error('API 오류'));
      mockEmployment24Api.fetchEmploymentProgramList.mockRejectedValue(new Error('API 오류'));

      const result = await fetchAllBenefits();

      // Mock 데이터가 반환됨
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].id).toContain('mock-');
    });

    it('결과에 페이지 정보를 포함한다', async () => {
      const result = await fetchAllBenefits({ page: 1, pageSize: 10 });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('fetchBenefitDetail', () => {
    beforeEach(() => {
      mockYouthPolicyApi.fetchYouthPolicyDetail.mockResolvedValue({
        bizId: 'R2024010100001',
        polyBizSjnm: '청년 취업 지원금',
        polyItcnCn: '상세 설명',
        sporCn: '월 50만원',
        cnsgNmor: '고용노동부',
        rqutPrdCn: '2024.01.01 ~ 2024.12.31',
        polyBizTy: '023010',
        polyBizSecd: '003001',
        polyBizSj: '정책 설명',
        sporScvl: '50만원',
        ageInfo: '만 18세 ~ 34세',
        accrRqisCn: '제한없음',
        splzRlmRqisCn: '',
        empmSttsCn: '미취업자',
        majrRqisCn: '',
        prcpCn: '중위소득 100% 이하',
        prcpLmttTrgtCn: '',
        rqutProcCn: '온라인 신청',
        jdgnPresCn: '서류심사',
        rqutUrla: 'https://example.com',
        etct: '',
        mngtMson: '고용노동부',
        mngtMsttNm: '02-1234-5678',
        rfcSiteUrla1: 'https://ref1.com',
        rfcSiteUrla2: '',
        lastModyYmd: '2024-01-01',
      });
    });

    it('온통청년 정책 상세를 조회한다', async () => {
      const result = await fetchBenefitDetail('youth-policy-R2024010100001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('youth-policy-R2024010100001');
      expect(result?.ageRequirement).toBe('만 18세 ~ 34세');
      expect(result?.applicationUrl).toBe('https://example.com');
    });

    it('Mock 혜택 상세를 조회한다', async () => {
      const result = await fetchBenefitDetail('mock-youth-policy-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('mock-youth-policy-1');
    });

    it('고용24 상세 조회는 null을 반환한다', async () => {
      const result = await fetchBenefitDetail('employment24-training-T001');

      expect(result).toBeNull();
    });

    it('잘못된 ID 형식에 대해 null을 반환한다', async () => {
      const result = await fetchBenefitDetail('invalid-format');

      expect(result).toBeNull();
    });
  });
});
