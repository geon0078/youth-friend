<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="hero-card">
      <span class="hero-tag">맞춤 혜택 비서</span>
      <h2 class="hero-title">청년친구와 혜택 놓치지 마세요</h2>
      <p class="hero-subtitle">정부·지자체 지원을 상황별로 정리하고 마감까지 알려드릴게요.</p>
      <RouterLink class="btn btn-secondary" to="/onboarding/step1">나에게 맞는 혜택 찾기</RouterLink>
    </div>

    <div class="card" @click="goBenefits" style="cursor: pointer;">
      <h3 style="margin-top: 0;">총 혜택 금액</h3>
      <p style="font-size: 18px; font-weight: 700; margin: 4px 0;">{{ benefitsStore.total.toLocaleString() }}개</p>
      <p style="color: var(--muted); margin: 0;">내 지역 기준 혜택을 한 번에 확인하세요.</p>
    </div>

    <div class="card">
      <h3 style="margin-top: 0;">추천 혜택</h3>
      <p style="color: var(--muted); margin-top: 0;">프로필 기반 큐레이션</p>
      <div v-if="benefitsStore.isLoading" style="color: var(--muted);">혜택 정보를 불러오는 중...</div>
      <div v-else-if="topBenefits.length === 0" style="color: var(--muted);">표시할 혜택이 없습니다.</div>
      <div v-else style="display: grid; gap: 12px;">
        <article v-for="benefit in topBenefits" :key="benefit.id" class="card" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="pill">{{ categoryLabel(benefit.category) }}</span>
            <span class="badge">{{ deadlineLabel(benefit.end_date) }}</span>
          </div>
          <h4 style="margin: 8px 0;">{{ benefit.title }}</h4>
          <p style="color: var(--muted); margin: 0;">{{ benefit.description.slice(0, 60) }}...</p>
          <RouterLink class="btn btn-primary" style="margin-top: 12px; display: inline-block;" :to="`/benefits/${benefit.id}`">
            상세 보기
          </RouterLink>
        </article>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0;">빠른 작업</h3>
      <p style="color: var(--muted); margin-top: 0;">진행 상황을 바로 이어가요</p>
      <div class="chip-grid">
        <button
          v-for="item in quickActions"
          :key="item.label"
          class="chip"
          @click="router.push(item.route)"
        >
          <span>{{ item.label }}</span>
          <span style="margin-left: 6px; color: var(--muted);">{{ item.value }}</span>
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0;">페르소나 하이라이트</h3>
      <div style="display: grid; gap: 12px;">
        <div v-for="persona in personaHighlights" :key="persona.name" class="card" style="padding: 14px;">
          <strong>{{ persona.name }}</strong>
          <p style="color: var(--muted); margin: 6px 0 0;">{{ persona.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useBenefitsStore } from '../stores/benefits';
  import { useApplicationsStore } from '../stores/applications';
  import { useProfileStore } from '../stores/profile';

const benefitsStore = useBenefitsStore();
const applicationsStore = useApplicationsStore();
const profileStore = useProfileStore();
const router = useRouter();

onMounted(() => {
  benefitsStore.fetch({ limit: 200, hide_ended: true });
  profileStore.load();
  applicationsStore.fetch();
});

const topBenefits = computed(() => benefitsStore.items
  .filter((item) => item.status !== 'ended')
  .slice(0, 3));

const countByStatus = computed(() => {
  const counts: Record<string, number> = {
    preparing: 0,
    applied: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  };
  applicationsStore.items.forEach((item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  });
  return counts;
});

const isDeadlineApproaching = (deadline?: string | null) => {
  if (!deadline) return false;
  const match = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (!match) return false;
  const endDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
  const diff = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 7;
};

const deadlineApproaching = computed(() => {
  const benefitMap = new Map(benefitsStore.items.map((benefit) => [benefit.id, benefit]));
  return applicationsStore.items.filter((app) => {
    const benefit = benefitMap.get(app.benefit_id);
    return isDeadlineApproaching(benefit?.end_date ?? benefit?.application_period ?? null);
  });
});

const quickActions = computed(() => {
  const totalCount = benefitsStore.total ?? benefitsStore.items.length;
  const savedCount = applicationsStore.items.length;
  const preparingCount = countByStatus.value.preparing ?? 0;
  const deadlineCount = deadlineApproaching.value.length;

  const actions = [
    { label: '혜택 둘러보기', value: `${totalCount.toLocaleString()}건`, route: '/benefits' },
    { label: '신청 관리', value: `${savedCount.toLocaleString()}건`, route: '/applications' },
    { label: '마감 임박', value: `${deadlineCount.toLocaleString()}건`, route: '/applications' },
  ];

  if (!profileStore.profile) {
    actions.unshift({ label: '온보딩 다시 시작', value: '맞춤 혜택 설정', route: '/onboarding/step1' });
  } else if (preparingCount > 0) {
    actions[1] = { label: '신청 진행', value: `${preparingCount.toLocaleString()}건`, route: '/applications?status=preparing' };
  }

  return actions.slice(0, 3);
});

const personaHighlights = computed(() => {
  if (benefitsStore.items.length === 0) {
    return [
      {
        name: '데이터 준비 중',
        description: '최신 혜택 데이터를 불러오고 있습니다.',
      },
    ];
  }

  const counts = benefitsStore.items.reduce<Record<string, number>>((acc, benefit) => {
    acc[benefit.category] = (acc[benefit.category] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category, count], index) => {
      const label = categoryLabel(category);
      const description = index === 0
        ? `${label} 혜택이 ${count}건으로 가장 많아요. 지금 바로 확인해보세요.`
        : `${label} 혜택도 ${count}건 있습니다. 맞춤 추천에 포함됩니다.`;
      return { name: `${label} 우선 추천`, description };
    });
});

const goBenefits = () => {
  router.push('/benefits');
};

const categoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    employment: '일자리',
    housing: '주거',
    education: '교육',
    welfare: '복지',
    culture: '문화',
  };
  return labels[category] ?? category;
};

const deadlineLabel = (deadline?: string | null) => {
  if (!deadline) return '상시';
  const match = deadline.match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) return deadline.slice(0, 10);
  const endDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
  const diff = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '마감';
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
};
</script>
