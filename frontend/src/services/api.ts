const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export type BenefitCategory =
  | 'employment'
  | 'housing'
  | 'education'
  | 'welfare'
  | 'finance'
  | 'culture'
  | 'etc';

export type BenefitStatus = 'active' | 'upcoming' | 'ended' | 'unknown';

export type Benefit = {
  id: string;
  title: string;
  description: string;
  category: BenefitCategory;
  source: string;
  status: BenefitStatus;
  organization?: string | null;
  region?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  application_period?: string | null;
  apply_url?: string | null;
  reference_url?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  regions: string[];
  support_count?: number | null;
};

export type BenefitList = {
  items: Benefit[];
  total: number;
};

export type UserProfile = {
  birth_year?: number | null;
  region?: string | null;
  income_level?: 'below50' | '50to100' | '100to150' | 'above150' | null;
  employment_status?: 'employed' | 'unemployed' | 'student' | 'self-employed' | 'part-time' | null;
  marketing_opt_in: boolean;
};

export type Application = {
  id: string;
  benefit_id: string;
  status: 'preparing' | 'applied' | 'approved' | 'rejected' | 'withdrawn';
  note?: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: 'deadline' | 'new_benefit' | 'result' | 'system';
  benefit_id?: string | null;
  application_id?: string | null;
  is_read: boolean;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  async listBenefits(params: Record<string, string | number | boolean | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    return request<BenefitList>(`/benefits${query ? `?${query}` : ''}`);
  },
  async getBenefit(id: string) {
    return request<Benefit>(`/benefits/${id}`);
  },
  async getProfile() {
    return request<UserProfile | null>('/profile');
  },
  async saveProfile(profile: UserProfile) {
    return request<UserProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },
  async listApplications(status?: string) {
    return request<Application[]>(status ? `/applications?status=${status}` : '/applications');
  },
  async createApplication(benefitId: string) {
    return request<Application>(`/applications?benefit_id=${benefitId}`, { method: 'POST' });
  },
  async updateApplication(applicationId: string, status: string, note?: string) {
    const params = new URLSearchParams({ status });
    if (note) {
      params.set('note', note);
    }
    return request<Application>(`/applications/${applicationId}?${params.toString()}`, {
      method: 'PATCH',
    });
  },
  async deleteApplication(applicationId: string) {
    return request<{ status: string }>(`/applications/${applicationId}`, { method: 'DELETE' });
  },
  async listNotifications() {
    return request<Notification[]>('/notifications');
  },
  async createNotification(payload: {
    title: string;
    body: string;
    type: Notification['type'];
    benefit_id?: string;
    application_id?: string;
  }) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return request<Notification>(`/notifications?${params.toString()}`, { method: 'POST' });
  },
  async markAllRead() {
    return request<{ status: string }>('/notifications/mark-all-read', { method: 'POST' });
  },
  async clearNotifications() {
    return request<{ status: string }>('/notifications/clear', { method: 'DELETE' });
  },
  async resetAll() {
    return request<{ status: string }>('/reset', { method: 'POST' });
  },
};
