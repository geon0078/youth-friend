import { defineStore } from 'pinia';
import { api, type Benefit, type BenefitList } from '../services/api';

export const useBenefitsStore = defineStore('benefits', {
  state: () => ({
    items: [] as Benefit[],
    total: 0,
    isLoading: false,
  }),
  actions: {
    async fetch(params: Record<string, string | number | boolean | undefined>) {
      this.isLoading = true;
      try {
        const data: BenefitList = await api.listBenefits(params);
        this.items = data.items;
        this.total = data.total;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
