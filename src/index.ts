import { useState } from 'react';
import { Args, SubmitPayload } from './types/use-formspark';

export const useFormspark = (args: Args) => {
  const [submitting, setSubmitting] = useState(false);

  const submit = (payload: SubmitPayload) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', `https://submit-form.com/${args.formId}`);

      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          setSubmitting(false);
          const status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.response);
          } else {
            reject(xhr.statusText);
          }
        }
      };

      setSubmitting(true);

      xhr.send(JSON.stringify(payload));
    });
  };

  return [submit, submitting];
};

export * from './types/use-formspark';
