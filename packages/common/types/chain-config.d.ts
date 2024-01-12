export type TChainConfig = {
  chainId: string
  rpcUrl: string
  displayName: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals?: number
  }
}