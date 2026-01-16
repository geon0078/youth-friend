/**
 * BenefitDetail 컴포넌트 테스트
 * Story 3.7: 혜택 상세 화면
 */
import { render, screen } from '@testing-library/react-native';
import { BenefitDetail } from '@/components/benefits/BenefitDetail';
import type { BenefitDetail as BenefitDetailType } from '@/types';

// 날짜 모킹
const mockToday = new Date('2026-01-16');
jest.useFakeTimers().setSystemTime(mockToday);

describe('BenefitDetail', () => {
  const mockBenefit: BenefitDetailType = {
    id: 'youth-policy-001',
    originalId: '001',
    source: 'youth-policy',
    title: '청년 취업 지원금',
    description: '청년들의 취업을 돕기 위한 지원금입니다.',
    category: 'employment',
    organization: '서울시청 청년정책과',
    amount: 5000000,
    supportContent: '월 50만원 × 10개월',
    requirements: ['만 19~34세 청년', '서울시 거주자', '소득 기준 충족'],
    startDate: '2026-01-01',
    deadline: '2026-03-31',
    applicationMethod: '온라인 신청 (복지로)',
    contactInfo: '02-1234-5678',
    status: 'active',
  };

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('AC1: 혜택 제목, 설명 표시', () => {
    it('혜택 제목이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('청년 취업 지원금')).toBeTruthy();
    });

    it('혜택 설명이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(
        screen.getByText('청년들의 취업을 돕기 위한 지원금입니다.')
      ).toBeTruthy();
    });

    it('기관명이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      // 기관명은 헤더와 신청 방법 섹션 두 곳에 표시될 수 있음
      expect(screen.getAllByText('서울시청 청년정책과').length).toBeGreaterThanOrEqual(1);
    });

    it('카테고리가 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('취업')).toBeTruthy();
    });
  });

  describe('AC2: 지원 금액/내용 상세 표시', () => {
    it('지원 금액이 포맷팅되어 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      // 약 5백만원 또는 formatCurrency 결과
      // 금액 관련 텍스트가 표시되는지 확인 (5백만원, 50만원 등)
      expect(screen.getAllByText(/만원/).length).toBeGreaterThanOrEqual(1);
    });

    it('지원 내용 섹션이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('지원 내용')).toBeTruthy();
    });
  });

  describe('AC3: 자격 요건 목록 표시', () => {
    it('자격 요건 섹션이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('자격 요건')).toBeTruthy();
    });

    it('모든 요건 항목이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      mockBenefit.requirements.forEach((requirement) => {
        expect(screen.getByText(requirement)).toBeTruthy();
      });
    });
  });

  describe('AC4: 신청 기간 표시', () => {
    it('신청 기간 섹션이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('신청 기간')).toBeTruthy();
    });

    it('시작일과 종료일이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('1월 1일 ~ 3월 31일')).toBeTruthy();
    });
  });

  describe('AC5: 신청 방법 안내 표시', () => {
    it('신청 방법 섹션이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('신청 방법')).toBeTruthy();
    });

    it('신청 방법이 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('온라인 신청 (복지로)')).toBeTruthy();
    });

    it('연락처가 표시된다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByText('02-1234-5678')).toBeTruthy();
    });
  });

  describe('접근성', () => {
    it('헤더 섹션에 접근성 라벨이 있다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(
        screen.getByLabelText(/청년 취업 지원금, 취업 카테고리/)
      ).toBeTruthy();
    });

    it('지원 내용 섹션에 접근성 라벨이 있다', () => {
      render(<BenefitDetail benefit={mockBenefit} />);

      expect(screen.getByLabelText(/지원 내용:/)).toBeTruthy();
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      render(<BenefitDetail benefit={mockBenefit} colorScheme="light" />);

      expect(screen.getByText('청년 취업 지원금')).toBeTruthy();
    });

    it('dark 모드에서 렌더링된다', () => {
      render(<BenefitDetail benefit={mockBenefit} colorScheme="dark" />);

      expect(screen.getByText('청년 취업 지원금')).toBeTruthy();
    });
  });

  describe('옵셔널 필드 처리', () => {
    it('설명이 빈 문자열이면 설명 섹션이 표시되지 않는다', () => {
      const benefitWithoutDescription = {
        ...mockBenefit,
        description: '',
      };
      render(<BenefitDetail benefit={benefitWithoutDescription} />);

      expect(screen.queryByText('상세 설명')).toBeNull();
    });

    it('신청 방법이 없으면 신청 방법 섹션이 표시되지 않는다', () => {
      const benefitWithoutMethod = {
        ...mockBenefit,
        applicationMethod: undefined,
        contactInfo: undefined,
      };
      render(<BenefitDetail benefit={benefitWithoutMethod} />);

      // 신청 방법 섹션이 조건부로 렌더링되므로 없어야 함
      // (organization만 있으면 표시되지만 다 없으면 표시 안 됨)
      expect(screen.queryByText('온라인 신청 (복지로)')).toBeNull();
    });
  });
});
