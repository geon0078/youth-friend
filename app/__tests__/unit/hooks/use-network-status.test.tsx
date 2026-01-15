/**
 * 네트워크 상태 훅 테스트
 * - useNetworkStatus
 * - useIsOffline
 * - useRefreshNetworkStatus
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useNetworkStatus,
  useIsOffline,
  useRefreshNetworkStatus,
} from '@/hooks/use-network-status';

// NetInfo 모킹
const mockNetInfoState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
};

let netInfoListener: ((state: typeof mockNetInfoState) => void) | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
  addEventListener: jest.fn((callback) => {
    netInfoListener = callback;
    return () => {
      netInfoListener = null;
    };
  }),
}));

import NetInfo from '@react-native-community/netinfo';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    netInfoListener = null;
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });
  });

  it('초기 상태를 낙관적으로 설정한다 (연결됨)', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    // 초기 상태: 낙관적으로 연결됨
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it('NetInfo에서 초기 상태를 가져온다', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.type).toBe('wifi');
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  it('네트워크 상태 변경을 구독한다', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('네트워크 상태 변경 시 업데이트된다', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 오프라인으로 변경
    act(() => {
      netInfoListener?.({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('none');
  });

  it('언마운트 시 구독을 해제한다', async () => {
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    // 리스너가 해제되었는지 확인
    expect(netInfoListener).toBeNull();
  });

  it('NetInfo.fetch 실패 시 기본값을 유지한다', async () => {
    (NetInfo.fetch as jest.Mock).mockRejectedValueOnce(new Error('NetInfo error'));

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 에러 시에도 낙관적으로 연결됨 유지
    expect(result.current.isConnected).toBe(true);
  });
});

describe('useIsOffline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    netInfoListener = null;
  });

  it('온라인 상태에서 false를 반환한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const { result } = renderHook(() => useIsOffline());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('오프라인 상태에서 true를 반환한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { result } = renderHook(() => useIsOffline());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('isConnected만 false여도 오프라인으로 판단한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: null,
      type: 'none',
    });

    const { result } = renderHook(() => useIsOffline());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('isInternetReachable이 false면 오프라인으로 판단한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: false,
      type: 'wifi',
    });

    const { result } = renderHook(() => useIsOffline());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('isInternetReachable이 null이면 isConnected만 확인한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: null,
      type: 'wifi',
    });

    const { result } = renderHook(() => useIsOffline());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useRefreshNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refresh 함수와 isRefreshing 상태를 반환한다', () => {
    const { result } = renderHook(() => useRefreshNetworkStatus());

    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.isRefreshing).toBe('boolean');
    expect(result.current.isRefreshing).toBe(false);
  });

  it('refresh 호출 시 NetInfo.fetch를 호출한다', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
    });

    const { result } = renderHook(() => useRefreshNetworkStatus());

    await act(async () => {
      const status = await result.current.refresh();
      expect(status.isConnected).toBe(true);
      expect(status.type).toBe('cellular');
    });

    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  it('refresh 중 isRefreshing이 true가 된다', async () => {
    let resolvePromise: (value: any) => void;
    (NetInfo.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useRefreshNetworkStatus());

    let refreshPromise: Promise<any>;
    act(() => {
      refreshPromise = result.current.refresh();
    });

    // refresh 중에는 isRefreshing이 true
    expect(result.current.isRefreshing).toBe(true);

    // resolve
    await act(async () => {
      resolvePromise!({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });
      await refreshPromise;
    });

    // refresh 완료 후 isRefreshing이 false
    expect(result.current.isRefreshing).toBe(false);
  });

  it('refresh 실패 시에도 isRefreshing이 false로 복원된다', async () => {
    (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRefreshNetworkStatus());

    await act(async () => {
      try {
        await result.current.refresh();
      } catch {
        // 에러 무시
      }
    });

    expect(result.current.isRefreshing).toBe(false);
  });
});
