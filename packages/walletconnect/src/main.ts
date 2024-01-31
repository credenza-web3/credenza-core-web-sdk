import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import { toNumber } from 'ethers'

let ensureProviderPromise: Promise<true> | undefined
type TMetadata = Parameters<typeof defaultConfig>[0]['metadata']

export class WalletConnectExtension {
  public name = 'walletconnect' as const
  private sdk: CredenzaSDK
  private metadata: TMetadata
  private projectId: string
  private modal: ReturnType<typeof createWeb3Modal>
  private walletConnectProvider: ReturnType<typeof this.modal.getWalletProvider>

  constructor(params: { projectId: string; metadata: TMetadata }) {
    this.projectId = params.projectId
    this.metadata = params.metadata
  }

  private _getWalletConnectChainConfig() {
    const chainConfig = this.sdk.evm.getChainConfig()
    return {
      chainId: parseInt(chainConfig.chainId, 16),
      name: chainConfig.displayName,
      currency: chainConfig.nativeCurrency.symbol,
      explorerUrl: chainConfig.blockExplorer,
      rpcUrl: chainConfig.rpcUrl,
    }
  }

  private _initModal() {
    this.modal = createWeb3Modal({
      ethersConfig: defaultConfig({
        enableEIP6963: true,
        enableInjected: false,
        enableCoinbase: false,
        enableEmail: false,
        metadata: this.metadata,
      }),
      chains: [this._getWalletConnectChainConfig()],
      projectId: this.projectId,
    })
    this.modal.subscribeProvider((proxy) => {
      this.walletConnectProvider = proxy.provider
    })
  }

  private async _ensureProvider(skipAuthCheck: boolean = false) {
    if (!skipAuthCheck) {
      if (!this.sdk.getAccessToken()) throw new Error('user is not logged in')
      if (this.sdk.getLoginProvider() !== LS_LOGIN_PROVIDER.WALLET_CONNECT)
        throw new Error('User is not logged in with wallet connect.')
    }

    if (this.walletConnectProvider) return
    if (!ensureProviderPromise) {
      ensureProviderPromise = new Promise((resolve) => {
        const unsubscribe = this.modal.subscribeProvider((proxy) => {
          if (!proxy.isConnected) return
          unsubscribe()
          ensureProviderPromise = undefined
          return resolve(true)
        })
      })
    }
    return ensureProviderPromise
  }

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGOUT, () => void this.modal?.disconnect())
    this._initModal()
  }

  async _connect() {
    if (this.modal.getIsConnected()) return true
    await this.modal.open()
  }

  async _getProvider() {
    await this._ensureProvider()
    if (!this.walletConnectProvider) return undefined
    return new Proxy(this.walletConnectProvider, {
      get: (target, property: never) => {
        if (property !== 'request') return target[property]
        return async (...args: unknown[]) => {
          await this._switchChain(this.sdk.evm.getChainConfig())
          const fn = target[property] as (...args: unknown[]) => unknown
          return fn.apply(this.walletConnectProvider, args)
        }
      },
    })
  }

  async _addChain(params: TChainConfig) {
    await this._ensureProvider()
    await this.walletConnectProvider?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: params.chainId,
          chainName: params.displayName,
          rpcUrls: [params.rpcUrl],
          blockExplorerUrls: [params.blockExplorer],
          nativeCurrency: {
            name: params.nativeCurrency.name,
            symbol: params.nativeCurrency.symbol,
            decimals: params.nativeCurrency.decimals || 18,
          },
        },
      ],
    })
  }

  async _switchChain(params: TChainConfig) {
    await this._ensureProvider()
    const currentChainId = await this.walletConnectProvider?.request({ method: 'eth_chainId' })
    if (toNumber(currentChainId) === toNumber(params.chainId)) return
    try {
      return await this.walletConnectProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }],
      })
    } catch (err) {
      await this._addChain(params)
    }
    return await this.walletConnectProvider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainId }],
    })
  }

  async login() {
    await this.modal?.disconnect()
    await this._connect()
    await this._ensureProvider(true)

    const requestApiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/evm/auth`
    const address = this.modal.getAddress()
    if (!address) throw new Error('Cannot get address from WalletConnect')

    const beginLoginRequestUrl = new URL(requestApiUrl)
    beginLoginRequestUrl.searchParams.append('client_id', this.sdk.clientId)
    beginLoginRequestUrl.searchParams.append('address', address)
    const beginLoginResponse = await fetch(beginLoginRequestUrl.toString())
    const { message, nonce } = await beginLoginResponse.json()
    const signature = await this.walletConnectProvider?.request({ method: 'personal_sign', params: [message, address] })
    const endLoginResponse = await fetch(requestApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, nonce }),
    })

    const { access_token } = await endLoginResponse.json()
    await this.sdk._setAccessToken(access_token, LS_LOGIN_PROVIDER.WALLET_CONNECT)

    await this._switchChain(this.sdk.evm.getChainConfig())
  }
}
