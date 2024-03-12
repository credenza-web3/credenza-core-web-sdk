# CREDENZA WEB SDK MetamaskExtension

## Installation

```
npm i @credenza3/core-web-evm-metamask-ext

import { MetamaskExtension } from '@credenza3/core-web-evm-metamask-ext'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [
    new EvmExtension({
      chainConfig,
      extensions: [new MetamaskExtension()],
    })
  ],
})
```

Login with metamask

```
await sdk.evm.metamask.login()
```
