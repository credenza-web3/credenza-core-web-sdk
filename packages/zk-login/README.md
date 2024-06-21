# CREDENZA WEB SDK MetamaskExtension

## Installation

```
npm i @credenza3/core-web-sui-zklogin-ext

import { ZkLoginExtension } from '@credenza3/core-web-sui-zklogin-ext'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [
    new SuiExtension({ suiNetwork: suiNetworkName, extensions: [new ZkLoginExtension()] }),
  ]
})
```

Login with zklogin

```
await sdk.sui.zkLogin.login()
```
