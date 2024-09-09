# CREDENZA WEB SDK SuiExtension

## Installation

```
npm i @mysten/sui
npm i @credenza3/core-web-sui-ext

import { SuiExtension } from '@credenza3/core-web-sui-ext'
```

## Constants for reference

```
SUI_NETWORK = {
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
}
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [
    new SuiExtension({suiNetwork: SuiExtension.SUI_NETWORK.<NETWORK_NAME>}) // Defaults to SuiExtension.SuiExtension.SUI_NETWORK.MAINNET
  ],
})
```

Switch Network

```
await sdk.sui.switchNetwork(SuiExtension.SUI_NETWORK.<NETWORK_NAME>): {client: SuiClient, network: string}
```

Get sui sdk client

```
const client = sdk.sui.getSuiClient(): SuiClient
```

Get sui sdk graphql client

```
const gqlClient = sdk.sui.getSuiGqlClient(): SuiGraphQLClient
```

Get current sui network name

```
const network = sdk.sui.getNetworkName(): string
```

Get current sui address

```
const address = await sdk.sui.getAddress(): string
```

Sign Personal message

```
const result = await sdk.sui.signPersonalMessage(message: string): Promise<{signature: string; bytes: string}
```

Sign Transaction block

```
const result = await sdk.sui.signTransactionBlock(tbx: Transaction): Promise<{signature: string; transactionBlock: Uint8Array}
```

Sign And execute Transaction block

```
const result = await sdk.sui.signAndExecuteTransactionBlock(tbx: Transaction)
```
