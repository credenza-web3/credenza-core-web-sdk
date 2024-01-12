import type { CredenzaSDK } from '@packages/core/src/main'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import detectEthereumProvider from '@metamask/detect-provider'
import { LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { TChainConfig } from '@packages/common/types/chain-config'

export class MetamaskExtension {
  public name = 'metamask' as const
  private sdk: CredenzaSDK
  private metamaskProvider: MetaMaskInpageProvider

  async _initialize(sdk: CredenzaSDK) {
    const provider = await detectEthereumProvider<MetaMaskInpageProvider>()
    if (!provider || !provider.isMetaMask) throw new Error('Metamask is not installed')
    this.sdk = sdk
    this.metamaskProvider = provider
  }

  private isAvailable() {
    return !!this.metamaskProvider
  }

  async login() {
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
    await this.sdk._setAccessToken(access_token, LS_LOGIN_TYPE.METAMASK)
  }

  async _addChain(params: TChainConfig) {
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

  async _switchChain(params: TChainConfig) {
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

  async _getProvider() {
    if (!this.sdk.evm)
      throw new Error(
        'Evm extension is required to operate with blockchain. You should never use this function in your code. Use sdk.evm.getProvider instead.',
      )
    return this.metamaskProvider
  }

  async getAddress() {
    if (!this.isAvailable()) throw new Error('Metamask is not installed')
    const result = await this.metamaskProvider.request<string[]>({ method: 'eth_requestAccounts', params: [] })
    if (result?.[0]) return result[0].toLowerCase()
    throw new Error('Cannot get metamask address')
  }
}
