/**
 * 혜택 데이터 통계 분석 스크립트
 *
 * 실행: node scripts/analyze-benefits.js
 */

const API_KEY = process.env.EXPO_PUBLIC_YOUTH_POLICY_API_KEY || '';
const BASE_URL = 'https://www.youthcenter.go.kr/go/ythip';

// 금액 파싱 함수
function parseAmount(text) {
  if (!text) return null;

  let maxAmount = 0;

  // 만원 단위
  const manwonMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*만\s*원/g);
  for (const match of manwonMatches) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    maxAmount = Math.max(maxAmount, num * 10000);
  }

  // 천원 단위
  const cheonwonMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*천\s*원/g);
  for (const match of cheonwonMatches) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    maxAmount = Math.max(maxAmount, num * 1000);
  }

  return maxAmount > 0 ? maxAmount : null;
}

// 마감일 파싱 함수
function parseDeadline(deadline) {
  if (!deadline) return { type: 'unknown', daysLeft: null };

  const str = String(deadline);
  if (str.includes('상시') || str.includes('수시')) {
    return { type: 'ongoing', daysLeft: null };
  }

  const dateMatch = str.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (dateMatch) {
    const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'ended', daysLeft: diffDays };
    return { type: 'active', daysLeft: diffDays };
  }

  return { type: 'unknown', daysLeft: null };
}

