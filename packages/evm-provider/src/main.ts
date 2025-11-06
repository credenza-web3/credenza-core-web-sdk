import { type Eip1193Provider, JsonRpcProvider, VoidSigner, type TransactionLike } from 'ethers'
import { listAccounts, sign } from './lib/http-requests'
import { EVM_PROVIDER_EVENT, EVM_PROVIDER_STATE } from './constants'
import { getEvmApiUrl } from '@packages/common/evm/evm'

class CredenzaProvider implements Eip1193Provider {
  static EVM_PROVIDER_EVENT = EVM_PROVIDER_EVENT

  private addresses: string[] = []
  private provider: JsonRpcProvider
  private state = EVM_PROVIDER_STATE.DISCONNECTED
  private apiUrl: string
  private accessToken: string
  private rpcUrl: string
  private listeners: Record<string, ((...args: any[]) => void)[]> = {}

  constructor(params: { rpcUrl: string; accessToken?: string; env: string }) {
    if (!params.env) throw new Error('Env is required')

    this.apiUrl = getEvmApiUrl(params.env)
    this.setRpcUrl(params.rpcUrl)

    if (params.accessToken) this.accessToken = params.accessToken
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

  private _checkAccessToken() {
    if (!this.accessToken) throw new Error('Access token is required')
  }

  private _emit(event: string, ...args: any[]) {
    for (const listener of this.listeners[event] ?? []) {
      listener(...args)
    }
  }

  public setRpcUrl(rpcUrl: string) {
    this.rpcUrl = rpcUrl
    this.provider = new JsonRpcProvider(rpcUrl)
  }

  public getRpcUrl() {
    return this.rpcUrl
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

  public async _populateTransaction(tx: unknown | TransactionLike) {
    const [address] = await this.listAccounts()
    const voidSigner = new VoidSigner(address, this.provider)
    const transactionJson = await voidSigner.populateTransaction(tx as TransactionLike)
    return transactionJson
  }

  public async connect() {
    try {
      this.state = EVM_PROVIDER_STATE.CONNECTING
      const network = await this.provider.getNetwork()
      this.state = EVM_PROVIDER_STATE.CONNECTED
      this._emit(EVM_PROVIDER_EVENT.CONNECT, { network })
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
    this._checkAccessToken()
    if (!this.addresses?.length) {
      this.addresses = await listAccounts(this._getRequestFields())
      this._emit(EVM_PROVIDER_EVENT.ACCOUNTS_CHANGED, this.addresses)
    }
    return this.addresses
  }

  // eslint-disable-next-line complexity
  async request({ method, params }: { method: string; params?: unknown[] }) {
    this._checkConnected()
    this._checkAccessToken()
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
      case 'wallet_switchEthereumChain': {
        const chainId = Number((params?.[0] as any)?.chainId)
        const network = await this.provider.getNetwork()
        if (chainId !== Number(network.chainId)) {
          throw new Error(
            'wallet_switchEthereumChain not supported manually. Use .setRpcUrl() or re-init provider with new RPC url',
          )
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
