<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px;">
      <h2 style="margin-bottom: 4px;">PIN 설정</h2>
      <p style="color: var(--muted); margin-top: 0;">
        앱 잠금을 위해 4자리 PIN을 설정해 주세요. 생체인증을 함께 사용할 수 있습니다.
      </p>
      <div class="grid two-col">
        <label class="card">
          PIN 입력
          <input v-model="pin" class="input" type="password" maxlength="4" />
        </label>
        <label class="card">
          PIN 확인
          <input v-model="confirmPin" class="input" type="password" maxlength="4" />
        </label>
      </div>
      <label class="card" style="display: flex; align-items: center; justify-content: space-between;">
        생체인증 사용
        <input v-model="useBiometric" type="checkbox" />
      </label>
    </div>
    <div class="nav" style="margin-bottom: 24px;">
      <button class="btn btn-secondary" @click="skip">나중에 할게요</button>
      <button class="btn btn-primary" @click="savePin">저장하고 홈으로</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const pin = ref('');
const confirmPin = ref('');
const useBiometric = ref(false);

const savePin = () => {
  if (pin.value.length !== 4 || pin.value !== confirmPin.value) {
    alert('PIN을 정확히 입력해주세요.');
    return;
  }
  localStorage.setItem('web_pin', pin.value);
  localStorage.setItem('web_biometric', useBiometric.value ? '1' : '0');
  router.push('/home');
};

const skip = () => {
  router.push('/home');
};
</script>
