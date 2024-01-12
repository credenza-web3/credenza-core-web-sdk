# CREDENZA WEB SDK AccountExtension

## Installation

```
npm i @credenza3/web-sdk-ext-account

import { AccountExtension } from '@credenza3/web-sdk-ext-account'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new AccountExtension()],
  ...other sdk params
})
```

Get UserInfo

```
await sdk.account.info()
```
