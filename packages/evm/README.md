# CREDENZA WEB SDK EvmExtension

## Installation

```
npm i @credenza3/core-web-evm-ext

import { EvmExtension } from '@credenza3/core-web-evm-ext'
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
  extensions: [
    new EvmExtension({
      chainConfig,
      extensions: [
        new MetamaskExtension(),
        new WalletConnectExtension(),
      ],
    })
  ],
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

## Credenza EVM provider

In case you need the only credenza evm provider

```
import { CredenzaProvider } from '@credenza3/core-web-evm-ext'
```

## Ethers js

[https://www.npmjs.com/package/ethers](https://www.npmjs.com/package/ethers)

If you prefer to use ethers.js you can import it from the evm extension

```
import { ethers } from '@credenza3/core-web-evm-ext'
```

Get ethers provider

```
// wraps evmProvider with new ethers.BrowserProvider()
const provider = await sdk.evm.getEthersProvider()
```

## Events

```
const event = EvmExtension.EVM_EVENT.<EVENT_NAME>
const unsubscribe = sdk.evm.on(event, (data) => {})
sdk.once(event, (data) => {})
```
