<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;">
      <button class="btn" @click="goBack">←</button>
      <span class="pill">2 / 3</span>
      <button class="btn" @click="skip">건너뛰기</button>
    </header>

    <div style="flex: 1; overflow-y: auto;">
      <h2 style="margin-bottom: 4px;">경제 정보를 알려주세요</h2>
      <p style="color: var(--muted); margin-top: 0;">더 정확한 혜택 매칭을 위해 활용됩니다</p>
      <p style="color: var(--accent); font-size: 12px;">* 선택 사항입니다. 건너뛰어도 됩니다.</p>

      <div class="card" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">소득수준</h3>
        <p class="pill">{{ incomeLabel }}</p>
        <div class="grid" style="margin-top: 12px;">
          <button
            v-for="item in incomeOptions"
            :key="item.value"
            :class="['chip', { active: incomeLevel === item.value }]"
            style="text-align: left;"
            @click="toggleIncome(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">취업상태</h3>
        <p class="pill">{{ employmentLabel }}</p>
        <div class="chip-grid" style="margin-top: 12px;">
          <button
            v-for="item in employmentOptions"
            :key="item.value"
            :class="['chip', { active: employmentStatus === item.value }]"
            @click="toggleEmployment(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <div style="padding: 16px 0;">
      <button class="btn btn-primary" style="width: 100%;" @click="next">다음</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '../stores/onboarding';

type IncomeLevel = 'below50' | '50to100' | '100to150' | 'above150';
type EmploymentStatus = 'employed' | 'unemployed' | 'student' | 'self-employed' | 'part-time';

const router = useRouter();
const store = useOnboardingStore();

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

const incomeLevel = computed(() => store.incomeLevel);
const employmentStatus = computed(() => store.employmentStatus);

const incomeLabel = computed(() => {
  const found = incomeOptions.find((item) => item.value === incomeLevel.value);
  return found?.label ?? '가구 소득 기준으로 선택해주세요';
});

const employmentLabel = computed(() => {
  const found = employmentOptions.find((item) => item.value === employmentStatus.value);
  return found?.label ?? '현재 취업 상태를 선택해주세요';
});

const toggleIncome = (value: IncomeLevel) => {
  store.setIncomeLevel(incomeLevel.value === value ? null : value);
};

const toggleEmployment = (value: EmploymentStatus) => {
  store.setEmploymentStatus(employmentStatus.value === value ? null : value);
};

const goBack = () => {
  router.back();
};

const skip = () => {
  router.push('/onboarding/step3');
};

const next = () => {
  router.push('/onboarding/step3');
};
</script>
