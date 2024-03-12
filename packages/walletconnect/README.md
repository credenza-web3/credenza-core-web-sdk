# CREDENZA WEB SDK WalletConnectExtension

## Installation

```
npm i @credenza3/core-web-evm-walletconnect-ext

import { WalletConnectExtension } from '@credenza3/core-web-evm-walletconnect-ext'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [
    new EvmExtension({
      chainConfig,
      extensions: [
        new WalletConnectExtension({
          projectId: string,
          metadata: {
            name: string,
            description: string,
            url: string,
            icons: string[],
          },
        }),
      ],
    })
  ],
})
```

Login with WalletConnect

```
await sdk.evm.walletconnect.login()
```
