export const SUI_NETWORK = {
  LOCALNET: 'localnet',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
} as const

export const SUI_RPC_URLS = {
  [SUI_NETWORK.LOCALNET]: 'http://127.0.0.1:9000',
  [SUI_NETWORK.DEVNET]: 'https://fullnode.devnet.sui.io:443',
  [SUI_NETWORK.TESTNET]: 'https://fullnode.testnet.sui.io:443',
  [SUI_NETWORK.MAINNET]: 'https://fullnode.mainnet.sui.io:443',
} as const

export const SUI_GQL_URLS = {
  [SUI_NETWORK.LOCALNET]: 'https://sui-devnet.mystenlabs.com/graphql',
  [SUI_NETWORK.DEVNET]: 'https://sui-devnet.mystenlabs.com/graphql',
  [SUI_NETWORK.TESTNET]: 'https://sui-testnet.mystenlabs.com/graphql',
  [SUI_NETWORK.MAINNET]: 'https://sui-mainnet.mystenlabs.com/graphql',
} as const

export const SUI_SIGN_METHODS = {
  SIGN_TRANSACTION: 'signTransaction',
  SIGN_PERSONAL_MESSAGE: 'signPersonalMessage',
} as const
