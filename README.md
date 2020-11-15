# use-formspark

[![Continuous deployment](https://github.com/formspark/use-formspark/workflows/Continuous%20deployment/badge.svg)](https://github.com/formspark/use-formspark/actions?query=workflow%3A%22Continuous+deployment%22)

React hooks for [Formspark](https://formspark.io).

## Installation

```bash
# NPM
npm i --save @formspark/use-formspark

# Yarn 
yarn add @formspark/use-formspark
```

## Usage

```tsx
import React, { useState } from "react";
import { useFormspark } from '@formspark/use-formspark';

const ContactForm = () => {
  const [submit, submitting] = useFormspark({
    formId: "your-form-id"
  });
  const [message, setMessage] = useState("");
  return (
    <form onSubmit={(e) => {
        e.preventDefault();
        submit({ message })
    }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={submitting}>Send</button>
    </form>
  );
};
```

**Note:** do not mistake action url (e.g. `https://submit-form.com/capybara`) and form id (e.g. `capybara`), this package only uses the latter.
