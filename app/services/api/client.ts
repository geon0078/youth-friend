import type { ApiRequestOptions, ApiErrorType, ApiErrorResponse } from '@/types';

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  readonly type: ApiErrorType;
  readonly status?: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    type: ApiErrorType,
    options?: {
      status?: number;
      code?: string;
      details?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }

  /** 네트워크 에러 생성 */
  static network(message = '네트워크 연결을 확인해주세요'): ApiError {
    return new ApiError(message, 'network');
  }

  /** 타임아웃 에러 생성 */
  static timeout(message = '요청 시간이 초과되었습니다'): ApiError {
    return new ApiError(message, 'timeout');
  }

  /** HTTP 에러 생성 */
  static http(status: number, response?: ApiErrorResponse): ApiError {
    const defaultMessages: Record<number, string> = {
      400: '잘못된 요청입니다',
      401: '인증이 필요합니다',
      403: '접근 권한이 없습니다',
      404: '요청한 리소스를 찾을 수 없습니다',
      500: '서버 오류가 발생했습니다',
      502: '서버에 연결할 수 없습니다',
      503: '서비스를 일시적으로 사용할 수 없습니다',
    };

    return new ApiError(
      response?.message ?? defaultMessages[status] ?? `HTTP 오류: ${status}`,
      'http',
      {
        status,
        code: response?.code,
        details: response?.details,
      }
    );
  }

  /** 파싱 에러 생성 */
  static parse(message = '응답을 처리할 수 없습니다'): ApiError {
    return new ApiError(message, 'parse');
  }
}

/** 기본 설정 */
const DEFAULT_TIMEOUT = 10000; // 10초 (NFR18)
const DEFAULT_RETRIES = 3; // 3회 재시도 (NFR19)
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/** 개발 환경 여부 */
const isDev = __DEV__;

/**
 * 요청/응답 로깅 (개발 환경)
 */
function logRequest(method: string, url: string, options?: ApiRequestOptions): void {
  if (!isDev) return;
  console.log(`[API] ${method} ${url}`, options?.body ? { body: options.body } : '');
}

function logResponse(method: string, url: string, status: number, duration: number): void {
  if (!isDev) return;
  console.log(`[API] ${method} ${url} → ${status} (${duration}ms)`);
}

function logError(method: string, url: string, error: ApiError, attempt: number): void {
  if (!isDev) return;
  console.warn(`[API] ${method} ${url} 실패 (시도 ${attempt}):`, error.message);
}

/**
 * 지수 백오프 딜레이 계산
 * @param attempt - 현재 시도 횟수 (0부터 시작)
 * @returns 대기 시간 (ms)
 */
function getRetryDelay(attempt: number): number {
  // 1초, 2초, 4초 (지수 백오프)
  const baseDelay = 1000;
  const delay = baseDelay * Math.pow(2, attempt);
  // 최대 8초, ±20% 랜덤 지터
  const maxDelay = 8000;
  const jitter = 0.2;
  const actualDelay = Math.min(delay, maxDelay);
  return actualDelay * (1 + (Math.random() - 0.5) * jitter);
}

/**
 * 딜레이 유틸리티
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 가능 여부 확인
 */
function isRetryable(error: ApiError, skipRetryOnStatus?: number[]): boolean {
  // 네트워크 에러, 타임아웃은 재시도
  if (error.type === 'network' || error.type === 'timeout') {
    return true;
  }

  // HTTP 에러: 특정 상태 코드만 재시도
  if (error.type === 'http' && error.status) {
    if (skipRetryOnStatus?.includes(error.status)) {
      return false;
    }
    return RETRY_STATUS_CODES.includes(error.status);
  }

  return false;
}

/**
 * 단일 요청 수행 (타임아웃 포함)
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw ApiError.timeout();
    }
    throw ApiError.network();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API 클라이언트
 */
export const apiClient = {
  /**
   * HTTP 요청 수행
   * @template T - 응답 데이터 타입
   */
  async request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      skipRetryOnStatus,
      headers,
      ...restOptions
    } = options;

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      ...restOptions,
    };

    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    logRequest(method, url, options);
    const startTime = Date.now();

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 재시도 시 딜레이
        if (attempt > 0) {
          const retryDelay = getRetryDelay(attempt - 1);
          await delay(retryDelay);
        }

        const response = await fetchWithTimeout(url, requestInit, timeout);
        const duration = Date.now() - startTime;

        logResponse(method, url, response.status, duration);

        // HTTP 에러 처리
        if (!response.ok) {
          let errorResponse: ApiErrorResponse | undefined;
          try {
            errorResponse = await response.json();
          } catch {
            // JSON 파싱 실패 시 무시
          }
          throw ApiError.http(response.status, errorResponse);
        }

        // 빈 응답 처리 (204 No Content)
        if (response.status === 204) {
          return undefined as T;
        }

        // JSON 파싱
        try {
          return await response.json();
        } catch {
          throw ApiError.parse();
        }
      } catch (error) {
        const apiError = error instanceof ApiError ? error : ApiError.network();
        lastError = apiError;

        logError(method, url, apiError, attempt + 1);

        // 재시도 불가능하면 즉시 throw
        if (!isRetryable(apiError, skipRetryOnStatus) || attempt >= retries) {
          throw apiError;
        }
      }
    }

    // 여기 도달할 일은 없지만 타입 안전성을 위해
    throw lastError ?? ApiError.network();
  },

  /** GET 요청 */
  get<T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  },

  /** POST 요청 */
  post<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  },

  /** PUT 요청 */
  put<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  },

  /** PATCH 요청 */
  patch<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  },

  /** DELETE 요청 */
  delete<T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  },
};
