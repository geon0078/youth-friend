<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;">
      <button class="btn" @click="goBack">←</button>
      <span class="pill">1 / 3</span>
      <span style="width: 44px;"></span>
    </header>

    <div style="flex: 1; overflow-y: auto;">
      <h2 style="margin-bottom: 4px;">기본 정보를 알려주세요</h2>
      <p style="color: var(--muted); margin-top: 0;">맞춤 혜택을 추천해 드릴게요</p>

      <div class="card" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">출생년도</h3>
        <p class="pill">{{ birthYear ? `만 ${currentYear - birthYear}세` : '태어난 연도를 선택해주세요' }}</p>
        <div class="chip-grid" style="margin-top: 12px; max-height: 220px; overflow-y: auto;">
          <button
            v-for="year in birthYears"
            :key="year"
            :class="['chip', { active: birthYear === year }]"
            @click="setBirthYear(year)"
          >
            {{ year }}년
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">거주 지역</h3>
        <p class="pill">{{ region ?? '거주하는 지역을 선택해주세요' }}</p>
        <div class="chip-grid" style="margin-top: 12px;">
          <button
            v-for="item in regions"
            :key="item"
            :class="['chip', { active: region === item }]"
            @click="setRegion(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>

    <div style="padding: 16px 0;">
      <button class="btn btn-primary" style="width: 100%;" :disabled="!isValid" @click="next">
        다음
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '../stores/onboarding';

const router = useRouter();
const store = useOnboardingStore();

const currentYear = 2026;
const birthYears = Array.from({ length: 2007 - 1991 + 1 }, (_, idx) => 2007 - idx);
const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const birthYear = computed(() => store.birthYear);
const region = computed(() => store.region);
const isValid = computed(() => Boolean(store.birthYear && store.region));

const setBirthYear = (year: number) => {
  store.setBirthYear(year);
};

const setRegion = (value: string) => {
  store.setRegion(value);
};

const goBack = () => {
  router.back();
};

const next = () => {
  if (!isValid.value) return;
  router.push('/onboarding/step2');
};
</script>
