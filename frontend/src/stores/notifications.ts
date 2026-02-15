import { defineStore } from 'pinia';
import { api, type Notification } from '../services/api';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notification[],
    isLoading: false,
  }),
  actions: {
    async fetch() {
      this.isLoading = true;
      try {
        this.items = await api.listNotifications();
      } finally {
        this.isLoading = false;
      }
    },
    async createSample(benefitId?: string) {
      await api.createNotification({
        title: '새로운 혜택이 도착했어요',
        body: '관심 지역에 맞는 신규 지원금이 등록되었습니다.',
        type: 'new_benefit',
        benefit_id: benefitId,
      });
      await this.fetch();
    },
    async markAllRead() {
      await api.markAllRead();
      await this.fetch();
    },
    async clearAll() {
      await api.clearNotifications();
      await this.fetch();
    },
  },
});
