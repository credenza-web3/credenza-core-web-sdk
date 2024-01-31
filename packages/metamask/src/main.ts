import type { CredenzaSDK } from '@packages/core/src/main'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import detectEthereumProvider from '@metamask/detect-provider'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import type { TChainConfig } from '@packages/common/types/chain-config'

export class MetamaskExtension {
  public name = 'metamask' as const
  private sdk: CredenzaSDK
  private metamaskProvider: MetaMaskInpageProvider

  async _initialize(sdk: CredenzaSDK) {
    try {
      this.sdk = sdk
      const provider = await detectEthereumProvider<MetaMaskInpageProvider>()
      if (!provider || !provider.isMetaMask) return
      this.metamaskProvider = provider
    } catch (err) {}
  }

  private _isAvailable() {
    if (!this.metamaskProvider) throw new Error('Metamask is not installed')
    return true
  }

  public async _addChain(params: TChainConfig) {
    this._isAvailable()
    await this.metamaskProvider?.request({
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

  public async _switchChain(params: TChainConfig) {
    this._isAvailable()
    const currentChainId = await this.metamaskProvider.request({ method: 'eth_chainId' })
    if (currentChainId === params.chainId) return
    try {
      return await this.metamaskProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }],
      })
    } catch (err) {
      if (err.code === 4902) await this._addChain(params)
      else throw err
    }
    return await this.metamaskProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainId }],
    })
  }

  public async _getProvider() {
    this._isAvailable()
    return new Proxy(this.metamaskProvider, {
      get: (target, property: never) => {
        if (property !== 'request') return target[property]
        return async (...args: unknown[]) => {
          await this._switchChain(this.sdk.evm.getChainConfig())
          const fn = target[property] as (...args: unknown[]) => unknown
          return fn.apply(this.metamaskProvider, args)
        }
      },
    })
  }

  public async login() {
    this._isAvailable()
    await this._switchChain(this.sdk.evm.getChainConfig())

    const requestApiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/evm/auth`
    const address = await this.getAddress()
    const beginLoginRequestUrl = new URL(requestApiUrl)
    beginLoginRequestUrl.searchParams.append('client_id', this.sdk.clientId)
    beginLoginRequestUrl.searchParams.append('address', address)
    const beginLoginResponse = await fetch(beginLoginRequestUrl.toString())
    const { message, nonce } = await beginLoginResponse.json()
    const signature = await this.metamaskProvider.request({ method: 'personal_sign', params: [message, address] })
    const endLoginResponse = await fetch(requestApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, nonce }),
    })
    const { access_token } = await endLoginResponse.json()
    await this.sdk._setAccessToken(access_token, LS_LOGIN_PROVIDER.METAMASK)
  }

  public async getAddress() {
    this._isAvailable()
    const result = await this.metamaskProvider.request<string[]>({ method: 'eth_requestAccounts', params: [] })
    if (result?.[0]) return result[0].toLowerCase()
    throw new Error('Cannot get metamask address')
  }
}
