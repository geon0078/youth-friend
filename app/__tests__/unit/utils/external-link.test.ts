/**
 * external-link 유틸리티 테스트
 * Story 3.8: Implement External Link to Government Page
 */
import { isValidUrl, openExternalLink } from '@/utils/external-link';
import * as WebBrowser from 'expo-web-browser';

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    AUTOMATIC: 'automatic',
  },
}));

describe('external-link utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidUrl', () => {
    it('유효한 https URL을 허용한다', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('https://example.go.kr/path?query=1')).toBe(true);
    });

    it('유효한 http URL을 허용한다', () => {
      expect(isValidUrl('http://www.example.com')).toBe(true);
    });

    it('undefined를 거부한다', () => {
      expect(isValidUrl(undefined)).toBe(false);
    });

    it('null을 거부한다', () => {
      expect(isValidUrl(null)).toBe(false);
    });

    it('빈 문자열을 거부한다', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('잘못된 URL 형식을 거부한다', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('http/https가 아닌 프로토콜을 거부한다', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///path/to/file')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('문자열이 아닌 값을 거부한다', () => {
      expect(isValidUrl(123 as unknown as string)).toBe(false);
      expect(isValidUrl({} as unknown as string)).toBe(false);
    });
  });

  describe('openExternalLink', () => {
    it('유효한 URL로 브라우저를 연다', async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockResolvedValue({
        type: 'dismiss',
      });

      const result = await openExternalLink('https://www.example.com');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        'https://www.example.com',
        expect.objectContaining({
          presentationStyle: 'automatic',
          dismissButtonStyle: 'close',
          enableBarCollapsing: true,
        })
      );
    });

    it('유효하지 않은 URL에서 에러를 반환한다', async () => {
      const result = await openExternalLink('not-a-url');

      expect(result.success).toBe(false);
      expect(result.error).toBe('유효하지 않은 URL입니다');
      expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
    });

    it('undefined URL에서 에러를 반환한다', async () => {
      const result = await openExternalLink(undefined);

      expect(result.success).toBe(false);
      expect(result.error).toBe('유효하지 않은 URL입니다');
    });

    it('null URL에서 에러를 반환한다', async () => {
      const result = await openExternalLink(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('유효하지 않은 URL입니다');
    });

    it('브라우저 열기 실패 시 에러를 반환한다', async () => {
      (WebBrowser.openBrowserAsync as jest.Mock).mockRejectedValue(
        new Error('Failed to open')
      );

      const result = await openExternalLink('https://www.example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('페이지를 열 수 없습니다. 다시 시도해 주세요.');
    });
  });
});
