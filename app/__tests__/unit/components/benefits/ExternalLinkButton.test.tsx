/**
 * ExternalLinkButton 컴포넌트 테스트
 * Story 3.8: Implement External Link to Government Page
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ExternalLinkButton } from '@/components/benefits/ExternalLinkButton';
import * as externalLink from '@/utils/external-link';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock external-link utils
jest.mock('@/utils/external-link', () => ({
  isValidUrl: jest.fn(),
  openExternalLink: jest.fn(),
}));

const mockIsValidUrl = externalLink.isValidUrl as jest.Mock;
const mockOpenExternalLink = externalLink.openExternalLink as jest.Mock;

describe('ExternalLinkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidUrl.mockReturnValue(true);
    mockOpenExternalLink.mockResolvedValue({ success: true });
  });

  describe('렌더링', () => {
    it('유효한 URL이 있으면 버튼이 렌더링된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" />);

      expect(screen.getByText('공식 페이지 보기')).toBeTruthy();
    });

    it('커스텀 라벨이 표시된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" label="신청 페이지" />);

      expect(screen.getByText('신청 페이지')).toBeTruthy();
    });

    it('유효하지 않은 URL이면 렌더링되지 않는다', () => {
      mockIsValidUrl.mockReturnValue(false);
      const { toJSON } = render(<ExternalLinkButton url="invalid-url" />);

      expect(toJSON()).toBeNull();
    });

    it('URL이 undefined면 렌더링되지 않는다', () => {
      mockIsValidUrl.mockReturnValue(false);
      const { toJSON } = render(<ExternalLinkButton url={undefined} />);

      expect(toJSON()).toBeNull();
    });
  });

  describe('확인 다이얼로그', () => {
    it('버튼 클릭 시 확인 다이얼로그가 표시된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" />);

      fireEvent.press(screen.getByText('공식 페이지 보기'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '외부 페이지 이동',
        '정부 공식 페이지로 이동합니다.\n이동하시겠습니까?',
        expect.arrayContaining([
          expect.objectContaining({ text: '취소' }),
          expect.objectContaining({ text: '이동' }),
        ])
      );
    });

    it('showConfirmDialog=false면 다이얼로그 없이 바로 열린다', async () => {
      mockIsValidUrl.mockReturnValue(true);
      render(
        <ExternalLinkButton url="https://example.com" showConfirmDialog={false} />
      );

      fireEvent.press(screen.getByText('공식 페이지 보기'));

      await waitFor(() => {
        expect(mockOpenExternalLink).toHaveBeenCalledWith('https://example.com');
      });
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('다이얼로그에서 "이동" 클릭 시 링크가 열린다', async () => {
      mockIsValidUrl.mockReturnValue(true);
      (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
        // "이동" 버튼 클릭 시뮬레이션
        const confirmButton = buttons?.find(
          (b: { text: string }) => b.text === '이동'
        );
        confirmButton?.onPress?.();
      });

      render(<ExternalLinkButton url="https://example.com" />);
      fireEvent.press(screen.getByText('공식 페이지 보기'));

      await waitFor(() => {
        expect(mockOpenExternalLink).toHaveBeenCalledWith('https://example.com');
      });
    });

    it('다이얼로그에서 "취소" 클릭 시 링크가 열리지 않는다', () => {
      mockIsValidUrl.mockReturnValue(true);
      (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
        // "취소" 버튼 클릭 시뮬레이션 - 아무 동작 없음
        const cancelButton = buttons?.find(
          (b: { text: string }) => b.text === '취소'
        );
        cancelButton?.onPress?.();
      });

      render(<ExternalLinkButton url="https://example.com" />);
      fireEvent.press(screen.getByText('공식 페이지 보기'));

      expect(mockOpenExternalLink).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('링크 열기 실패 시 에러 다이얼로그가 표시된다', async () => {
      mockIsValidUrl.mockReturnValue(true);
      mockOpenExternalLink.mockResolvedValue({
        success: false,
        error: '페이지를 열 수 없습니다',
      });

      // Alert.alert가 호출될 때마다 기록
      const alertCalls: unknown[][] = [];
      (Alert.alert as jest.Mock).mockImplementation((...args) => {
        alertCalls.push(args);
        // 첫 번째 호출이 확인 다이얼로그면 "이동" 버튼 클릭
        if (args[0] === '외부 페이지 이동') {
          const buttons = args[2] as { text: string; onPress?: () => void }[];
          const confirmButton = buttons?.find((b) => b.text === '이동');
          confirmButton?.onPress?.();
        }
      });

      render(<ExternalLinkButton url="https://example.com" />);
      fireEvent.press(screen.getByText('공식 페이지 보기'));

      await waitFor(() => {
        expect(alertCalls).toContainEqual(['오류', '페이지를 열 수 없습니다']);
      });
    });
  });

  describe('비활성화 상태', () => {
    it('disabled=true면 버튼이 비활성화된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" disabled={true} />);

      const button = screen.getByLabelText('공식 페이지 보기 새 창에서 열기');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('비활성화된 버튼 클릭 시 다이얼로그가 표시되지 않는다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" disabled={true} />);

      fireEvent.press(screen.getByText('공식 페이지 보기'));

      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('URL이 유효하지 않으면 렌더링되지 않는다 (disabled 여부와 무관)', () => {
      mockIsValidUrl.mockReturnValue(false);
      const { toJSON } = render(<ExternalLinkButton url="invalid-url" disabled={true} />);

      expect(toJSON()).toBeNull();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중 "여는 중..." 텍스트가 표시된다', async () => {
      mockIsValidUrl.mockReturnValue(true);
      // openExternalLink가 resolve되기 전까지 pending 상태 유지
      mockOpenExternalLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );
      (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
        const confirmButton = buttons?.find(
          (b: { text: string }) => b.text === '이동'
        );
        confirmButton?.onPress?.();
      });

      render(<ExternalLinkButton url="https://example.com" />);
      fireEvent.press(screen.getByText('공식 페이지 보기'));

      // 로딩 중 텍스트 확인
      await waitFor(() => {
        expect(screen.getByText('여는 중...')).toBeTruthy();
      });
    });

    it('로딩 중 버튼이 비활성화된다', async () => {
      mockIsValidUrl.mockReturnValue(true);
      mockOpenExternalLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );
      (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
        const confirmButton = buttons?.find(
          (b: { text: string }) => b.text === '이동'
        );
        confirmButton?.onPress?.();
      });

      render(<ExternalLinkButton url="https://example.com" />);
      fireEvent.press(screen.getByText('공식 페이지 보기'));

      await waitFor(() => {
        const button = screen.getByLabelText('공식 페이지 보기 새 창에서 열기');
        expect(button.props.accessibilityState.disabled).toBe(true);
      });
    });
  });

  describe('접근성', () => {
    it('accessibilityRole이 link로 설정된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" />);

      const button = screen.getByLabelText('공식 페이지 보기 새 창에서 열기');
      expect(button.props.accessibilityRole).toBe('link');
    });

    it('accessibilityLabel이 설정된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" />);

      expect(
        screen.getByLabelText('공식 페이지 보기 새 창에서 열기')
      ).toBeTruthy();
    });

    it('accessibilityHint가 설정된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" />);

      const button = screen.getByLabelText('공식 페이지 보기 새 창에서 열기');
      expect(button.props.accessibilityHint).toBe('외부 브라우저로 이동합니다');
    });

    it('비활성화 상태가 접근성 상태에 반영된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      render(<ExternalLinkButton url="https://example.com" disabled={true} />);

      const button = screen.getByLabelText('공식 페이지 보기 새 창에서 열기');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('다크모드', () => {
    it('light 모드에서 렌더링된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      const { toJSON } = render(
        <ExternalLinkButton url="https://example.com" colorScheme="light" />
      );

      expect(toJSON()).not.toBeNull();
    });

    it('dark 모드에서 렌더링된다', () => {
      mockIsValidUrl.mockReturnValue(true);
      const { toJSON } = render(
        <ExternalLinkButton url="https://example.com" colorScheme="dark" />
      );

      expect(toJSON()).not.toBeNull();
    });
  });
});
