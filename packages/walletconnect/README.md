# CREDENZA WEB SDK MetamaskExtension

## Installation

```
npm i @credenza3/web-sdk-ext-metamask

import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new MetamaskExtension()],
  ...other sdk params
})
```

Login with metamask

```
await sdk.metamask.login()
```
