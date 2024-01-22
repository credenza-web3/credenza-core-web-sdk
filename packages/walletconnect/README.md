# CREDENZA WEB SDK WalletConnectExtension

## Installation

```
npm i @credenza3/web-sdk-ext-walletconnect

import { WalletConnectExtension } from '@credenza3/web-sdk-ext-walletconnect'
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
