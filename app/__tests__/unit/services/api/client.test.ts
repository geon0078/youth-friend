/**
 * API Client Tests
 * - 타임아웃 (10초)
 * - 재시도 로직 (3회, 지수 백오프)
 * - 에러 핸들링
 */

import { apiClient, ApiError } from '@/services/api/client';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock setTimeout for faster tests
jest.useFakeTimers();

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    jest.clearAllTimers();
  });

  describe('request', () => {
    it('성공적인 GET 요청을 처리한다', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get<typeof mockData>('https://api.test.com/data');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('POST 요청 시 body를 JSON으로 직렬화한다', async () => {
      const requestBody = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => responseData,
      });

      await apiClient.post('https://api.test.com/items', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('204 No Content 응답을 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => { throw new Error('No content'); },
      });

      const result = await apiClient.delete('https://api.test.com/items/1');

      expect(result).toBeUndefined();
    });
  });

  describe('timeout', () => {
    it('10초 후 타임아웃 에러를 발생시킨다', async () => {
      mockFetch.mockImplementation((_, options) =>
        new Promise((resolve, reject) => {
          const signal = options?.signal as AbortSignal | undefined;
          if (signal) {
            signal.addEventListener('abort', () => {
              const abortError = new Error('AbortError');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
        })
      );

      const requestPromise = apiClient.get('https://api.test.com/slow', { retries: 0 })
        .catch((err) => err as ApiError);

      // Fast-forward timers
      jest.advanceTimersByTime(10000);
      await jest.runAllTimersAsync();

      const error = await requestPromise;
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ type: 'timeout' });

    });
  });

  describe('retry logic', () => {
    it('네트워크 에러 시 3회 재시도한다', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        });

      const requestPromise = apiClient.get('https://api.test.com/data').catch((err) => err as ApiError);

      // Fast-forward through retries (1s, 2s, 4s delays with jitter)
      for (let i = 0; i < 3; i++) {
        await Promise.resolve(); // Let current attempt fail
        jest.advanceTimersByTime(10000); // More than max delay
        await jest.runAllTimersAsync();
      }

      const result = await requestPromise;
      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('재시도 가능한 HTTP 상태 코드에서 재시도한다 (500, 502, 503, 504)', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ message: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        });

      const requestPromise = apiClient.get('https://api.test.com/data')
        .catch((err) => err as ApiError);

      // Fast-forward through retry
      await Promise.resolve();
      jest.advanceTimersByTime(10000);
      await jest.runAllTimersAsync();

      const result = await requestPromise;
      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('재시도 불가능한 HTTP 상태 코드에서 즉시 실패한다 (400, 401, 403, 404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      await expect(apiClient.get('https://api.test.com/notfound')).rejects.toMatchObject({
        type: 'http',
        status: 404,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('최대 재시도 횟수 초과 시 마지막 에러를 throw한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const requestPromise = apiClient.get('https://api.test.com/data')
        .catch((err) => err as ApiError);

      // Fast-forward through all retries
      for (let i = 0; i < 4; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(10000);
        await jest.runAllTimersAsync();
      }

      const error = await requestPromise;
      expect(error).toMatchObject({ type: 'network' });

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('error handling', () => {
    it('HTTP 에러 응답을 ApiError로 변환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: '인증이 필요합니다', code: 'UNAUTHORIZED' }),
      });

      await expect(apiClient.get('https://api.test.com/protected')).rejects.toMatchObject({
        type: 'http',
        status: 401,
        message: '인증이 필요합니다',
        code: 'UNAUTHORIZED',
      });
    });

    it('JSON 파싱 에러를 처리한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(apiClient.get('https://api.test.com/data')).rejects.toMatchObject({
        type: 'parse',
      });
    });
  });

  describe('ApiError class', () => {
    it('network 에러를 생성한다', () => {
      const error = ApiError.network();
      expect(error.type).toBe('network');
      expect(error.message).toBe('네트워크 연결을 확인해주세요');
    });

    it('timeout 에러를 생성한다', () => {
      const error = ApiError.timeout();
      expect(error.type).toBe('timeout');
      expect(error.message).toBe('요청 시간이 초과되었습니다');
    });

    it('http 에러를 생성한다', () => {
      const error = ApiError.http(404, { message: 'Not found', code: 'NOT_FOUND' });
      expect(error.type).toBe('http');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('parse 에러를 생성한다', () => {
      const error = ApiError.parse();
      expect(error.type).toBe('parse');
      expect(error.message).toBe('응답을 처리할 수 없습니다');
    });
  });
});
