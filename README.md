# use-formspark

[![Continuous deployment](https://github.com/formspark/use-formspark/workflows/Continuous%20deployment/badge.svg)](https://github.com/formspark/monorepo/actions?query=workflow%3A%22Continuous+deployment%22)

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
  const [submit, submitting] = useFormspark('your-form-id');
  const [message, setMessage] = useState("");
  return (
    <form onSubmit={submit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};
```