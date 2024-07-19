import { TSuiNetwork } from '@packages/sui/src/main.types'

export const getZkProofUrl = (network: TSuiNetwork) => {
  switch (network) {
    case 'mainnet':
    case 'testnet':
      return 'https://prover.mystenlabs.com/v1'
    case 'devnet':
      return 'https://prover-dev.mystenlabs.com/v1'
    default:
      throw new Error('Invalid network')
  }
}
