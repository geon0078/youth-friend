<template>
  <section class="container" style="min-height: 100vh; display: flex; flex-direction: column;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px;">
      <div class="card" style="width: 100px; height: 100px; display: grid; place-items: center; background: var(--primary-soft);">
        <span style="font-size: 42px;">🎁</span>
      </div>
      <h1 style="margin: 0; font-size: 28px;">청년친구</h1>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; text-align: center;">
      <h2 style="margin: 0; font-size: 26px; line-height: 1.4;">받을 수 있는 혜택,<br />놓치지 마세요</h2>
      <p style="color: var(--muted); margin: 0;">
        청년 정책을 한눈에 확인하고<br />나에게 맞는 혜택을 찾아보세요
      </p>
    </div>
    <div style="padding-bottom: 24px;">
      <RouterLink class="btn btn-primary" style="display: block; text-align: center; margin-bottom: 12px;" to="/onboarding/step1">
        시작하기
      </RouterLink>
      <RouterLink class="btn" style="display: block; text-align: center; color: var(--muted);" to="/home">
        이미 계정이 있어요
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
