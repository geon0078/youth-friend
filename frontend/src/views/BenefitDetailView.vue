<template>
  <section v-if="benefit" class="container" style="display: grid; gap: 16px;">
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0;">혜택 상세</h2>
        <span class="pill">{{ benefit.category }}</span>
      </div>
      <h3 style="margin-top: 12px;">{{ benefit.title }}</h3>
      <p style="color: var(--muted);">{{ benefit.description }}</p>
      <p><strong>기관:</strong> {{ benefit.organization || '정보 없음' }}</p>
      <p><strong>신청 기간:</strong> {{ benefit.application_period || benefit.end_date || '상시' }}</p>
    </div>

    <div class="card">
      <h3 style="margin-top: 0;">구비 서류</h3>
      <ul style="margin: 0; padding-left: 18px; color: var(--muted);">
        <li v-for="doc in documents" :key="doc">{{ doc }}</li>
      </ul>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin-top: 0;">서류 준비 체크리스트</h3>
        <button class="btn" v-if="checkedCount > 0" @click="resetChecklist">초기화</button>
      </div>
      <div style="height: 8px; background: var(--border); border-radius: 999px; overflow: hidden;">
        <div :style="{ width: checklistProgress + '%', height: '100%', background: checklistProgress === 100 ? '#22c55e' : 'var(--primary)' }"></div>
      </div>
      <p style="color: var(--muted); margin-top: 8px;">{{ checkedCount }}/{{ documents.length }} 준비 완료 · {{ checklistProgress }}%</p>
      <div style="display: grid; gap: 8px; margin-top: 12px;">
        <label v-for="doc in documents" :key="doc" style="display: flex; align-items: center; justify-content: space-between;">
          <span>{{ doc }}</span>
          <input type="checkbox" v-model="checklist[doc]" @change="persistChecklist" />
        </label>
      </div>
      <div v-if="checklistProgress === 100" class="card" style="margin-top: 12px; background: #dcfce7; border-color: #86efac;">
        모든 서류 준비가 완료되었습니다!
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0;">자격 확인</h3>
      <p style="color: var(--muted);">프로필 정보 기반으로 자격 여부를 확인합니다.</p>
      <button v-if="hasProfile" class="btn btn-primary" @click="openEligibility">
        {{ eligibilityStatus ? '자격 확인 결과 보기' : '자격 확인하기' }}
      </button>
      <button v-else class="btn btn-secondary" @click="goProfileEdit">프로필 설정 후 자격 확인</button>
      <div v-if="eligibilityStatus" class="pill" style="margin-top: 8px;">
        {{ eligibilityStatus }}
      </div>
    </div>

    <div class="card" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button v-if="!isSaved" class="btn btn-primary" @click="saveApplication">나중에 하기</button>
      <div v-else class="card" style="flex: 1; display: grid; gap: 8px;">
        <div class="pill" style="background: #dcfce7; color: #15803d;">저장된 신청입니다</div>
        <div class="nav">
          <button class="btn btn-secondary" @click="viewSaved">저장 목록</button>
          <button class="btn" @click="removeSaved">저장 취소</button>
        </div>
      </div>
      <button class="btn btn-secondary" :disabled="!applyLink" @click="handleApply">
        신청하기
      </button>
      <button v-if="!applyLink && referenceLink" class="btn" @click="openExternal(referenceLink)">
        공식 페이지 열기
      </button>
    </div>
  </section>
  <div v-else class="container"><div class="card">혜택 정보를 불러오는 중입니다.</div></div>

  <div v-if="showApplyWarning" class="modal-overlay">
    <div class="card" style="max-width: 360px;">
      <h3 style="margin-top: 0;">서류 준비가 완료되지 않았습니다</h3>
      <p style="color: var(--muted);">현재 {{ checklistProgress }}%의 서류만 준비되었습니다. 그래도 신청 페이지로 이동하시겠습니까?</p>
      <div class="nav">
        <button class="btn" @click="showApplyWarning = false">취소</button>
        <button class="btn btn-primary" @click="proceedApply">그래도 이동</button>
      </div>
    </div>
  </div>

  <div v-if="showEligibilityModal" class="modal-overlay">
    <div class="card" style="max-width: 360px;">
      <h3 style="margin-top: 0;">자격 확인 결과</h3>
      <p style="color: var(--muted);">{{ eligibilityDetail }}</p>
      <button class="btn btn-primary" @click="showEligibilityModal = false">닫기</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api, type Benefit } from '../services/api';
import { useApplicationsStore } from '../stores/applications';
import { useProfileStore } from '../stores/profile';

