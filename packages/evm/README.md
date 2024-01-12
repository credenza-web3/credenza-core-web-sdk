# CREDENZA WEB SDK EvmExtension

## Installation

```
npm i @credenza3/web-sdk-ext-evm

import { EvmExtension } from '@credenza3/web-sdk-ext-evm'
```

## Usage

Define chain config

```
const chainConfig = {
  chainId: '0x13881',
  rpcUrl: 'https://polygon-mumbai-bor.publicnode.com',
  displayName: 'Mumbai',
  blockExplorer: 'https://mumbai.polygonscan.com/',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals?: 18, // defaults to 18
  },
} // chain specific config
```

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new EvmExtension(chainConfig)],
  ...other sdk params
})
```

Switch Chain

```
await sdk.evm.switchChain(chainConfig)
```

Get provider

```
const evmProvider = await sdk.evm.getProvider()
```