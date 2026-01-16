/**
 * 외부 링크 열기 유틸리티
 * Story 3.8: Implement External Link to Government Page
 */
import * as WebBrowser from 'expo-web-browser';

/**
 * 외부 링크 열기 결과
 */
export interface OpenExternalLinkResult {
  success: boolean;
  error?: string;
}

/**
 * URL 유효성 검사
 * @param url 검사할 URL
 * @returns 유효한 URL인지 여부
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 외부 링크를 인앱 브라우저로 열기
 * @param url 열려는 URL
 * @returns 성공 여부와 에러 메시지
 */
export async function openExternalLink(
  url: string | undefined | null
): Promise<OpenExternalLinkResult> {
  if (!isValidUrl(url)) {
    return {
      success: false,
      error: '유효하지 않은 URL입니다',
    };
  }

  try {
    await WebBrowser.openBrowserAsync(url as string, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      dismissButtonStyle: 'close',
      enableBarCollapsing: true,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: '페이지를 열 수 없습니다. 다시 시도해 주세요.',
    };
  }
}
