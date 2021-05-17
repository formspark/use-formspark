import 'whatwg-fetch';

import { useState } from 'react';
import { Args, SubmitPayload } from './types/use-formspark';

const BASE_URL = 'https://submit-form.com';

export const useFormspark = (args: Args) => {
  const [submitting, setSubmitting] = useState(false);

  const submit = (payload: SubmitPayload) => {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}/${args.formId}`;
      const method = 'POST';
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify(payload);
      setSubmitting(true);
      fetch(url, {
        method,
        headers,
        body,
      })
        .then(response => response.json())
        .then(json => {
          resolve(json);
        })
        .catch(error => {
          reject(error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    });
  };

  return [submit, submitting] as const;
};

export * from './types/use-formspark';
