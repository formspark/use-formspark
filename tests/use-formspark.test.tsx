import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormsparkError, useFormspark } from '../src';

describe('useFormspark', () => {
  it('submits to /echo and resolves with the echoed payload', async () => {
    const { result } = renderHook(() => useFormspark({ formId: 'echo' }));
    let response: unknown;
    await act(async () => {
      response = await result.current[0]({ message: 'Hello, World!' });
    });
    expect(response).toMatchObject({ message: 'Hello, World!' });
  });

  it('throws FormsparkError with status 404 when the form does not exist', async () => {
    const { result } = renderHook(() =>
      useFormspark({ formId: 'this-form-id-does-not-exist' }),
    );
    let caught: unknown;
    await act(async () => {
      try {
        await result.current[0]({ message: 'should fail' });
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBeInstanceOf(FormsparkError);
    expect((caught as FormsparkError).status).toBe(404);
  });

  it('toggles submitting state during a call', async () => {
    const { result } = renderHook(() => useFormspark({ formId: 'echo' }));
    expect(result.current[1]).toBe(false);
    let promise: Promise<unknown> = Promise.resolve();
    act(() => {
      promise = result.current[0]({ message: 'state' });
    });
    expect(result.current[1]).toBe(true);
    await act(async () => {
      await promise;
    });
    expect(result.current[1]).toBe(false);
  });

  it('keeps submit identity stable across renders for same formId', () => {
    const { result, rerender } = renderHook(
      ({ formId }: { formId: string }) => useFormspark({ formId }),
      { initialProps: { formId: 'echo' } },
    );
    const first = result.current[0];
    rerender({ formId: 'echo' });
    expect(result.current[0]).toBe(first);
  });
});
