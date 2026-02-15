<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="pill">{{ categoryLabel(benefit.category) }}</span>
      <span class="badge">{{ statusLabel(benefit.status) }}</span>
    </div>
    <h4 style="margin: 8px 0;">{{ benefit.title }}</h4>
    <p style="color: var(--muted); margin: 0;">{{ benefit.description.slice(0, 90) }}...</p>
    <RouterLink class="btn btn-primary" style="margin-top: 12px; display: inline-block;" :to="`/benefits/${benefit.id}`">
      상세 보기
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Benefit } from '../services/api';

const props = defineProps<{ benefit: Benefit }>();

const categoryLabel = (value: string) => {
  const labels: Record<string, string> = {
    employment: '일자리',
    housing: '주거',
    education: '교육',
    welfare: '복지',
    finance: '금융',
    culture: '문화',
  };
  return labels[value] ?? value;
};

const statusLabel = (status: string) => {
  if (status === 'active') return '접수중';
  if (status === 'ended') return '마감';
  return '확인중';
};

void props;
</script>
