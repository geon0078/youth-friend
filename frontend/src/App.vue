<template>
  <div class="app-shell">
    <header v-if="showHeader" class="app-topbar">
      <div class="app-topbar__title">청년친구</div>
      <RouterLink class="app-topbar__action" to="/notifications">알림</RouterLink>
    </header>
    <main :class="['app-content', { 'app-content--auth': isAuthRoute }]">
      <RouterView />
    </main>
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TabBar from './components/TabBar.vue';

const route = useRoute();

const isAuthRoute = computed(() =>
  ['/welcome', '/onboarding', '/onboarding/step1', '/onboarding/step2', '/onboarding/step3', '/pin-setup', '/lock'].includes(route.path)
);

const showTabBar = computed(() =>
  ['/home', '/benefits', '/timeline', '/applications', '/profile'].includes(route.path)
);

const showHeader = computed(() => !isAuthRoute.value);
</script>
