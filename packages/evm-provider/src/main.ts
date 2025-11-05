import { type Eip1193Provider, JsonRpcProvider, VoidSigner, type TransactionLike, toNumber } from 'ethers'
import { listAccounts, sign } from './lib/http-requests'
import type { TChainConfig } from '@packages/common/types/chain-config'
import { EVM_PROVIDER_EVENT, EVM_PROVIDER_STATE } from './constants'
import { getEvmApiUrl } from '@packages/common/evm/evm'

class CredenzaProvider implements Eip1193Provider {
  static EVM_PROVIDER_EVENT = EVM_PROVIDER_EVENT

  private addresses: string[] = []
  private provider: JsonRpcProvider
  private state = EVM_PROVIDER_STATE.DISCONNECTED
  private chainConfig: TChainConfig
  private apiUrl: string
  private accessToken: string
  private listeners: Record<string, ((...args: any[]) => void)[]> = {}

  constructor(params: { chainConfig: TChainConfig; accessToken: string; env: string }) {
    if (!params.accessToken) throw new Error('Access token is required')
    if (!params.env) throw new Error('Env is required')

    this.apiUrl = getEvmApiUrl(params.env)
    this.accessToken = params.accessToken
    this._setChain(params.chainConfig)
  }

  private _getRequestFields() {
    return {
      accessToken: `Bearer ${this.accessToken}`,
      apiUrl: this.apiUrl,
    }
  }

  private _checkConnected() {
    if (this.state !== EVM_PROVIDER_STATE.CONNECTED || !this.provider)
      throw new Error('Credenza provider is not connected')
  }

  private _setChain(chainConfig: TChainConfig) {
    this.provider = new JsonRpcProvider(chainConfig.rpcUrl)
    this.chainConfig = chainConfig
  }

  private _emit(event: string, ...args: any[]) {
    for (const listener of this.listeners[event] ?? []) {
      listener(...args)
    }
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.listeners[event] ??= []
    this.listeners[event].push(listener)
    return this
  }

  public removeListener(event: string, listener: (...args: any[]) => void) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((l) => l !== listener)
    return this
  }

  public setAccessToken(accessToken: string) {
    this.accessToken = accessToken
    // Invalidate cached addresses when token changes
    this.addresses = []
  }

  public async switchChain(chainConfig: TChainConfig) {
    const prevProvider = this.provider
    const prevChainConfig = this.chainConfig
    const prevState = this.state
    try {
      this._setChain(chainConfig)
      await this.connect()
      this._emit(EVM_PROVIDER_EVENT.CHAIN_CHANGED, chainConfig.chainId)
    } catch (err) {
      this.provider = prevProvider
      this.chainConfig = prevChainConfig
      this.state = prevState
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
    try {
      this.state = EVM_PROVIDER_STATE.CONNECTING
      const network = await this.provider.getNetwork()
      if (toNumber(network.chainId) !== toNumber(this.chainConfig.chainId)) throw new Error('Invalid chain Id')
      this.state = EVM_PROVIDER_STATE.CONNECTED
      this._emit(EVM_PROVIDER_EVENT.CONNECT, { chainId: this.chainConfig.chainId })
    } catch (err) {
      this.state = EVM_PROVIDER_STATE.DISCONNECTED
      throw err
    }
  }

  public async disconnect() {
    this.state = EVM_PROVIDER_STATE.DISCONNECTED
    this._emit(EVM_PROVIDER_EVENT.DISCONNECT)
  }

  public async getRpcProvider() {
    this._checkConnected()
    return this.provider
  }

  public async listAccounts() {
    this._checkConnected()
    if (!this.addresses?.length) {
      this.addresses = await listAccounts(this._getRequestFields())
      this._emit(EVM_PROVIDER_EVENT.ACCOUNTS_CHANGED, this.addresses)
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
      case 'eth_chainId':
        return `0x${Number(this.chainConfig.chainId).toString(16)}`
      case 'net_version':
        return String(Number(this.chainConfig.chainId))
      case 'wallet_switchEthereumChain': {
        const chainId = Number((params?.[0] as any)?.chainId)
        if (chainId !== Number(this.chainConfig.chainId)) {
          throw new Error('wallet_switchEthereumChain not supported manually. Use .switchChain()')
        }
        return null
      }
      default: {
        return await this.provider.send(method, params ?? [])
      }
    }
  }
}

export default CredenzaProvider
