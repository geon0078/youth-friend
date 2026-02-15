<template>
  <section class="container" style="display: grid; gap: 16px;">
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 class="section-title" style="margin: 0;">혜택 목록</h2>
        <RouterLink class="btn" to="/explore">데이터 & 로드맵</RouterLink>
      </div>
      <input v-model="localSearch" class="input" placeholder="혜택을 검색하세요" />
      <div v-if="showRecentSearches" class="card" style="margin-top: 12px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>최근 검색어</strong>
          <button class="btn" @click="clearRecent">모두 삭제</button>
        </div>
        <div class="chip-grid" style="margin-top: 8px;">
          <button v-for="item in recentSearches" :key="item" class="chip" @click="applyRecent(item)">
            {{ item }}
          </button>
        </div>
      </div>
      <div class="card" style="margin-top: 12px;">
        <div style="display: flex; gap: 8px;">
          <button v-for="item in sortOptions" :key="item.value" :class="['chip', { active: sortBy === item.value }]" @click="setSort(item.value)">
            {{ item.label }}
          </button>
        </div>
      </div>
      <div class="card" style="margin-top: 12px;">
        <strong>카테고리</strong>
        <div class="chip-grid" style="margin-top: 8px;">
          <button
            v-for="item in categories"
            :key="item.value"
            :class="['chip', { active: selectedCategories.includes(item.value) }]"
            @click="toggleCategory(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    <div class="card" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
      <span>마감 혜택 숨기기</span>
      <input type="checkbox" v-model="hideEnded" />
    </div>
    <div class="card" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
      <span>연령 필터 적용</span>
      <input type="checkbox" v-model="filterByAge" />
    </div>
    <div class="card" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
      <span>지역 필터 적용</span>
      <input type="checkbox" v-model="filterByRegion" />
    </div>
  </div>

    <div v-if="benefitsStore.isLoading" class="card">혜택 정보를 불러오는 중...</div>
    <div v-else-if="filteredBenefits.length === 0" class="card">표시할 혜택이 없습니다.</div>

    <div v-else style="display: grid; gap: 16px;">
      <div v-if="sortBy === 'recommended'" class="card">
        <h3 style="margin-top: 0;">이번 주 마감</h3>
        <div v-if="urgentBenefits.length === 0" style="color: var(--muted);">해당 혜택이 없습니다.</div>
        <div v-else class="grid" style="margin-top: 12px;">
          <article v-for="benefit in urgentBenefits" :key="benefit.id" class="card">
            <BenefitCard :benefit="benefit" />
          </article>
        </div>
      </div>
      <div v-if="sortBy === 'recommended'" class="card">
        <h3 style="margin-top: 0;">놓치면 아쉬운 혜택</h3>
        <div v-if="highValueBenefits.length === 0" style="color: var(--muted);">해당 혜택이 없습니다.</div>
        <div v-else class="grid" style="margin-top: 12px;">
          <article v-for="benefit in highValueBenefits" :key="benefit.id" class="card">
            <BenefitCard :benefit="benefit" />
          </article>
        </div>
      </div>
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">전체 혜택</h3>
          <span class="pill">{{ remainingBenefits.length }}개</span>
        </div>
        <div class="grid" style="margin-top: 12px;">
          <article v-for="benefit in remainingBenefits" :key="benefit.id" class="card">
            <BenefitCard :benefit="benefit" />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BenefitCard from '../components/BenefitCard.vue';
import { useBenefitsStore } from '../stores/benefits';
import { useProfileStore } from '../stores/profile';

type SortOption = 'recommended' | 'deadline' | 'amount';

const benefitsStore = useBenefitsStore();
const profileStore = useProfileStore();
const localSearch = ref('');
const debouncedSearch = ref('');
const debounceTimer = ref<number | null>(null);
const selectedCategories = ref<string[]>([]);
const sortBy = ref<SortOption>('recommended');
const hideEnded = ref(true);
const filterByAge = ref(true);
const filterByRegion = ref(true);

const categories = [
  { value: 'employment', label: '일자리' },
  { value: 'housing', label: '주거' },
  { value: 'education', label: '교육' },
  { value: 'welfare', label: '복지' },
  { value: 'finance', label: '금융' },
  { value: 'culture', label: '문화' },
  { value: 'etc', label: '기타' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: '추천순' },
  { value: 'deadline', label: '마감순' },
  { value: 'amount', label: '금액순' },
];

