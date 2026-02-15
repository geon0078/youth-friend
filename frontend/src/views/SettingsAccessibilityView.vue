<template>
  <section class="card">
    <h2 class="section-title">접근성 설정</h2>
    <label class="card">
      글자 크기
      <input v-model.number="settings.textSize" class="input" type="range" min="14" max="22" />
    </label>
    <label class="card">
      <input v-model="settings.highContrast" type="checkbox" /> 고대비 모드
    </label>
    <label class="card">
      <input v-model="settings.reduceMotion" type="checkbox" /> 모션 줄이기
    </label>
    <button class="btn btn-primary" style="margin-top: 16px;" @click="save">저장</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const settings = reactive({
  textSize: 16,
  highContrast: false,
  reduceMotion: false,
});

const stored = localStorage.getItem('accessibility_settings');
if (stored) {
  Object.assign(settings, JSON.parse(stored));
}

const save = () => {
  localStorage.setItem('accessibility_settings', JSON.stringify(settings));
  alert('저장되었습니다.');
};
</script>
