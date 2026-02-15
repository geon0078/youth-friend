<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card">
      <h2 style="margin-top: 0;">프로필</h2>
      <div v-if="profileStore.isLoading">불러오는 중...</div>
      <div v-else>
        <p><strong>출생연도:</strong> {{ profileStore.profile?.birth_year || '-' }}</p>
        <p><strong>지역:</strong> {{ profileStore.profile?.region || '-' }}</p>
        <p><strong>소득:</strong> {{ formatIncome(profileStore.profile?.income_level) }}</p>
        <p><strong>고용:</strong> {{ formatEmployment(profileStore.profile?.employment_status) }}</p>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top: 0;">설정</h3>
      <div class="nav" style="margin-top: 12px;">
        <RouterLink class="btn btn-secondary" to="/profile/edit">프로필 수정</RouterLink>
        <RouterLink class="btn" to="/settings/notifications">알림 설정</RouterLink>
        <RouterLink class="btn" to="/settings/accessibility">접근성 설정</RouterLink>
      </div>
      <button class="btn" style="margin-top: 12px;" @click="resetAll">데이터 삭제</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { api, type UserProfile } from '../services/api';
import { useProfileStore } from '../stores/profile';

const profileStore = useProfileStore();

onMounted(() => {
  profileStore.load();
});

const resetAll = async () => {
  const confirmReset = window.confirm('모든 데이터를 삭제하시겠습니까?');
  if (!confirmReset) return;
  await api.resetAll();
  localStorage.clear();
  await profileStore.load();
  window.location.href = '/welcome';
};

const incomeLabels: Record<NonNullable<UserProfile['income_level']>, string> = {
  below50: '중위소득 50% 이하',
  '50to100': '중위소득 50~100%',
  '100to150': '중위소득 100~150%',
  above150: '중위소득 150% 이상',
};

const employmentLabels: Record<NonNullable<UserProfile['employment_status']>, string> = {
  employed: '재직 중',
  unemployed: '구직 중',
  student: '학생',
  'self-employed': '자영업',
  'part-time': '아르바이트',
};

const formatIncome = (value?: UserProfile['income_level'] | null) => {
  if (!value) return '-';
  return incomeLabels[value] ?? value;
};

const formatEmployment = (value?: UserProfile['employment_status'] | null) => {
  if (!value) return '-';
  return employmentLabels[value] ?? value;
};
</script>
