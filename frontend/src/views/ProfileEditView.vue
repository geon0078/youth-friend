<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;">
      <button class="btn" @click="goBack">←</button>
      <span class="pill">프로필 수정</span>
      <span style="width: 44px;"></span>
    </header>

    <div style="flex: 1; overflow-y: auto;">
      <div class="card">
        <h3 style="margin-top: 0;">출생년도</h3>
        <div class="chip-grid" style="max-height: 220px; overflow-y: auto;">
          <button v-for="year in birthYears" :key="year" :class="['chip', { active: form.birth_year === year }]" @click="form.birth_year = year">
            {{ year }}년
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h3 style="margin-top: 0;">거주 지역</h3>
        <div class="chip-grid">
          <button v-for="item in regions" :key="item" :class="['chip', { active: form.region === item }]" @click="form.region = item">
            {{ item }}
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h3 style="margin-top: 0;">소득수준</h3>
        <div class="grid">
          <button v-for="item in incomeOptions" :key="item.value" :class="['chip', { active: form.income_level === item.value }]" @click="toggleIncome(item.value)">
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h3 style="margin-top: 0;">취업상태</h3>
        <div class="chip-grid">
          <button v-for="item in employmentOptions" :key="item.value" :class="['chip', { active: form.employment_status === item.value }]" @click="toggleEmployment(item.value)">
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <div style="padding: 16px 0;">
      <button class="btn btn-primary" style="width: 100%;" @click="save">저장</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { useProfileStore } from '../stores/profile';

type IncomeLevel = 'below50' | '50to100' | '100to150' | 'above150';
type EmploymentStatus = 'employed' | 'unemployed' | 'student' | 'self-employed' | 'part-time';

const router = useRouter();
const profileStore = useProfileStore();
const currentYear = 2026;
const birthYears = Array.from({ length: 2007 - 1991 + 1 }, (_, idx) => 2007 - idx);
const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const incomeOptions: { value: IncomeLevel; label: string }[] = [
  { value: 'below50', label: '중위소득 50% 이하' },
  { value: '50to100', label: '중위소득 50~100%' },
  { value: '100to150', label: '중위소득 100~150%' },
  { value: 'above150', label: '중위소득 150% 이상' },
];

const employmentOptions: { value: EmploymentStatus; label: string }[] = [
  { value: 'employed', label: '재직 중' },
  { value: 'unemployed', label: '구직 중' },
  { value: 'student', label: '학생' },
  { value: 'self-employed', label: '자영업' },
  { value: 'part-time', label: '아르바이트' },
];

const form = reactive({
  birth_year: currentYear - 25,
  region: '서울',
  income_level: null as IncomeLevel | null,
  employment_status: null as EmploymentStatus | null,
  marketing_opt_in: false,
});

onMounted(async () => {
  await profileStore.load();
  if (profileStore.profile) {
    form.birth_year = profileStore.profile.birth_year ?? form.birth_year;
    form.region = profileStore.profile.region ?? form.region;
    form.income_level = profileStore.profile.income_level ?? null;
    form.employment_status = profileStore.profile.employment_status ?? null;
    form.marketing_opt_in = profileStore.profile.marketing_opt_in;
  }
});

const toggleIncome = (value: IncomeLevel) => {
  form.income_level = form.income_level === value ? null : value;
};

const toggleEmployment = (value: EmploymentStatus) => {
  form.employment_status = form.employment_status === value ? null : value;
};

const save = async () => {
  await api.saveProfile(form);
  await profileStore.load();
  router.back();
};

const goBack = () => {
  router.back();
};
</script>
