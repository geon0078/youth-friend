import { defineStore } from 'pinia';
import { api, type UserProfile } from '../services/api';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as UserProfile | null,
    isLoading: false,
  }),
  actions: {
    async load() {
      this.isLoading = true;
      try {
        this.profile = await api.getProfile();
      } finally {
        this.isLoading = false;
      }
    },
    async save(profile: UserProfile) {
      this.isLoading = true;
      try {
        this.profile = await api.saveProfile(profile);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
