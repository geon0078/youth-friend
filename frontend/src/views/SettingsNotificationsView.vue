<template>
  <section class="card">
    <h2 class="section-title">알림 설정</h2>
    <label class="card">
      <input v-model="settings.enabled" type="checkbox" /> 전체 알림 활성화
    </label>
    <label class="card">
      <input v-model="settings.deadline" type="checkbox" /> 마감 알림
    </label>
    <label class="card">
      <input v-model="settings.newBenefit" type="checkbox" /> 신규 혜택 알림
    </label>
    <label class="card">
      <input v-model="settings.result" type="checkbox" /> 결과 알림
    </label>
    <button class="btn btn-primary" style="margin-top: 16px;" @click="save">저장</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const settings = reactive({
  enabled: true,
  deadline: true,
  newBenefit: true,
  result: true,
});

const stored = localStorage.getItem('notification_settings');
if (stored) {
  Object.assign(settings, JSON.parse(stored));
}

const save = () => {
  localStorage.setItem('notification_settings', JSON.stringify(settings));
  alert('저장되었습니다.');
};
</script>
