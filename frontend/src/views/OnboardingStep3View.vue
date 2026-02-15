<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <header style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;">
      <button class="btn" @click="goBack">←</button>
      <span class="pill">3 / 3</span>
      <span style="width: 44px;"></span>
    </header>

    <div style="flex: 1; overflow-y: auto;">
      <h2 style="margin-bottom: 4px;">서비스 이용 동의</h2>
      <p style="color: var(--muted); margin-top: 0;">서비스 이용을 위해 아래 약관에 동의해주세요</p>

      <div class="card" style="margin-top: 20px;">
        <label style="display: flex; align-items: center; gap: 12px;">
          <input type="checkbox" :checked="allChecked" @change="toggleAll" />
          <span style="font-weight: 600;">전체 동의</span>
        </label>
      </div>

      <div class="card" style="margin-top: 12px; display: grid; gap: 12px;">
        <label style="display: flex; align-items: center; justify-content: space-between;">
          <span>[필수] 서비스 이용약관</span>
          <input type="checkbox" v-model="store.consentTerms" />
        </label>
        <label style="display: flex; align-items: center; justify-content: space-between;">
          <span>[필수] 개인정보 처리방침</span>
          <input type="checkbox" v-model="store.consentPrivacy" />
        </label>
        <label style="display: flex; align-items: center; justify-content: space-between;">
          <span>[선택] 마케팅 알림 수신</span>
          <input type="checkbox" v-model="store.consentMarketing" />
        </label>
      </div>

      <p style="text-align: center; color: var(--muted); font-size: 12px; margin-top: 16px;">
        필수 항목에 동의하지 않으면 서비스 이용이 제한됩니다.
      </p>
    </div>

    <div style="padding: 16px 0;">
      <button class="btn btn-primary" style="width: 100%;" :disabled="!hasConsented || isSaving" @click="complete">
        {{ isSaving ? '저장 중...' : '동의하고 시작하기' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { useOnboardingStore } from '../stores/onboarding';
import { useProfileStore } from '../stores/profile';

const router = useRouter();
const store = useOnboardingStore();
const profileStore = useProfileStore();
const isSaving = ref(false);

const allChecked = computed(
  () => store.consentTerms && store.consentPrivacy && store.consentMarketing
);

const hasConsented = computed(() => store.consentTerms && store.consentPrivacy);

const toggleAll = () => {
  store.setConsentAll(!allChecked.value);
};

const goBack = () => {
  router.back();
};

const complete = async () => {
  if (!hasConsented.value || isSaving.value) return;
  isSaving.value = true;
  try {
    const payload = {
      birth_year: store.birthYear,
      region: store.region,
      income_level: store.incomeLevel,
      employment_status: store.employmentStatus,
      marketing_opt_in: store.consentMarketing,
    };
    await api.saveProfile(payload);
    await profileStore.load();
    router.replace('/pin-setup');
  } catch {
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
  } finally {
    isSaving.value = false;
  }
};
</script>
