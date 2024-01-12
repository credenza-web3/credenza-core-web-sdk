import { Eip1193Provider, JsonRpcProvider, VoidSigner, TransactionLike, toNumber } from 'ethers'
import type { CredenzaSDK } from '@packages/core/src/main'
import { listAccounts, sign } from './lib/http-requests'
import { OAUTH_API_URL } from '@packages/common/constants/oauth'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import type { TChainConfig } from '@packages/common/types/chain-config'

export class CredenzaProvider implements Eip1193Provider {
  private addresses: string[] = []
  private provider: JsonRpcProvider
  private isConnected: boolean = false
  private chainConfig: TChainConfig
  private apiUrl: string
  private accessToken?: string
  private sdk?: CredenzaSDK

  constructor(params: { chainConfig: TChainConfig; accessToken?: string; apiUrl?: string; sdk?: CredenzaSDK }) {
    if (!params.sdk && !params.accessToken) throw new Error('Invalid constructor parameters.')
    this.apiUrl = params.apiUrl || OAUTH_API_URL.PROD
    this.accessToken = params.accessToken
    this.sdk = params.sdk || undefined
    this._setChain(params.chainConfig)
  }

  private _getRequestFields() {
    if (this.sdk)
      return {
        accessToken: `Bearer ${this.sdk.getAccessToken()}`,
        apiUrl: getOAuthApiUrl(this.sdk),
      }
    return {
      accessToken: `Bearer ${this.accessToken}`,
      apiUrl: this.apiUrl,
    }
  }

  private _checkConnected() {
    if (!this.isConnected || !this.provider) throw new Error('Credenza provider is not connected')
  }

  private _setChain(chainConfig: TChainConfig) {
    this.provider = new JsonRpcProvider(chainConfig.rpcUrl)
    this.chainConfig = chainConfig
    this.isConnected = false
  }

  public async switchChain(chainConfig: TChainConfig) {
    const prevProvider = this.provider
    const prevChainConfig = this.chainConfig
    this.provider = new JsonRpcProvider(chainConfig.rpcUrl)
    this.chainConfig = chainConfig
    if (!this.isConnected) return
    try {
      await this.connect()
    } catch (err) {
      this.provider = prevProvider
      this.chainConfig = prevChainConfig
      throw err
    }
  }

  public async _populateTransaction(tx: unknown | TransactionLike) {
    this._checkConnected()
    const [address] = await this.listAccounts()
    const voidSigner = new VoidSigner(address, this.provider)
    const transactionJson = await voidSigner.populateTransaction(tx as TransactionLike)
    return transactionJson
  }

  public async connect() {
    const network = await this.provider.getNetwork()
    if (toNumber(network.chainId) !== toNumber(this.chainConfig.chainId)) {
      throw new Error('Invalid chain Id')
    }
    this.isConnected = true
  }

  public async disconnect() {
    this.isConnected = false
  }

  public async getRpcProvider() {
    this._checkConnected()
    return this.provider
  }

  public async listAccounts() {
    this._checkConnected()
    if (!this.addresses?.length) {
      this.addresses = await listAccounts(this._getRequestFields())
    }
    return this.addresses
  }

  // eslint-disable-next-line complexity
  async request({ method, params }: { method: string; params?: unknown[] }) {
    this._checkConnected()
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts': {
        try {
          return await this.listAccounts()
        } catch (err) {
          throw new Error(`Error listing accounts: ${err.message}`)
        }
      }
      case 'eth_sign':
      case 'personal_sign': {
        try {
          return await sign(this._getRequestFields(), { method: 'personal_sign', params })
        } catch (err) {
          throw new Error(`Sign message error: ${err.message}`)
        }
      }
      case 'account_signTransaction':
      case 'eth_signRawTransaction':
      case 'eth_signTransaction': {
        try {
          const tx = await this._populateTransaction(params?.[0])
          return await sign(this._getRequestFields(), { method: 'eth_signTransaction', params: [tx] })
        } catch (err) {
          throw new Error(`Sign tx error: ${err.message}`)
        }
      }
      case 'account_sendTransaction':
      case 'eth_sendRawTransaction':
      case 'eth_sendTransaction': {
        try {
          const tx = await this._populateTransaction(params?.[0])
          const serializedSignedTx = await sign(this._getRequestFields(), {
            method: 'eth_signTransaction',
            params: [tx],
          })
          const result = await this.provider.broadcastTransaction(serializedSignedTx)
          return result.hash
        } catch (err) {
          throw new Error(`Send tx error: ${err.message}`)
        }
      }
      case 'account_signTypedData':
      case 'eth_signTypedData_v4':
      case 'eth_signTypedData': {
        try {
          return await sign(this._getRequestFields(), { method: 'eth_signTypedData', params })
        } catch (err) {
          throw new Error(`Sign typed data failed: ${err.message}`)
        }
      }
      default: {
        return await this.provider.send(method, params ?? [])
      }
    }
  }
}
