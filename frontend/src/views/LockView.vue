<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; gap: 16px;">
    <h2 style="margin-bottom: 4px;">잠금 화면</h2>
    <p style="color: var(--muted); margin-top: 0;">PIN을 입력해 잠금을 해제하세요.</p>
    <input v-model="pin" class="input" type="password" maxlength="4" style="max-width: 200px;" />
    <button class="btn btn-primary" style="max-width: 200px;" @click="unlock">잠금 해제</button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const pin = ref('');

const unlock = () => {
  const saved = localStorage.getItem('web_pin');
  if (!saved || pin.value === saved) {
    router.push('/home');
    return;
  }
  alert('PIN이 일치하지 않습니다.');
};
</script>
