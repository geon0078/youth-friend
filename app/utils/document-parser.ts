/**
 * 서류 파싱 유틸리티
 * Story 5.2: Implement Document List Display
 *
 * 혜택 정보에서 필요 서류를 추출하거나 추천
 */
import type { BenefitDetail, BenefitCategory } from '@/types/models/benefit';
import type { RequiredDocument } from '@/types/models/application';
import { COMMON_DOCUMENTS, findCommonDocument } from '@/types/models/application';

/**
 * 카테고리별 기본 서류 매핑
 */
const CATEGORY_DOCUMENTS: Record<BenefitCategory, string[]> = {
  employment: [
    'resident-register',
    'income-certificate',
    'employment-certificate',
    'unemployment-certificate',
    'bank-account',
  ],
  housing: [
    'resident-register',
    'income-certificate',
    'family-relation',
    'bank-account',
  ],
  education: [
    'resident-register',
    'income-certificate',
    'bank-account',
  ],
  welfare: [
    'resident-register',
    'income-certificate',
    'health-insurance',
    'family-relation',
    'bank-account',
  ],
  culture: [
    'resident-register',
    'bank-account',
  ],
  finance: [
    'resident-register',
    'income-certificate',
    'bank-account',
  ],
};

/**
 * 키워드 기반 서류 매핑
 */
const KEYWORD_DOCUMENTS: Record<string, string[]> = {
  소득: ['income-certificate'],
  취업: ['employment-certificate', 'unemployment-certificate'],
  재직: ['employment-certificate'],
  구직: ['unemployment-certificate'],
  주거: ['resident-register', 'family-relation'],
  가족: ['family-relation'],
  건강: ['health-insurance'],
  보험: ['health-insurance'],
};

/**
 * 혜택 정보에서 필요 서류 목록 추출
 */
export function parseDocumentsFromBenefit(
  benefit: BenefitDetail
): RequiredDocument[] {
  const documentIds = new Set<string>();

  // 1. 카테고리 기본 서류 추가
  const categoryDocs = CATEGORY_DOCUMENTS[benefit.category] || [];
  categoryDocs.forEach((id) => documentIds.add(id));

  // 2. 신청 방법 텍스트에서 서류 키워드 추출
  const textToSearch = [
    benefit.applicationMethod,
    benefit.requirements?.join(' '),
    benefit.additionalInfo,
    benefit.incomeRequirement,
    benefit.employmentRequirement,
  ]
    .filter(Boolean)
    .join(' ');

  Object.entries(KEYWORD_DOCUMENTS).forEach(([keyword, docIds]) => {
    if (textToSearch.includes(keyword)) {
      docIds.forEach((id) => documentIds.add(id));
    }
  });

  // 3. 서류 객체로 변환
  const documents: RequiredDocument[] = [];

  // 필수 서류 먼저
  const requiredIds = ['resident-register', 'bank-account'];
  const sortedIds = [...documentIds].sort((a, b) => {
    const aRequired = requiredIds.includes(a);
    const bRequired = requiredIds.includes(b);
    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;
    return 0;
  });

  sortedIds.forEach((id) => {
    const doc = findCommonDocument(id);
    if (doc) {
      // 필수 여부 조정: 카테고리 기본 서류 중 첫 2개는 필수
      const isRequired = requiredIds.includes(id) || categoryDocs.slice(0, 2).includes(id);
      documents.push({
        ...doc,
        required: isRequired,
      });
    }
  });

  return documents;
}

/**
 * 텍스트에서 직접 언급된 서류명 추출
 */
export function extractDocumentMentions(text: string): string[] {
  if (!text) return [];

  const documentPatterns = [
    /주민등록등본/g,
    /소득금액증명원/g,
    /건강보험자격득실확인서/g,
    /재직증명서/g,
    /구직등록확인증/g,
    /가족관계증명서/g,
    /통장사본/g,
    /졸업증명서/g,
    /재학증명서/g,
    /사업자등록증/g,
    /납세증명서/g,
    /건강보험료 납부확인서/g,
  ];

  const mentions: string[] = [];
  documentPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!mentions.includes(match)) {
          mentions.push(match);
        }
      });
    }
  });

  return mentions;
}

/**
 * 서류 발급 우선순위 정보
 */
export interface DocumentPriority {
  documentId: string;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

/**
 * 서류 준비 우선순위 계산
 */
export function calculateDocumentPriority(
  documents: RequiredDocument[]
): DocumentPriority[] {
  return documents.map((doc) => {
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let reason: string | undefined;

    if (doc.required) {
      priority = 'high';
      reason = '필수 서류';
    } else if (doc.validityDays && doc.validityDays <= 30) {
      priority = 'high';
      reason = '유효기간이 짧아 신청 직전 발급 권장';
    } else if (doc.issuanceMethod === 'online') {
      priority = 'low';
      reason = '온라인으로 즉시 발급 가능';
    }

    return {
      documentId: doc.id,
      priority,
      reason,
    };
  });
}
