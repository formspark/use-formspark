import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormsparkError, useFormspark } from '../src';

describe('useFormspark', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('toggles submitting state during a call', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const response = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => response),
    );
    const { result } = renderHook(() => useFormspark({ formId: 'echo' }));
    expect(result.current[1]).toBe(false);
    let promise: Promise<unknown> = Promise.resolve();
    act(() => {
      promise = result.current[0]({ message: 'state' });
    });
    expect(result.current[1]).toBe(true);
    await act(async () => {
      if (!resolveFetch) throw new Error('Expected a pending request');
      resolveFetch(new Response('{}'));
      await promise;
    });
    expect(result.current[1]).toBe(false);
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
      vi.fn().mockResolvedValue(
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
    if (!(caught instanceof FormsparkError)) throw caught;
    const error = caught;
    expect(error.status).toBe(429);
    expect(error.body).toEqual({ error: 'rate limited' });
    expect(error.message).toBe('Formspark responded with 429');
  });

  it('keeps a non-JSON error body as raw text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 502 })),
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
    if (!(caught instanceof FormsparkError)) throw caught;
    expect(caught.body).toBe('Bad Gateway');
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

  it('resets submitting after an invalid success response and permits a retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('invalid json'))
      .mockResolvedValueOnce(new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useFormspark({ formId: 'x' }));
    await act(async () => {
      await expect(result.current[0]({})).rejects.toBeInstanceOf(SyntaxError);
    });
    expect(result.current[1]).toBe(false);
    await act(async () => {
      await expect(result.current[0]({})).resolves.toEqual({ ok: true });
    });
    expect(result.current[1]).toBe(false);
  });

  it('submits to the new form after its id changes', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    const { result, rerender } = renderHook(
      ({ formId }) => useFormspark({ formId }),
      { initialProps: { formId: 'first' } },
    );
    rerender({ formId: 'second' });
    await act(async () => {
      await result.current[0]({});
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://submit-form.com/second',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
