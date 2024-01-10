import type { CredenzaSDK } from '@packages/core/src/main'
import { CredenzaProvider } from './provider/provider'


export class EvmExtension {
  public name = 'evm' as const
  private sdk: CredenzaSDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public provider: CredenzaProvider

  async initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.provider = new CredenzaProvider({
      url: 'https://chiliz-spicy.publicnode.com/',
      sdk: this.sdk,
    })
  }

  
}
