import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'

type TMetadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export class WalletConnectExtension {
  public name = 'walletconnect' as const
  private sdk: CredenzaSDK
  private metadata: TMetadata
  private projectId: string
  private modal: ReturnType<typeof createWeb3Modal>

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
      ethersConfig: defaultConfig({ metadata: this.metadata }),
      chains: [this._getWalletConnectChainConfig()],
      projectId: this.projectId,
    })
  }

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGOUT, () => void this.modal?.disconnect())
    this._initModal()
  }

  async _connect() {
    if (this.modal.getIsConnected()) return true
    await this.modal.open()
    return new Promise((resolve, reject) => {
      const unsubscribe = this.modal.subscribeEvents((evt) => {
        if (evt.data.event === 'MODAL_CLOSE') {
          unsubscribe()
          if (this.modal.getIsConnected()) return resolve(true)
          reject(new Error('WalletConnect: failed to connect wallet'))
        }
      })
    })
  }

  async _getProvider() {
    const provider = this.modal.getWalletProvider()
    if (!provider) throw new Error('Cannot get WalletConnect provider')
    return provider
  }

  async _getAddress() {
    const address = this.modal.getAddress()
    if (!address) throw new Error('Cannot get address from WalletConnect')
    return address
  }

  async _addChain(params: TChainConfig) {
    const provider = this.modal.getWalletProvider()
    if (!provider) throw new Error('Invalid provider')
    await provider.request({
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
    const provider = this.modal.getWalletProvider()
    if (!provider) throw new Error('Invalid provider')

    const currentChainId = await provider.request({ method: 'eth_chainId' })
    if (currentChainId === params.chainId) return
    try {
      return await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }],
      })
    } catch (err) {
      await this._addChain(params)
    }
    return await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainId }],
    })
  }

  async login() {
    await this._connect()

    const requestApiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/evm/auth`
    const address = await this._getAddress()
    const provider = await this._getProvider()

    const beginLoginRequestUrl = new URL(requestApiUrl)
    beginLoginRequestUrl.searchParams.append('client_id', this.sdk.clientId)
    beginLoginRequestUrl.searchParams.append('address', address)
    const beginLoginResponse = await fetch(beginLoginRequestUrl.toString())
    const { message, nonce } = await beginLoginResponse.json()
    const signature = await provider.request({ method: 'personal_sign', params: [message, address] })
    const endLoginResponse = await fetch(requestApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, nonce }),
    })
    const { access_token } = await endLoginResponse.json()
    await this.sdk._setAccessToken(access_token, LS_LOGIN_TYPE.WALLET_CONNECT)
  }
}
