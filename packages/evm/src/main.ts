import type { CredenzaSDK } from '@packages/core/src/main'
import { CredenzaProvider } from './provider/provider'
import { LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import { EVM_PROVIDER_STATE, EVM_PROVIDER_CONNECTION_ERROR } from './main.constants'

export { CredenzaProvider }
export class EvmExtension {
  public name = 'evm' as const
  private state = EVM_PROVIDER_STATE.DISCONNECTED
  private sdk: CredenzaSDK
  private provider: CredenzaProvider | MetaMaskInpageProvider | undefined
  private loginProvider: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]
  private chainConfig: TChainConfig

  constructor(params: TChainConfig) {
    if (!params.chainId || !params.rpcUrl) throw new Error('chainId and rpcUrl are required fields')
    if (!params.chainId.includes('0x')) throw new Error('Chain id must be a hex value 0x prefixed')
    this.chainConfig = params
  }

  private async _buildAndConnectToNewCredenzaProvider(sdk: CredenzaSDK, chainConfig: TChainConfig) {
    const credenzaProvider = new CredenzaProvider({ chainConfig, sdk })
    await credenzaProvider.connect()
    this.provider = credenzaProvider
  }

  private async _connect() {
    try {
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
      this.state = EVM_PROVIDER_STATE.CONNECTED
      this.sdk._emit(SDK_EVENT.EVM_PROVIDER_CONNECTED)
    } catch (err) {
      this.sdk._emit(SDK_EVENT.ERROR, { type: EVM_PROVIDER_CONNECTION_ERROR, err })
    }
  }

  private async _checkConnection() {
    if (this.state === EVM_PROVIDER_STATE.CONNECTED) return true
    if (this.state === EVM_PROVIDER_STATE.CONNECTING) {
      return new Promise((resolve) => {
        const unsubscribeError = this.sdk.on(SDK_EVENT.ERROR, (data: { type: string }) => {
          if (data.type !== EVM_PROVIDER_CONNECTION_ERROR) return
          unsubscribeError()
          resolve(null)
        })
        this.sdk.once(SDK_EVENT.EVM_PROVIDER_CONNECTED, () => {
          unsubscribeError()
          resolve(true)
        })
      })
    }
    throw new Error('Provider is not connected')
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGIN, () => this._connect())
    this.sdk.on(SDK_EVENT.INIT, () => this._connect())
    this.sdk.on(SDK_EVENT.LOGOUT, () => {
      this.provider = undefined
      this.state = EVM_PROVIDER_STATE.DISCONNECTED
    })
    this.state = EVM_PROVIDER_STATE.CONNECTING
  }

  public async getProvider() {
    await this._checkConnection()
    if (!this.provider) throw new Error('Provider is not connected')
    return this.provider
  }

  public async switchChain(params: TChainConfig) {
    await this._checkConnection()
    if (this.loginProvider === LS_LOGIN_TYPE.METAMASK && this.sdk.metamask) {
      await this.sdk.metamask._switchChain(params)
    } else if (this.loginProvider === LS_LOGIN_TYPE.OAUTH) {
      await (this.provider as CredenzaProvider).switchChain(params)
    }
    this.chainConfig = params
  }
}
