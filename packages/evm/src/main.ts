import type { CredenzaSDK } from '@packages/core/src/main'
import { CredenzaProvider } from './provider/provider'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import type { TChainConfig } from '@packages/common/types/chain-config'
import type { TSdkEvmEvent } from './lib/events/events.types'
import { emit, once, on } from '@packages/common/events/events'
import { EVM_EVENT } from './lib/events/events.constants'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import type { Eip1193Provider } from 'ethers'
import * as ethers from 'ethers'
import * as loginUrl from '@packages/oauth/src/lib/login-url'
import { SiweMessage } from 'siwe'
import { toChecksumAddress } from './lib/address/address.helper'

export { ethers, CredenzaProvider }

export class EvmExtension {
  public static EVM_EVENT = EVM_EVENT

  public name = 'evm' as const
  private sdk: CredenzaSDK
  private provider: CredenzaProvider | Eip1193Provider | undefined
  private chainConfig: TChainConfig
  private optionsProvider: Eip1193Provider

  constructor(params: { chainConfig: TChainConfig; provider?: Eip1193Provider; extensions?: unknown[] }) {
    if (!params.chainConfig.chainId || !params.chainConfig.rpcUrl)
      throw new Error('chainId and rpcUrl are required fields')
    if (!params.chainConfig.chainId.includes('0x')) throw new Error('Chain id must be a hex value 0x prefixed')
    this.chainConfig = params.chainConfig

    if (params.provider) this.optionsProvider = params.provider
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.sdk.on(SDK_EVENT.LOGOUT, () => (this.provider = undefined))
  }

  private async _checkIsUserLoggedIn() {
    if (!this.sdk.isLoggedIn()) throw new Error('User is not logged in')
  }

  private async _buildProvider() {
    try {
      switch (this.sdk.getLoginProvider()) {
        case LS_LOGIN_PROVIDER.EVM_PROVIDER: {
          if (!this.optionsProvider) throw new Error('EVM provider was not provided')
          return this.optionsProvider
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
    } catch (err) {
      this._emit('EVM_ERROR', err)
      throw err
    }
  }

  public async getProvider() {
    await this._checkIsUserLoggedIn()
    if (!this.provider) this.provider = await this._buildProvider()
    return this.provider
  }

  public async getEthersProvider() {
    const provider = await this.getProvider()
    if (!provider) throw new Error('Cannot get provider')
    if (this.isEvmProvider()) {
      await this._switchChainEip(this.chainConfig)
    }
    return new ethers.BrowserProvider(provider)
  }

  public async switchChain(chainConfig: TChainConfig) {
    try {
      const provider = await this.getProvider()
      switch (this.sdk.getLoginProvider()) {
        case LS_LOGIN_PROVIDER.EVM_PROVIDER: {
          await this._switchChainEip(chainConfig)
          break
        }
        case LS_LOGIN_PROVIDER.OAUTH: {
          await (<CredenzaProvider>provider).switchChain(chainConfig)
          break
        }
      }
      this.chainConfig = chainConfig
      this._emit(EVM_EVENT.EVM_SWITCH_CHAIN, { chainConfig })
    } catch (err) {
      this._emit(EVM_EVENT.EVM_ERROR, err)
      throw err
    }
  }

  public getChainConfig() {
    return this.chainConfig
  }

  public isEvmProvider() {
    return !!this.optionsProvider
  }

  public async loginWithSignature() {
    if (!this.isEvmProvider()) throw new Error('EVM provider was not provided')

    await this._switchChainEip(this.sdk.evm.getChainConfig())

    const [address] = await this.optionsProvider.request({
      method: 'eth_requestAccounts',
    })

    // BEGIN: sign-in flow
    const url = await loginUrl.buildLoginUrl(
      this.sdk,
      {
        scope: 'openid profile email phone blockchain.evm blockchain.evm.write',
        responseType: 'token',
      },
      { is_evm: true },
    )
    loginUrl.extendLoginUrlWithRedirectUri(url, { redirectUrl: 'none' })

    const beginLoginResponse = await fetch(url.toString())
    if (!beginLoginResponse.ok) throw new Error(beginLoginResponse.statusText)
    const { sid, nonce } = await beginLoginResponse.json()

    const msg = new SiweMessage({
      domain: window.location.host,
      address: toChecksumAddress(address),
      statement: 'Sign in with Credenza3',
      uri: window.location.origin,
      version: '1',
      chainId: +this.sdk.evm.getChainConfig().chainId,
      nonce,
    })
    const preparedMsg = msg.prepareMessage()

    const signature = await this.optionsProvider.request({
      method: 'personal_sign',
      params: [preparedMsg, address],
    })

    const endLoginResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, sid, message: msg }),
    })
    const { access_token } = await endLoginResponse.json()
    await this.sdk._setAccessToken(access_token, LS_LOGIN_PROVIDER.EVM_PROVIDER)
  }

  public once = once<TSdkEvmEvent>
  public on = on<TSdkEvmEvent>
  public _emit = emit<TSdkEvmEvent>

  private switchChainPromise?: Promise<void>

  private _ensureHexChainId(chainId: string | number) {
    if (typeof chainId === 'string')
      return chainId.startsWith('0x') ? chainId : `0x${parseInt(chainId, 10).toString(16)}`
    return `0x${chainId.toString(16)}`
  }

  private async _addChainEip(config: TChainConfig) {
    if (!this.optionsProvider) throw new Error('EVM provider was not provided')
    const chainId = this._ensureHexChainId(config.chainId)
    await this.optionsProvider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId,
          chainName: config.displayName,
          rpcUrls: [config.rpcUrl],
          blockExplorerUrls: config.blockExplorer ? [config.blockExplorer] : undefined,
          nativeCurrency: {
            name: config.nativeCurrency.name,
            symbol: config.nativeCurrency.symbol,
            decimals: config.nativeCurrency.decimals ?? 18,
          },
        },
      ],
    })
  }

  private async _switchChainEip(config: TChainConfig) {
    if (!this.optionsProvider) throw new Error('EVM provider was not provided')
    if (this.switchChainPromise) return this.switchChainPromise

    const target = this._ensureHexChainId(config.chainId)

    this.switchChainPromise = this.optionsProvider
      .request({ method: 'eth_chainId' })
      .then(async (current: string) => {
        if (current?.toLowerCase() === target.toLowerCase()) {
          throw new Error('SWITCH_CHAIN_NOT_REQUIRED')
        }
        try {
          await this.optionsProvider!.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: target }],
          })
        } catch (err: any) {
          const code = err?.code ?? err?.data?.originalError?.code
          if (code === 4902 || err?.message?.includes('Unrecognized chain')) {
            await this._addChainEip(config)
            await this.optionsProvider!.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: target }],
            })
          } else {
            throw err
          }
        }
      })
      .catch((err) => {
        if (err?.message === 'SWITCH_CHAIN_NOT_REQUIRED') return
        return Promise.reject(err)
      })
      .finally(() => {
        this.switchChainPromise = undefined
      })

    return this.switchChainPromise
  }
}
