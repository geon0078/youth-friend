<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card">
      <h2 style="margin-top: 0;">데이터 & 로드맵</h2>
      <p style="color: var(--muted);">
        청년친구 앱은 공공 Open API를 바탕으로 데이터를 수집하고, 주간 로드맵을 통해 구현을 진행합니다.
      </p>
    </div>
    <div class="card">
      <h3 style="margin-top: 0;">주요 데이터 소스</h3>
      <div class="grid" style="margin-top: 12px;">
        <div v-for="source in apiSources" :key="source.name" class="card">
          <strong>{{ source.name }}</strong>
          <p style="color: var(--muted);">{{ source.description }}</p>
          <span class="pill">{{ source.sync }}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top: 0;">개발 로드맵 (4주)</h3>
      <div class="grid" style="margin-top: 12px;">
        <div v-for="item in roadmap" :key="item" class="card" style="display: flex; gap: 12px; align-items: center;">
          <span class="badge">{{ roadmap.indexOf(item) + 1 }}</span>
          <span>{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const apiSources = [
  {
    name: '정부24 청년정책 통합공고',
    description: '전국 단위 청년정책 공고 데이터를 Open API로 제공합니다.',
    sync: '매일 02:00 동기화',
  },
  {
    name: '서울시 열린데이터광장',
    description: '지역별 주거·교육·생활 지원 공고를 태그 기반으로 수집합니다.',
    sync: '3시간 간격 스케줄러',
  },
  {
    name: '고용노동부 청년센터',
    description: '취업 연계, 면접 지원비, 멘토링 프로그램 API.',
    sync: '실시간 이벤트 Webhook 준비 중',
  },
];

const roadmap = [
  'Week 1: Expo + TypeScript 기반 앱 골격 구축 및 온보딩 UI',
  'Week 2: Open API 데이터 파이프라인 정규화, 홈 피드 연결',
  'Week 3: 알림/마감 이벤트, 신청 체크리스트 저장소',
  'Week 4: 베타 배포 및 지자체 제휴 스폰서 실험',
];
</script>
