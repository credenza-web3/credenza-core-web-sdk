# Credenza EVM Provider

A standalone EVM provider implementation for Credenza3 authentication that implements the EIP-1193 standard.

## Installation

```
  npm i @credenza3/core-web-evm-provider-ext
```

## Overview

`CredenzaProvider` is a custodial EVM provider that uses Credenza3's backend for key management and transaction signing. It implements the standard `Eip1193Provider` interface, making it compatible with ethers.js and other Web3 libraries.

## Usage

### Basic Setup

```
import CredenzaProvider from '@credenza3/core-web-evm-provider-ext'


const provider = new CredenzaProvider({
  rpcUrl: '',
  accessToken: 'your-credenza-access-token',
  env: 'staging', // 'prod' | 'staging'
})

await provider.connect()
```

### Using with ethers.js

```
import { BrowserProvider } from 'ethers'

const ethersProvider = new BrowserProvider(provider)
const signer = await ethersProvider.getSigner()

const address = await signer.getAddress()

const tx = await signer.sendTransaction({
  to: '0x...',
  value: ethers.parseEther('0.1'),
})
```

## API Reference

### Constructor

```
  new CredenzaProvider(params: {
    rpcUrl: string
    accessToken?: string
    env: string
  })
```

**Parameters:**

- `rpcUrl` - RPC URL of the blockchain network
- `accessToken` - Credenza3 authentication token
- `env` - Environment ('prod' | 'staging')

### Methods

#### `setAccessToken(accessToken: string)`

Updates the access token.

```
provider.setAccessToken('new-access-token')
```

#### `connect(): Promise<void>`

Connects to the blockchain network.

```
await provider.connect()
```

#### `disconnect(): Promise<void>`

Disconnects the provider.

```
await provider.disconnect()
```

#### `setRpcUrl(rpcUrl: string): Promise<void>`

Switches to a different blockchain network.

```
await provider.setRpcUrl('https://eth.llamarpc.com')
```

#### `getRpcUrl(): string`

Returns the current RPC URL.

```
const rpcUrl = provider.getRpcUrl()
```

#### `listAccounts(): Promise<string[]>`

Returns the list of accounts.

```
const accounts = await provider.listAccounts()
```

#### `getRpcProvider(): Promise<JsonRpcProvider>`

Returns the underlying ethers JsonRpcProvider.

```
const rpcProvider = await provider.getRpcProvider()
```

#### `request(args: { method: string; params?: unknown[] }): Promise<any>`

Implements EIP-1193 request method.

```
const accounts = await provider.request({ method: 'eth_accounts' })

const signature = await provider.request({
  method: 'personal_sign',
  params: [message, address],
})

const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{ to: '0x...', value: '0x...' }],
})
```

### Supported RPC Methods

**Account Methods:**

- `eth_requestAccounts` / `eth_accounts`
- `personal_sign` / `eth_sign`
- `eth_signTypedData` / `eth_signTypedData_v4`

**Transaction Methods:**

- `eth_signTransaction`
- `eth_sendTransaction` / `eth_sendRawTransaction`

**Standard Methods:**
All other standard Ethereum JSON-RPC methods are forwarded to the RPC provider.

## Example

```
import { CredenzaProvider } from '@packages/evm-provider'
import { BrowserProvider, parseEther } from 'ethers'

const provider = new CredenzaProvider({
  rpcUrl: 'https://eth.llamarpc.com',
  accessToken: 'your-token',
  env: 'prod',
})

await provider.connect()

const accounts = await provider.listAccounts()

const ethersProvider = new BrowserProvider(provider)
const signer = await ethersProvider.getSigner()

const tx = await signer.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  value: parseEther('0.01'),
})

await tx.wait()
```
