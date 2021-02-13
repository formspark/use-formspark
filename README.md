<p align="center">
    <a href="https://formspark.io">
        <img width="64" src="https://cdn.formspark.io/images/formspark/logos/formspark.svg" alt="Formspark logo">
    </a>
</p>

<h1 align="center">use-formspark</h1>

<p align="center">
    React hooks for <a href="https://formspark.io">Formspark</a>.
</p>

<p align="center">
    Works with React and React Native.
</p>

[![Continuous deployment](https://github.com/formspark/use-formspark/workflows/Continuous%20deployment/badge.svg)](https://github.com/formspark/use-formspark/actions?query=workflow%3A%22Continuous+deployment%22)

## Installation

```bash
# NPM
npm install @formspark/use-formspark

# Yarn 
yarn add @formspark/use-formspark
```

## Usage

```tsx
import React, { useState } from "react";
import { useFormspark } from "@formspark/use-formspark";

const ContactForm = () => {
  const [submit, submitting] = useFormspark({
    formId: "your-form-id"
  });
  const [message, setMessage] = useState("");
  return (
    <form onSubmit={async (e) => {
        e.preventDefault();
        await submit({ message })
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

## License

[MIT](https://opensource.org/licenses/MIT)