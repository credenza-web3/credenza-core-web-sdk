import type { CredenzaSDK } from '@packages/core/src/main'
import type { MetaMaskInpageProvider } from "@metamask/providers"
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import detectEthereumProvider from '@metamask/detect-provider'

export class MetamaskExtension {
  public name = 'metamask' as const
  private sdk: CredenzaSDK
  public provider: MetaMaskInpageProvider

  async initialize(sdk: CredenzaSDK) {
    const provider = await detectEthereumProvider<MetaMaskInpageProvider>()
    if (!provider || !provider.isMetaMask) throw new Error('Metamask is not installed')
    this.sdk = sdk
    this.provider = provider
  }

  isAvailable() {
    return !!this.provider
  }

  async getProvider() {
    return this.provider
  }

  async getAddress() {
    if (!this.isAvailable()) throw new Error('Metamask is not installed')
    const result = await this.provider.request<string[]>({ method: 'eth_requestAccounts', params: [] })
    if (result?.[0]) return result[0].toLowerCase()
    throw new Error('Cannot get metamask address')
  }

  async login() {
    const requestApiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/evm/auth`
    const address = await this.getAddress()
    const beginLoginRequestUrl = new URL(requestApiUrl)
    beginLoginRequestUrl.searchParams.append('client_id', this.sdk.clientId)
    beginLoginRequestUrl.searchParams.append('address', address)
    const beginLoginResponse = await fetch(beginLoginRequestUrl.toString())
    const { message, nonce } = await beginLoginResponse.json()
    const signature = await this.provider.request({method: 'personal_sign', params: [message, address]})
    const endLoginResponse = await fetch(requestApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({signature, nonce})
    })
    const {access_token} = await endLoginResponse.json()
    this.sdk.setAccessToken(access_token)
  }
}
