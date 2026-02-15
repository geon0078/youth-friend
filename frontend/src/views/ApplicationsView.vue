<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="margin: 0;">저장된 신청</h2>
        <p style="color: var(--muted); margin: 4px 0 0;">진행 중인 신청 목록을 관리합니다.</p>
      </div>
      <span v-if="totalCount" class="badge">{{ totalCount }}개</span>
    </div>

    <div class="card" v-if="totalCount">
      <div class="chip-grid">
        <button
          v-for="item in filterOptions"
          :key="item.value"
          :class="['chip', { active: filter === item.value }]"
          @click="setFilter(item.value)"
        >
          {{ item.label }}
          <span v-if="counts[item.value]" style="margin-left: 6px;">{{ counts[item.value] }}</span>
        </button>
      </div>
    </div>

    <div v-if="totalCount" class="card" style="text-align: center; font-size: 12px; color: var(--muted);">
      길게 눌러 상태 변경
    </div>

    <div v-if="applicationsStore.isLoading" class="card">불러오는 중...</div>
    <div v-else-if="applicationsStore.items.length === 0" class="card" style="text-align: center;">
      <p style="margin: 0 0 8px;">저장된 신청이 없습니다</p>
      <p style="color: var(--muted);">혜택 상세 페이지에서 "나중에 하기"를 눌러 신청을 저장하고 관리하세요</p>
      <RouterLink class="btn btn-primary" to="/benefits">혜택 둘러보기</RouterLink>
    </div>
    <div v-else class="grid two-col">
      <article
        v-for="app in applicationsStore.items"
        :key="app.id"
        class="card"
        style="cursor: pointer;"
        @click="goDetail(app)"
        @dblclick="openStatus(app)"
      >
        <p><strong>혜택 ID:</strong> {{ app.benefit_id }}</p>
        <p><strong>상태:</strong> {{ statusLabel(app.status) }}</p>
        <p v-if="checklistProgress(app) > 0" style="color: var(--muted);">
          체크리스트 진행률: {{ checklistProgress(app) }}%
        </p>
        <div class="nav" style="margin-top: 12px;">
          <button class="btn btn-secondary" @click.stop="openStatus(app)">상태 변경</button>
          <button class="btn" @click.stop="remove(app.id)">삭제</button>
        </div>
      </article>
    </div>

    <div v-if="selected" class="modal-overlay">
      <div class="card" style="max-width: 360px; margin: 0 auto;">
        <h3 style="margin-top: 0;">상태 변경</h3>
        <p style="color: var(--muted);">현재 상태: {{ statusLabel(selected.status) }}</p>
        <select v-model="updates[selected.id]" class="input">
          <option value="preparing">준비중</option>
          <option value="applied">신청 완료</option>
          <option value="approved">승인</option>
          <option value="rejected">거부</option>
          <option value="withdrawn">취소</option>
        </select>
        <textarea v-model="notes" class="input" style="margin-top: 12px;" placeholder="메모를 입력하세요"></textarea>
        <div class="nav" style="margin-top: 12px;">
          <button class="btn btn-primary" @click="save(selected.id)">저장</button>
          <button class="btn" @click="closeStatus">취소</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationsStore } from '../stores/applications';
import { api } from '../services/api';
import type { Application } from '../services/api';

const applicationsStore = useApplicationsStore();
const route = useRoute();
const router = useRouter();
const filter = ref('all');
const updates = reactive<Record<string, string>>({});
const notes = ref('');
const selected = ref<Application | null>(null);

const filterOptions = [
  { value: 'all', label: '전체' },
  { value: 'preparing', label: '준비중' },
  { value: 'applied', label: '신청 완료' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '거부' },
];

const load = () => {
  applicationsStore.fetch(filter.value === 'all' ? undefined : filter.value).then(() => {
    applicationsStore.items.forEach((item) => {
      updates[item.id] = item.status;
    });
    void ensureDeadlineNotifications();
  });
};

onMounted(() => {
  const status = route.query.status as string | undefined;
  if (status) {
    filter.value = status;
  }
  load();
});

const save = async (id: string) => {
  const status = updates[id];
  await applicationsStore.update(id, status, notes.value || undefined);
  notes.value = '';
  selected.value = null;
};

const remove = async (id: string) => {
  await applicationsStore.remove(id);
};

const openStatus = (app: Application) => {
  selected.value = app;
  notes.value = app.note ?? '';
};

const closeStatus = () => {
  selected.value = null;
  notes.value = '';
};

const setFilter = (value: string) => {
  filter.value = value;
  load();
};

const statusLabel = (status: string) => {
  if (status === 'preparing') return '준비중';
  if (status === 'applied') return '신청 완료';
  if (status === 'approved') return '승인';
  if (status === 'rejected') return '거부';
  if (status === 'withdrawn') return '취소';
  return status;
};

const goDetail = (app: Application) => {
  router.push(`/benefits/${app.benefit_id}`);
};

const checklistProgress = (app: Application) => {
  const stored = localStorage.getItem(`checklist_${app.benefit_id}`);
  if (!stored) return 0;
  const parsed = JSON.parse(stored) as Record<string, boolean>;
  const values = Object.values(parsed);
  if (values.length === 0) return 0;
  const checked = values.filter(Boolean).length;
  return Math.round((checked / values.length) * 100);
};

const loadNotificationSettings = () => {
  const stored = localStorage.getItem('notification_settings');
  if (!stored) {
    return {
      enabled: true,
      deadline: true,
    };
  }
  const parsed = JSON.parse(stored) as { enabled?: boolean; deadline?: boolean };
  return {
    enabled: parsed.enabled ?? true,
    deadline: parsed.deadline ?? true,
  };
};

const parseDeadline = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}`);
};

const getDeadlineNotificationKey = (benefitId: string, dateLabel: string) => {
  return `deadline_notified_${benefitId}_${dateLabel}`;
};

const ensureDeadlineNotifications = async () => {
  const settings = loadNotificationSettings();
  if (!settings.enabled || !settings.deadline) return;

  try {
    const targets = applicationsStore.items.filter((item) => {
      return item.status !== 'withdrawn' && item.status !== 'rejected';
    });

    const benefits = await Promise.all(
      targets.map(async (app) => {
        const benefit = await api.getBenefit(app.benefit_id);
        return { app, benefit };
      })
    );

    await Promise.all(
      benefits.map(async ({ benefit }) => {
        const deadline = parseDeadline(benefit.end_date ?? benefit.application_period ?? null);
        if (!deadline) return;
        const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 7) return;
        const dateLabel = `${deadline.getFullYear()}-${deadline.getMonth() + 1}-${deadline.getDate()}`;
        const storageKey = getDeadlineNotificationKey(benefit.id, dateLabel);
        if (localStorage.getItem(storageKey)) return;
        await api.createNotification({
          title: '마감 임박 혜택',
          body: `${benefit.title} 신청 마감이 ${diff}일 남았습니다.`,
          type: 'deadline',
          benefit_id: benefit.id,
        });
        localStorage.setItem(storageKey, 'true');
      })
    );
  } catch (error) {
    console.warn('마감 알림 생성 실패:', error);
  }
};

const counts = computed(() => {
  const base: Record<string, number> = { all: applicationsStore.items.length };
  applicationsStore.items.forEach((item) => {
    base[item.status] = (base[item.status] ?? 0) + 1;
  });
  return base;
});

const totalCount = computed(() => applicationsStore.items.length);
</script>
