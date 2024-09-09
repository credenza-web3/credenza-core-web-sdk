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

## ZK blockchain operations

(ALL methods listed below are avaialbe directly by using sdk.sui.METHOD_NAME if ZK extensions is used. So basically sdk.sui.getAddress is returning the result of sdk.sui.zkLogin.getAddress if ZK extensions is active)

Get current sui ZK address

```
const address = await sdk.sui.zkLogin.getAddress(): string
```

Sign Personal message

```
const result = await sdk.sui.zkLogin.signPersonalMessage(message: string): Promise<{signature: string; bytes: string}
```

Sign Transaction block

```
const result = await sdk.sui.zkLogin.signTransactionBlock(tbx: Transaction): Promise<{signature: string; transactionBlock: Uint8Array}
```
