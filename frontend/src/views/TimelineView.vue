<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card">
      <h2 style="margin-top: 0;">나이별 혜택</h2>
      <p style="color: var(--muted);">{{ currentAge }}세부터 34세까지 받을 수 있는 혜택을 확인하세요</p>
    </div>
    <div class="card">
      <label style="display: flex; justify-content: space-between; align-items: center;">
        <span>{{ age }}세 혜택</span>
        <span class="pill">{{ filtered.length }}개</span>
      </label>
      <input v-model.number="age" type="range" min="19" max="34" />
    </div>
    <div v-if="filtered.length === 0" class="card">{{ age }}세에 받을 수 있는 혜택이 없습니다.</div>
    <div v-else class="grid two-col">
      <article v-for="benefit in filtered" :key="benefit.id" class="card">
        <h3>{{ benefit.title }}</h3>
        <p style="color: var(--muted);">{{ benefit.description.slice(0, 90) }}...</p>
        <RouterLink :to="`/benefits/${benefit.id}`">상세 보기</RouterLink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBenefitsStore } from '../stores/benefits';

const benefitsStore = useBenefitsStore();
const currentAge = 25;
const age = ref(currentAge);

onMounted(() => {
  benefitsStore.fetch({ limit: 200 });
});

const filtered = computed(() =>
  benefitsStore.items.filter((benefit) => {
    const min = benefit.min_age ?? 0;
    const max = benefit.max_age ?? 99;
    return age.value >= min && age.value <= max;
  })
);
</script>
