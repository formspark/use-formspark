import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('useFormspark with a mocked fetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the payload as JSON to the encoded form URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useFormspark({ formId: 'a b/c' }));
    let response: unknown;
    await act(async () => {
      response = await result.current[0]({ message: 'hi' });
    });
    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://submit-form.com/a%20b%2Fc',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'hi' }),
      },
    );
  });

  it('parses a JSON error body into FormsparkError.body', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'rate limited' }), {
            status: 429,
          }),
        ),
    );
    const { result } = renderHook(() => useFormspark({ formId: 'x' }));
    let caught: unknown;
    await act(async () => {
      try {
        await result.current[0]({});
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBeInstanceOf(FormsparkError);
    const error = caught as FormsparkError;
    expect(error.status).toBe(429);
    expect(error.body).toEqual({ error: 'rate limited' });
    expect(error.message).toBe('Formspark responded with 429');
  });

  it('keeps a non-JSON error body as raw text', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response('Bad Gateway', { status: 502 })),
    );
    const { result } = renderHook(() => useFormspark({ formId: 'x' }));
    let caught: unknown;
    await act(async () => {
      try {
        await result.current[0]({});
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBeInstanceOf(FormsparkError);
    expect((caught as FormsparkError).body).toBe('Bad Gateway');
  });

  it('resets submitting to false after a failed submit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('network down')),
    );
    const { result } = renderHook(() => useFormspark({ formId: 'x' }));
    let caught: unknown;
    await act(async () => {
      try {
        await result.current[0]({});
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBeInstanceOf(TypeError);
    expect(result.current[1]).toBe(false);
  });
});
