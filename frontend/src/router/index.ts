import { createRouter, createWebHistory } from 'vue-router';

import ApplicationsView from '../views/ApplicationsView.vue';
import BenefitDetailView from '../views/BenefitDetailView.vue';
import BenefitsView from '../views/BenefitsView.vue';
import ExploreView from '../views/ExploreView.vue';
import HomeView from '../views/HomeView.vue';
import LockView from '../views/LockView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import OnboardingStep1View from '../views/OnboardingStep1View.vue';
import OnboardingStep2View from '../views/OnboardingStep2View.vue';
import OnboardingStep3View from '../views/OnboardingStep3View.vue';
import PinSetupView from '../views/PinSetupView.vue';
import ProfileView from '../views/ProfileView.vue';
import ProfileEditView from '../views/ProfileEditView.vue';
import SettingsAccessibilityView from '../views/SettingsAccessibilityView.vue';
import SettingsNotificationsView from '../views/SettingsNotificationsView.vue';
import TimelineView from '../views/TimelineView.vue';
import WelcomeView from '../views/WelcomeView.vue';

const routes = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', component: WelcomeView },
  { path: '/onboarding', redirect: '/onboarding/step1' },
  { path: '/onboarding/step1', component: OnboardingStep1View },
  { path: '/onboarding/step2', component: OnboardingStep2View },
  { path: '/onboarding/step3', component: OnboardingStep3View },
  { path: '/pin-setup', component: PinSetupView },
  { path: '/lock', component: LockView },
  { path: '/home', component: HomeView },
  { path: '/benefits', component: BenefitsView },
  { path: '/benefits/:id', component: BenefitDetailView, props: true },
  { path: '/timeline', component: TimelineView },
  { path: '/applications', component: ApplicationsView },
  { path: '/notifications', component: NotificationsView },
  { path: '/explore', component: ExploreView },
  { path: '/profile', component: ProfileView },
  { path: '/profile/edit', component: ProfileEditView },
  { path: '/settings/notifications', component: SettingsNotificationsView },
  { path: '/settings/accessibility', component: SettingsAccessibilityView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
