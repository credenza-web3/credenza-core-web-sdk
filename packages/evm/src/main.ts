import type { CredenzaSDK } from '@packages/core/src/main'
import type { CredenzaProvider } from './provider/provider'
import { LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'

let connectPromise: Promise<void>
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
    this.provider = new CredenzaProvider({ chainConfig, sdk })
    await this.provider.connect()
  }

  private async _connect() {
    const accessToken = this.sdk.getAccessToken()
    const loginType = this.sdk.getLoginType()
    if (!accessToken || !loginType) return

    if (loginType === LS_LOGIN_TYPE.METAMASK && this.sdk.metamask) {
      await this.sdk.metamask._switchChain(this.chainConfig)
      this.provider = await this.sdk.metamask._getProvider()
    } else if (loginType === LS_LOGIN_TYPE.OAUTH) {
      await this._buildAndConnectToNewCredenzaProvider(this.sdk, this.chainConfig)
    }
    this.loginProvider = loginType
  }

  private async _checkConnection() {
    if (connectPromise) await connectPromise
    if (!this.provider || !this.loginProvider) throw new Error('Provider is not connected')
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGIN, () => (connectPromise = this._connect()))
    this.sdk.on(SDK_EVENT.INIT, () => (connectPromise = this._connect()))
  }

  public async getProvider() {
    await this._checkConnection()
    return this.provider
  }

  public async switchChain(params: TChainConfig) {
    await this._checkConnection()
    if (this.loginProvider === LS_LOGIN_TYPE.METAMASK && this.sdk.metamask) {
      await this.sdk.metamask._switchChain(params)
    } else if (this.loginProvider === LS_LOGIN_TYPE.OAUTH) {
      await this._buildAndConnectToNewCredenzaProvider(this.sdk, params)
    }
    this.chainConfig = params
  }
}
