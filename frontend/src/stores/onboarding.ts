import { defineStore } from 'pinia';

type IncomeLevel = 'below50' | '50to100' | '100to150' | 'above150';
type EmploymentStatus = 'employed' | 'unemployed' | 'student' | 'self-employed' | 'part-time';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    birthYear: null as number | null,
    region: null as string | null,
    incomeLevel: null as IncomeLevel | null,
    employmentStatus: null as EmploymentStatus | null,
    consentTerms: false,
    consentPrivacy: false,
    consentMarketing: false,
  }),
  actions: {
    setBirthYear(year: number) {
      this.birthYear = year;
    },
    setRegion(region: string) {
      this.region = region;
    },
    setIncomeLevel(level: IncomeLevel | null) {
      this.incomeLevel = level;
    },
    setEmploymentStatus(status: EmploymentStatus | null) {
      this.employmentStatus = status;
    },
    setConsentAll(value: boolean) {
      this.consentTerms = value;
      this.consentPrivacy = value;
      this.consentMarketing = value;
    },
    reset() {
      this.birthYear = null;
      this.region = null;
      this.incomeLevel = null;
      this.employmentStatus = null;
      this.consentTerms = false;
      this.consentPrivacy = false;
      this.consentMarketing = false;
    },
  },
});
