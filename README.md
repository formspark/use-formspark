# use-formspark

## Installation

##### NPM

> `npm i --save @formspark/use-formspark`

##### Yarn:

> `yarn add @formspark/use-formspark`

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
        name="message"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};
```