// API 호출 함수
async function fetchPolicies(pageNum = 1, pageSize = 100) {
  const url = `${BASE_URL}/getPlcy?apiKeyNm=${API_KEY}&rtnType=json&pageNum=${pageNum}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// 모든 데이터 가져오기
async function fetchAllPolicies() {
  console.log('📡 API 데이터 수집 시작...\n');

  const firstPage = await fetchPolicies(1, 100);
  const totalCount = firstPage.result.pagging.totCount;
  const totalPages = Math.ceil(totalCount / 100);

  console.log(`총 ${totalCount}개 정책, ${totalPages} 페이지`);

  let allPolicies = [...firstPage.result.youthPolicyList];

  for (let page = 2; page <= totalPages; page++) {
    process.stdout.write(`\r페이지 ${page}/${totalPages} 수집 중...`);
    await new Promise(r => setTimeout(r, 300)); // Rate limiting

    try {
      const data = await fetchPolicies(page, 100);
      allPolicies = allPolicies.concat(data.result.youthPolicyList);
    } catch (error) {
      console.error(`\n페이지 ${page} 실패:`, error.message);
    }
  }

  console.log(`\n\n✅ 총 ${allPolicies.length}개 정책 수집 완료\n`);
  return allPolicies;
}

// 통계 분석
function analyzeData(policies) {
  const stats = {
    total: policies.length,
    byCategory: {},
    byRegion: {},
    byDeadlineType: {},
    amountStats: {
      withAmount: 0,
      withoutAmount: 0,
      totalAmount: 0,
      avgAmount: 0,
      minAmount: Infinity,
      maxAmount: 0,
      distribution: {
        'under50만': 0,
        '50-100만': 0,
        '100-500만': 0,
        '500-1000만': 0,
        'over1000만': 0,
      }
    },
    deadlineStats: {
      urgent7Days: 0,
      within30Days: 0,
      within90Days: 0,
      ongoing: 0,
      ended: 0,
      unknown: 0,
    },
    ageStats: {
      withAge: 0,
      withoutAge: 0,
      ageRanges: {},
    },
    fieldCompleteness: {},
  };

  // 필드 완성도 초기화
  const fields = ['plcyNm', 'plcyExplnCn', 'plcySprtCn', 'lclsfNm', 'bizPrdEndYmd',
                  'sprtTrgtMinAge', 'sprtTrgtMaxAge', 'aplyUrlAddr', 'operInstCdNm'];
  fields.forEach(f => stats.fieldCompleteness[f] = 0);

  for (const policy of policies) {
    // 카테고리별 분포
    const category = policy.lclsfNm || '미분류';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // 지역별 분포
    const region = policy.rgtrInstCdNm || policy.zipCd || '미분류';
    const regionKey = extractRegion(region);
    stats.byRegion[regionKey] = (stats.byRegion[regionKey] || 0) + 1;

    // 금액 분석
    const amount = parseAmount(policy.plcySprtCn) || parseAmount(policy.plcyExplnCn);
    if (amount) {
      stats.amountStats.withAmount++;
      stats.amountStats.totalAmount += amount;
      stats.amountStats.minAmount = Math.min(stats.amountStats.minAmount, amount);
      stats.amountStats.maxAmount = Math.max(stats.amountStats.maxAmount, amount);

      // 금액 분포
      if (amount < 500000) stats.amountStats.distribution['under50만']++;
      else if (amount < 1000000) stats.amountStats.distribution['50-100만']++;
      else if (amount < 5000000) stats.amountStats.distribution['100-500만']++;
      else if (amount < 10000000) stats.amountStats.distribution['500-1000만']++;
      else stats.amountStats.distribution['over1000만']++;
    } else {
      stats.amountStats.withoutAmount++;
    }

    // 마감일 분석
    const deadline = parseDeadline(policy.bizPrdEndYmd || policy.aplyYmd);
    stats.byDeadlineType[deadline.type] = (stats.byDeadlineType[deadline.type] || 0) + 1;

    if (deadline.type === 'active') {
      if (deadline.daysLeft <= 7) stats.deadlineStats.urgent7Days++;
      if (deadline.daysLeft <= 30) stats.deadlineStats.within30Days++;
      if (deadline.daysLeft <= 90) stats.deadlineStats.within90Days++;
    } else if (deadline.type === 'ongoing') {
      stats.deadlineStats.ongoing++;
    } else if (deadline.type === 'ended') {
      stats.deadlineStats.ended++;
    } else {
      stats.deadlineStats.unknown++;
    }

    // 나이 분석
    const minAge = parseInt(policy.sprtTrgtMinAge) || 0;
    const maxAge = parseInt(policy.sprtTrgtMaxAge) || 0;
    if (minAge > 0 || maxAge > 0) {
      stats.ageStats.withAge++;
      const ageRange = `${minAge}-${maxAge}세`;
      stats.ageStats.ageRanges[ageRange] = (stats.ageStats.ageRanges[ageRange] || 0) + 1;
    } else {
      stats.ageStats.withoutAge++;
    }

    // 필드 완성도
    for (const field of fields) {
      if (policy[field] && String(policy[field]).trim()) {
        stats.fieldCompleteness[field]++;
      }
    }
  }

  // 평균 계산
  if (stats.amountStats.withAmount > 0) {
    stats.amountStats.avgAmount = Math.round(stats.amountStats.totalAmount / stats.amountStats.withAmount);
  }
  if (stats.amountStats.minAmount === Infinity) {
    stats.amountStats.minAmount = 0;
  }

  return stats;
}

// 지역명 추출
function extractRegion(text) {
  const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
                   '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

  for (const region of regions) {
    if (text.includes(region)) return region;
  }

  if (text.includes('중앙') || text.includes('부') || text.includes('처') ||
      text.includes('청') || text.includes('공단') || text.includes('진흥원')) {
    return '중앙부처';
  }

  return '기타';
}

// 결과 출력
function printReport(stats) {
  console.log('═'.repeat(60));
  console.log('📊 청년 혜택 데이터 통계 분석 리포트');
  console.log('═'.repeat(60));

  console.log(`\n📌 전체 현황`);
  console.log(`   총 정책 수: ${stats.total.toLocaleString()}개`);

  console.log(`\n📂 카테고리별 분포`);
  const sortedCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCategories) {
    const pct = ((count / stats.total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct / 2));
    console.log(`   ${cat.padEnd(12)} ${String(count).padStart(5)}개 (${pct.padStart(5)}%) ${bar}`);
  }

  console.log(`\n🗺️  지역별 분포`);
  const sortedRegions = Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1]);
  for (const [region, count] of sortedRegions.slice(0, 10)) {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`   ${region.padEnd(8)} ${String(count).padStart(5)}개 (${pct.padStart(5)}%)`);
  }

  console.log(`\n💰 금액 정보 분석`);
  const amtPct = ((stats.amountStats.withAmount / stats.total) * 100).toFixed(1);
  console.log(`   금액 정보 있음: ${stats.amountStats.withAmount.toLocaleString()}개 (${amtPct}%)`);
  console.log(`   금액 정보 없음: ${stats.amountStats.withoutAmount.toLocaleString()}개`);
  console.log(`   총 추정 금액: ${(stats.amountStats.totalAmount / 10000).toLocaleString()}만원`);
  console.log(`   평균 금액: ${(stats.amountStats.avgAmount / 10000).toLocaleString()}만원`);
  console.log(`   최소 금액: ${(stats.amountStats.minAmount / 10000).toLocaleString()}만원`);
  console.log(`   최대 금액: ${(stats.amountStats.maxAmount / 10000).toLocaleString()}만원`);

  console.log(`\n   금액 분포:`);
  for (const [range, count] of Object.entries(stats.amountStats.distribution)) {
    const pct = ((count / stats.amountStats.withAmount) * 100).toFixed(1);
    console.log(`   ${range.padEnd(12)} ${String(count).padStart(4)}개 (${pct.padStart(5)}%)`);
  }

  console.log(`\n📅 마감일 분석`);
  console.log(`   7일 내 마감: ${stats.deadlineStats.urgent7Days}개`);
  console.log(`   30일 내 마감: ${stats.deadlineStats.within30Days}개`);
  console.log(`   90일 내 마감: ${stats.deadlineStats.within90Days}개`);
  console.log(`   상시 모집: ${stats.deadlineStats.ongoing}개`);
  console.log(`   마감됨: ${stats.deadlineStats.ended}개`);
  console.log(`   정보 없음: ${stats.deadlineStats.unknown}개`);

  console.log(`\n👤 나이 정보 분석`);
  const agePct = ((stats.ageStats.withAge / stats.total) * 100).toFixed(1);
  console.log(`   나이 정보 있음: ${stats.ageStats.withAge}개 (${agePct}%)`);
  console.log(`   나이 정보 없음: ${stats.ageStats.withoutAge}개`);

  console.log(`\n   주요 나이 범위:`);
  const sortedAges = Object.entries(stats.ageStats.ageRanges).sort((a, b) => b[1] - a[1]);
  for (const [range, count] of sortedAges.slice(0, 5)) {
    console.log(`   ${range.padEnd(12)} ${count}개`);
  }

  console.log(`\n📋 필드 완성도`);
  const fieldNames = {
    plcyNm: '정책명',
    plcyExplnCn: '정책설명',
    plcySprtCn: '지원내용',
    lclsfNm: '카테고리',
    bizPrdEndYmd: '마감일',
    sprtTrgtMinAge: '최소나이',
    sprtTrgtMaxAge: '최대나이',
    aplyUrlAddr: '신청URL',
    operInstCdNm: '운영기관',
  };

  for (const [field, count] of Object.entries(stats.fieldCompleteness)) {
    const pct = ((count / stats.total) * 100).toFixed(1);
    const name = fieldNames[field] || field;
    console.log(`   ${name.padEnd(10)} ${pct.padStart(5)}%`);
  }

  console.log('\n' + '═'.repeat(60));
}

// 메인 실행
async function main() {
  try {
    if (!API_KEY) {
      console.error('❌ API 키가 설정되지 않았습니다.');
      console.log('   .env 파일에 EXPO_PUBLIC_YOUTH_POLICY_API_KEY를 설정하세요.');
      process.exit(1);
    }

    const policies = await fetchAllPolicies();
    const stats = analyzeData(policies);
    printReport(stats);

    // JSON으로 저장 (선택)
    const fs = require('fs');
    fs.writeFileSync('benefit-stats.json', JSON.stringify(stats, null, 2));
    console.log('\n📁 통계 데이터가 benefit-stats.json에 저장되었습니다.');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
