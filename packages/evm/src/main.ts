import type { CredenzaSDK } from '@packages/core/src/main'
import type { CredenzaProvider } from './provider/provider'
import { LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { TChainConfig } from './types'

export class EvmExtension {
  public name = 'evm' as const
  private sdk: CredenzaSDK
  private provider: CredenzaProvider | MetaMaskInpageProvider
  private loginProvider: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]
  private chainConfig: TChainConfig

  constructor(params: TChainConfig) {
    if (!params.chainId || !params.rpcUrl) throw new Error('chainId and rpcUrl are required fields')
    if (!params.chainId.includes('0x')) throw new Error('Chain id must be a hex value 0x prefixed')
    this.chainConfig = params
  }

  private async _buildAndConnectToNewCredenzaProvider(sdk: CredenzaSDK, chainConfig: TChainConfig) {
    const { CredenzaProvider } = await import('./provider/provider')
    this.provider = new CredenzaProvider({ ...chainConfig, sdk })
    await this.provider.connect()
  }

  async initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    const accessToken = this.sdk.getAccessToken()
    const loginType = this.sdk.getLoginType()
    if (!accessToken || !loginType) return

    if (loginType === LS_LOGIN_TYPE.METAMASK && sdk.metamask) {
      await this.sdk.metamask.switchChain(this.chainConfig)
      this.provider = await sdk.metamask.getProvider()
    } else if (loginType === LS_LOGIN_TYPE.OAUTH) {
      await this._buildAndConnectToNewCredenzaProvider(this.sdk, this.chainConfig)
    }
    this.loginProvider = loginType
  }

  async getProvider() {
    return this.provider
  }

  async switchChain(params: TChainConfig) {
    if (this.loginProvider === LS_LOGIN_TYPE.METAMASK && this.sdk.metamask) {
      await this.sdk.metamask.switchChain(params)
    } else if (this.loginProvider === LS_LOGIN_TYPE.OAUTH) {
      await this._buildAndConnectToNewCredenzaProvider(this.sdk, params)
    }
    this.chainConfig = params
  }
}
