export const SUI_NETWORK = {
  LOCALNET: 'localnet',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
} as const

export const SUI_RPC_URLS = {
  [SUI_NETWORK.LOCALNET]: 'http://127.0.0.1:9000',
  [SUI_NETWORK.DEVNET]: 'https://fullnode.devnet.sui.io:443',
  [SUI_NETWORK.TESTNET]: 'https://rpc.ankr.com/sui_testnet',
  [SUI_NETWORK.MAINNET]: 'https://fullnode.mainnet.sui.io:443',
} as const
