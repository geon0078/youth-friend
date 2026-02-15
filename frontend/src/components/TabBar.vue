<template>
  <nav class="tabbar">
    <RouterLink v-for="item in items" :key="item.path" :to="item.path" class="tabbar__item">
      <span class="tabbar__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  { path: '/home', label: '홈' },
  { path: '/benefits', label: '혜택' },
  { path: '/timeline', label: '타임라인' },
  { path: '/applications', label: '신청' },
  { path: '/profile', label: '프로필' },
];
</script>