const route = useRoute();
const benefit = ref<Benefit | null>(null);
const applicationsStore = useApplicationsStore();
const profileStore = useProfileStore();
const documents = ['주민등록초본', '소득 증빙서류', '재학/재직 증명서'];
const checklist = reactive<Record<string, boolean>>({});
const savedApplicationId = ref<string | null>(null);
const isSaved = computed(() => savedApplicationId.value !== null);
const showApplyWarning = ref(false);
const showEligibilityModal = ref(false);
const eligibilityStatus = ref<string | null>(null);
const hasProfile = computed(() => Boolean(profileStore.profile?.birth_year));
const applyLink = computed(() => benefit.value?.apply_url ?? benefit.value?.reference_url ?? undefined);

onMounted(async () => {
  const id = route.params.id as string;
  benefit.value = await api.getBenefit(id);
  await profileStore.load();
  const stored = localStorage.getItem(`checklist_${id}`);
  if (stored) {
    const parsed = JSON.parse(stored) as Record<string, boolean>;
    documents.forEach((doc) => {
      checklist[doc] = parsed[doc] ?? false;
    });
  } else {
    documents.forEach((doc) => {
      checklist[doc] = false;
    });
  }
  const apps = await api.listApplications();
  const existing = apps.find((item) => item.benefit_id === id);
  savedApplicationId.value = existing?.id ?? null;
  eligibilityStatus.value = computeEligibility();
  documents.forEach((doc) => {
    checklist[doc] = checklist[doc] ?? false;
  });
});

const saveApplication = async () => {
  if (!benefit.value) return;
  const created = await api.createApplication(benefit.value.id);
  savedApplicationId.value = created.id;
  alert('신청 목록에 저장되었습니다.');
};

const viewSaved = () => {
  window.location.href = '/applications';
};

const removeSaved = async () => {
  if (!savedApplicationId.value) return;
  await api.deleteApplication(savedApplicationId.value);
  savedApplicationId.value = null;
};

const persistChecklist = () => {
  const id = route.params.id as string;
  localStorage.setItem(`checklist_${id}`, JSON.stringify(checklist));
};

const resetChecklist = () => {
  documents.forEach((doc) => {
    checklist[doc] = false;
  });
  persistChecklist();
};

const checklistProgress = computed(() => {
  const total = documents.length;
  const checked = documents.filter((doc) => checklist[doc]).length;
  return Math.round((checked / total) * 100);
});

const checkedCount = computed(() => documents.filter((doc) => checklist[doc]).length);

const isRegionEligible = (userRegion?: string | null) => {
  if (!benefit.value) return true;
  if (!userRegion) return true;
  const regions = benefit.value.regions ?? [];
  if (regions.length > 0) {
    return regions.some((region) => region.includes(userRegion));
  }
  if (!benefit.value.region) return true;
  return benefit.value.region.includes(userRegion);
};

const computeEligibility = () => {
  if (!benefit.value) return '확인 중';
  const profile = profileStore.profile;
  if (!profile?.birth_year) return '프로필 설정 필요';
  const age = new Date().getFullYear() - profile.birth_year;
  const min = benefit.value.min_age ?? 0;
  const max = benefit.value.max_age ?? 99;
  if (age < min || age > max) return '조건 미달';
  if (!isRegionEligible(profile.region)) return '조건 미달';
  return '신청 가능';
};

const eligibilityDetail = computed(() => eligibilityStatus.value ?? '확인 중');

const eligibilityLabel = computed(() => {
  if (!benefit.value) return '확인 중';
  const profile = profileStore.profile;
  if (!profile?.birth_year) return '프로필 설정 필요';
  const age = new Date().getFullYear() - profile.birth_year;
  const min = benefit.value.min_age ?? 0;
  const max = benefit.value.max_age ?? 99;
  if (age < min || age > max) return '조건 미달';
  if (!isRegionEligible(profile.region)) return '조건 미달';
  return '신청 가능';
});

const openEligibility = () => {
  eligibilityStatus.value = computeEligibility();
  showEligibilityModal.value = true;
};

const goProfileEdit = () => {
  window.location.href = '/profile/edit';
};

const handleApply = () => {
  if (!applyLink.value) return;
  if (checklistProgress.value < 100) {
    showApplyWarning.value = true;
    return;
  }
  proceedApply();
};

const proceedApply = () => {
  showApplyWarning.value = false;
  if (!applyLink.value) return;
  window.open(applyLink.value, '_blank');
  const completed = window.confirm('신청을 완료하셨나요?');
  if (completed && savedApplicationId.value) {
    applicationsStore.update(savedApplicationId.value, 'applied');
  }
};

const openExternal = (url: string) => {
  const ok = window.confirm('공식 페이지로 이동할까요?');
  if (ok) {
    window.open(url, '_blank');
  }
};

const referenceLink = computed(() => benefit.value?.reference_url ?? null);
</script>
