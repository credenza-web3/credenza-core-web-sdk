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

Login with metamask and set access token

```
await sdk.evm.metamask.login()
```

Get metamask address

```
const address = await sdk.evm.metamask.getAddress()
```