const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem('recent_searches') || '[]'));

const showRecentSearches = computed(() => localSearch.value.length === 0 && recentSearches.value.length > 0);

const applyRecent = (value: string) => {
  localSearch.value = value;
};

const clearRecent = () => {
  recentSearches.value = [];
  localStorage.setItem('recent_searches', JSON.stringify([]));
};

const setSort = (value: SortOption) => {
  sortBy.value = value;
};

const toggleCategory = (value: string) => {
  if (selectedCategories.value.includes(value)) {
    selectedCategories.value = selectedCategories.value.filter((item) => item !== value);
  } else {
    selectedCategories.value = [...selectedCategories.value, value];
  }
};

const fetchBenefits = () => {
  benefitsStore.fetch({ search: debouncedSearch.value, limit: 200, hide_ended: hideEnded.value });
};

watch(localSearch, (value) => {
  if (debounceTimer.value) {
    window.clearTimeout(debounceTimer.value);
  }
  debounceTimer.value = window.setTimeout(() => {
    debouncedSearch.value = value.trim();
    if (debouncedSearch.value) {
      const next = [debouncedSearch.value, ...recentSearches.value.filter((item) => item !== debouncedSearch.value)].slice(0, 5);
      recentSearches.value = next;
      localStorage.setItem('recent_searches', JSON.stringify(next));
    }
    fetchBenefits();
  }, 300);
});

watch([selectedCategories, sortBy, hideEnded], fetchBenefits);

onMounted(() => {
  fetchBenefits();
  profileStore.load();
});

const filteredBenefits = computed(() => {
  let items = benefitsStore.items;
  if (hideEnded.value) {
    items = items.filter((benefit) => benefit.status !== 'ended');
  }
  if (selectedCategories.value.length) {
    items = items.filter((benefit) => selectedCategories.value.includes(benefit.category));
  }
  if (debouncedSearch.value) {
    const term = debouncedSearch.value.toLowerCase();
    items = items.filter((benefit) => benefit.title.toLowerCase().includes(term) || benefit.description.toLowerCase().includes(term));
  }
  if (filterByAge.value && profileStore.profile?.birth_year) {
    const age = new Date().getFullYear() - profileStore.profile.birth_year;
    items = items.filter((benefit) => {
      const min = benefit.min_age ?? 0;
      const max = benefit.max_age ?? 99;
      return age >= min && age <= max;
    });
  }
  if (filterByRegion.value && profileStore.profile?.region) {
    const userRegion = profileStore.profile.region;
    items = items.filter((benefit) => {
      const regions = benefit.regions ?? [];
      if (regions.length > 0) {
        return regions.some((region) => region.includes(userRegion));
      }
      if (!benefit.region) return true;
      return benefit.region.includes(userRegion);
    });
  }
  return items;
});

const sortedBenefits = computed(() => {
  const items = [...filteredBenefits.value];
  if (sortBy.value === 'deadline') {
    return items.sort((a, b) => (a.end_date || '').localeCompare(b.end_date || ''));
  }
  if (sortBy.value === 'amount') {
    return items.sort((a, b) => (b.support_count ?? 0) - (a.support_count ?? 0));
  }
  return items;
});

const urgentBenefits = computed(() => {
  if (sortBy.value !== 'recommended') return [];
  return sortedBenefits.value.filter((benefit) => {
    const end = benefit.end_date;
    if (!end) return false;
    const match = end.match(/(\d{4})(\d{2})(\d{2})/);
    if (!match) return false;
    const endDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
    const diff = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });
});

const highValueBenefits = computed(() => {
  if (sortBy.value !== 'recommended') return [];
  return sortedBenefits.value
    .filter((benefit) => (benefit.support_count ?? 0) >= 100)
    .slice(0, 5);
});

const remainingBenefits = computed(() => {
  if (sortBy.value !== 'recommended') return sortedBenefits.value;
  const ids = new Set([...urgentBenefits.value, ...highValueBenefits.value].map((benefit) => benefit.id));
  return sortedBenefits.value.filter((benefit) => !ids.has(benefit.id));
});

</script>
