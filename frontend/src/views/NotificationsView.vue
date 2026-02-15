<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0;">알림</h2>
      <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
    </div>
    <div class="card" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button class="btn btn-secondary" @click="createSample">샘플 알림 추가</button>
      <button class="btn" @click="notificationsStore.markAllRead">모두 읽음</button>
      <button class="btn" @click="notificationsStore.clearAll">모두 삭제</button>
    </div>
    <div v-if="notificationsStore.isLoading" class="card">불러오는 중...</div>
    <div v-else-if="notificationsStore.items.length === 0" class="card" style="text-align: center;">새로운 알림이 없습니다.</div>
    <div v-else class="grid two-col">
      <article
        v-for="notification in notificationsStore.items"
        :key="notification.id"
        class="card"
        style="cursor: pointer;"
        @click="handleNotificationClick(notification)"
      >
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="pill">{{ notification.type }}</span>
          <span class="badge">{{ notification.is_read ? '읽음' : '읽지 않음' }}</span>
        </div>
        <h3 style="margin-top: 8px;">{{ notification.title }}</h3>
        <p style="color: var(--muted);">{{ notification.body }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBenefitsStore } from '../stores/benefits';
import { useNotificationsStore } from '../stores/notifications';

const notificationsStore = useNotificationsStore();
const benefitsStore = useBenefitsStore();
const router = useRouter();

onMounted(() => {
  notificationsStore.fetch();
  if (benefitsStore.items.length === 0) {
    benefitsStore.fetch({ limit: 50 });
  }
});

const unreadCount = computed(
  () => notificationsStore.items.filter((item) => !item.is_read).length
);

const createSample = async () => {
  const benefitId = benefitsStore.items[0]?.id;
  await notificationsStore.createSample(benefitId);
};

const handleNotificationClick = (notification: { benefit_id?: string | null; type: string }) => {
  if (notification.benefit_id) {
    router.push(`/benefits/${notification.benefit_id}`);
    return;
  }
  if (notification.type === 'new_benefit' && benefitsStore.items[0]) {
    router.push(`/benefits/${benefitsStore.items[0].id}`);
    return;
  }
  router.push('/applications');
};
</script>
