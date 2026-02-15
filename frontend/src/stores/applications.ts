import { defineStore } from 'pinia';
import { api, type Application } from '../services/api';

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    items: [] as Application[],
    isLoading: false,
  }),
  actions: {
    async fetch(status?: string) {
      this.isLoading = true;
      try {
        this.items = await api.listApplications(status);
      } finally {
        this.isLoading = false;
      }
    },
    async create(benefitId: string) {
      await api.createApplication(benefitId);
      await this.fetch();
    },
    async update(applicationId: string, status: string, note?: string) {
      await api.updateApplication(applicationId, status, note);
      await this.fetch();
    },
    async remove(applicationId: string) {
      await api.deleteApplication(applicationId);
      await this.fetch();
    },
  },
});
