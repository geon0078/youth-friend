/**
 * API 응답 타입
 */

/**
 * 표준 API 응답 래퍼
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiErrorResponse;
}

/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * HTTP 메서드 타입
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  /** HTTP 메서드 */
  method?: HttpMethod;
  /** 요청 바디 (자동 JSON 직렬화) */
  body?: unknown;
  /** 타임아웃 (ms), 기본값 10000 */
  timeout?: number;
  /** 재시도 횟수, 기본값 3 */
  retries?: number;
  /** 재시도 제외 상태 코드 */
  skipRetryOnStatus?: number[];
}

/**
 * API 에러 타입
 */
export type ApiErrorType = 'network' | 'timeout' | 'http' | 'parse' | 'unknown';
