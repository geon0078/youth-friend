/**
 * 원화 금액 포맷팅 유틸리티
 * 큰 금액을 읽기 쉬운 한국어 단위로 변환
 */

/**
 * 금액을 한국어 단위로 포맷팅
 * @param amount - 금액 (원)
 * @returns 포맷팅된 문자열
 *
 * @example
 * formatCurrency(12000000) // "약 1,2백만원"
 * formatCurrency(150000000) // "약 1억 5천만원"
 * formatCurrency(5000) // "5,000원"
 * formatCurrency(10000000) // "약 1천만원"
 */
export function formatCurrency(amount: number): string {
  if (amount <= 0) {
    return '0원';
  }

  // 1억 이상
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    const cheonman = Math.floor(remainder / 10000000);

    if (cheonman > 0) {
      return `약 ${eok.toLocaleString()}억 ${cheonman.toLocaleString()}천만원`;
    }
    return `약 ${eok.toLocaleString()}억원`;
  }

  // 1천만원 이상
  if (amount >= 10000000) {
    const cheonman = Math.floor(amount / 10000000);
    const remainder = amount % 10000000;
    const man = Math.floor(remainder / 10000);

    if (man >= 100) {
      return `약 ${cheonman.toLocaleString()},${Math.floor(man / 100).toLocaleString()}백만원`;
    }
    return `약 ${cheonman.toLocaleString()}천만원`;
  }

  // 1만원 이상
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    return `약 ${man.toLocaleString()}만원`;
  }

  // 1만원 미만
  return `${amount.toLocaleString()}원`;
}

/**
 * 혜택 개수 포맷팅
 * @param count - 혜택 개수
 * @returns 포맷팅된 문자열
 *
 * @example
 * formatBenefitCount(12) // "12개 혜택"
 * formatBenefitCount(0) // "0개 혜택"
 */
export function formatBenefitCount(count: number): string {
  return `${count.toLocaleString()}개 혜택`;
}
