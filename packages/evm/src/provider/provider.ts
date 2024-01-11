/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
import { Eip1193Provider, JsonRpcProvider, VoidSigner, TransactionLike } from 'ethers'
import type { CredenzaSDK } from '@packages/core/src/main'
import { listAccounts } from './helpers/account'
import { sign } from './helpers/signature'

export class CredenzaProvider implements Eip1193Provider {
  private sdk: CredenzaSDK
  private listeners: {[key:string]: any}  = {}
  private addresses: string[] = []

  public provider: JsonRpcProvider
  public isConnected: boolean = false

  constructor({url, sdk}: {
    url: string
    sdk: CredenzaSDK
  }) {
    this.sdk = sdk
    this.provider = new JsonRpcProvider(url)
    void this.connect()
  }

  async getRpcProvider() {
    return this.provider
  }

  async listAccounts() {
    if (!this.addresses?.length) {
      this.addresses = await listAccounts(this.sdk)
    }
    return this.addresses
  }

  async populateTransaction(tx: TransactionLike) {
    const [address] = await this.listAccounts()
    const voidSigner = new VoidSigner(address, this.provider)
    const transactionJson = await voidSigner.populateTransaction(tx)
    return transactionJson
  }

  async request({method, params}: {method: string; params?: any[]}) {
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
          return await sign(this.sdk, { method: 'personal_sign', params })
        } catch (err) {
          throw new Error(`Sign message error: ${err.message}`)
        }
      }
      case 'account_signTransaction':
      case 'eth_signRawTransaction':
      case 'eth_signTransaction': {
        try {
          const tx = await this.populateTransaction(params?.[0])
          return await sign(this.sdk, { method: 'eth_signTransaction', params: [tx] })
        } catch (err) {
          throw new Error(`Sign tx error: ${err.message}`)
        }
      }
      case 'account_sendTransaction':
      case 'eth_sendRawTransaction':
      case 'eth_sendTransaction': {
        try {
          const tx = await this.populateTransaction(params?.[0])
          const serializedSignedTx = await sign(this.sdk, { method: 'eth_signTransaction', params: [tx] })
          const result = await this.provider.broadcastTransaction(serializedSignedTx)
          return result.hash
        } catch (err) {
          throw new Error(`Send tx error: ${err.message}`)
        }
      }
      case 'account_signTypedData':
      case 'eth_signTypedData': {
        try {
          return await sign(this.sdk, { method: 'eth_signTypedData', params })
        } catch (err) {
          throw new Error(`Sign typed data failed: ${err.message}`)
        }
      }
      default: {
        return await this.provider.send(method, params ?? [])
      }
    }
  }

  emit(event:string, ...args: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((handler:any) => handler(...args))
    }
  }

  on(event:string, handler:any) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)
  }

  removeListener(event:string, handler:any) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((fn:any) => fn !== handler)
    }
  }

  async connect() {
    if (!this.isConnected) {
      this.isConnected = true
      this.emit('connect', { chainId: await this.provider.getNetwork().then(network => network.chainId) })
    }
  }

  async disconnect() {
    if (this.isConnected) {
      this.isConnected = false
      this.emit('disconnect')
    }
  }
}
