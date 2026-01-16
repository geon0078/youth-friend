/**
 * useDebounce 훅 테스트
 * Story 3.6: 검색 기능
 */
import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@/hooks/use-debounce';

// 타이머 모킹
jest.useFakeTimers();

interface DebounceTestProps {
  value: string | number | object;
  delay: number;
}

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('지연 시간 전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook<string, DebounceTestProps>(
      (props) => useDebounce(props.value as string, props.delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // 값 변경
    rerender({ value: 'updated', delay: 300 });

    // 아직 지연 시간이 지나지 않음
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('initial');
  });

  it('지연 시간 후에 새 값을 반환한다', () => {
    const { result, rerender } = renderHook<string, DebounceTestProps>(
      (props) => useDebounce(props.value as string, props.delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // 값 변경
    rerender({ value: 'updated', delay: 300 });

    // 지연 시간 경과
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('연속 변경 시 마지막 값만 반영한다', () => {
    const { result, rerender } = renderHook<string, DebounceTestProps>(
      (props) => useDebounce(props.value as string, props.delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    // 연속 변경
    rerender({ value: 'ab', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abc', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abcd', delay: 300 });

    // 아직 지연 시간이 지나지 않음
    expect(result.current).toBe('a');

    // 마지막 변경 후 300ms 경과
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abcd');
  });

  it('지연 시간을 변경해도 올바르게 동작한다', () => {
    const { result, rerender } = renderHook<string, DebounceTestProps>(
      (props) => useDebounce(props.value as string, props.delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // 지연 시간 변경
    rerender({ value: 'updated', delay: 500 });

    // 300ms 후에도 아직 변경 안됨
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // 500ms 후 변경됨
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('숫자 타입도 지원한다', () => {
    const { result, rerender } = renderHook<number, DebounceTestProps>(
      (props) => useDebounce(props.value as number, props.delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    rerender({ value: 100, delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('객체 타입도 지원한다', () => {
    const initialValue = { name: 'initial' };
    const updatedValue = { name: 'updated' };

    const { result, rerender } = renderHook<{ name: string }, DebounceTestProps>(
      (props) => useDebounce(props.value as { name: string }, props.delay),
      { initialProps: { value: initialValue, delay: 300 } }
    );

    rerender({ value: updatedValue, delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedValue);
  });
});
