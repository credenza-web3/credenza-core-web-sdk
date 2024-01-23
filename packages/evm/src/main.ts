import type { CredenzaSDK } from '@packages/core/src/main'
import { CredenzaProvider } from './provider/provider'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import type { Eip1193Provider } from 'ethers'
import type { MetamaskExtension } from '@packages/metamask/src/main'
import type { WalletConnectExtension } from '@packages/walletconnect/src/main'
import * as ethers from 'ethers'

type TExtensionName = MetamaskExtension['name'] | WalletConnectExtension['name']
type TExtension = MetamaskExtension | WalletConnectExtension

export { ethers, CredenzaProvider }
export class EvmExtension {
  public name = 'evm' as const
  private sdk: CredenzaSDK
  private provider: CredenzaProvider | MetaMaskInpageProvider | Eip1193Provider | undefined
  private loginType: (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER] | null
  private chainConfig: TChainConfig
  private extensions: TExtensionName[] = []

  public metamask: MetamaskExtension
  public walletconnect: WalletConnectExtension

  constructor(params: { chainConfig: TChainConfig; extensions: TExtension[] }) {
    if (!params.chainConfig.chainId || !params.chainConfig.rpcUrl)
      throw new Error('chainId and rpcUrl are required fields')
    if (!params.chainConfig.chainId.includes('0x')) throw new Error('Chain id must be a hex value 0x prefixed')
    this.chainConfig = params.chainConfig
    for (const ext of params.extensions || []) {
      Object.assign(this, { [ext.name]: ext })
      this.extensions.push(ext.name)
    }
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGOUT, () => (this.provider = undefined))
    for (const extensionName of this.extensions) {
      await this[extensionName]?._initialize(this.sdk)
    }
  }

  private async _checkIsUserLoggedIn() {
    const accessToken = this.sdk.getAccessToken()
    this.loginType = this.sdk.getLoginType()
    if (!accessToken || !this.loginType) throw new Error('User is not logged in')
  }

  private async _buildProvider() {
    switch (this.loginType) {
      case LS_LOGIN_PROVIDER.METAMASK: {
        return await this.metamask._getProvider()
      }
      case LS_LOGIN_PROVIDER.WALLET_CONNECT: {
        return await this.walletconnect._getProvider()
      }
      case LS_LOGIN_PROVIDER.OAUTH: {
        const credenzaProvider = new CredenzaProvider({ chainConfig: this.chainConfig, sdk: this.sdk })
        await credenzaProvider.connect()
        return credenzaProvider
      }
      default: {
        throw new Error('Cannot build evm provider')
      }
    }
  }

  public async getProvider() {
    await this._checkIsUserLoggedIn()
    if (!this.provider) this.provider = await this._buildProvider()
    return this.provider
  }

  public async getEthersProvider() {
    const provider = await this.getProvider()
    return new ethers.BrowserProvider(provider)
  }

  public async switchChain(params: TChainConfig) {
    const provider = await this.getProvider()
    switch (this.loginType) {
      case LS_LOGIN_PROVIDER.METAMASK: {
        await this.metamask._switchChain(params)
        break
      }
      case LS_LOGIN_PROVIDER.WALLET_CONNECT: {
        await this.walletconnect._switchChain(params)
        break
      }
      case LS_LOGIN_PROVIDER.OAUTH: {
        await (<CredenzaProvider>provider).switchChain(params)
        break
      }
    }
    this.chainConfig = params
  }

  public getChainConfig() {
    return this.chainConfig
  }
}
