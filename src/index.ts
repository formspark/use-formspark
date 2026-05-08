import { useCallback, useState } from 'react';
import { Args, SubmitPayload } from './types/use-formspark';

const BASE_URL = 'https://submit-form.com';

export class FormsparkError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Formspark responded with ${status}`);
    this.name = 'FormsparkError';
    this.status = status;
    this.body = body;
  }
}

export const useFormspark = ({ formId }: Args) => {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<unknown> => {
      const url = `${BASE_URL}/${encodeURIComponent(formId)}`;
      setSubmitting(true);
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          let body: unknown = text;
          try {
            body = JSON.parse(text);
          } catch {
            // not JSON — keep the raw text
          }
          throw new FormsparkError(response.status, body);
        }

        return await response.json();
      } finally {
        setSubmitting(false);
      }
    },
    [formId],
  );

  return [submit, submitting] as const;
};

export * from './types/use-formspark';
