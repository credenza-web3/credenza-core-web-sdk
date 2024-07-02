# CREDENZA WEB SDK SUI ZK EXTENSION

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
(ONLY available if ZkLoginExtension extension is used)

```
sdk.oauth.login({
  scope:
    'profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write',
  redirectUrl: window.location.href,
  nonce: sdk.sui.zkLogin.generateZkNonce(),
})

nonce: sdk.sui.zkLogin.generateZkNonce(), is mandatory for zk login
```
