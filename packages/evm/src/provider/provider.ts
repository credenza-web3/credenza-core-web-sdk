import { Eip1193Provider, JsonRpcProvider, VoidSigner, TransactionLike, toBeHex } from 'ethers'
import type { CredenzaSDK } from '@packages/core/src/main'
import { listAccounts } from './helpers/account'
import { sign } from './helpers/signature'

export class CredenzaProvider implements Eip1193Provider {
  private sdk: CredenzaSDK
  private addresses: string[] = []

  public provider: JsonRpcProvider
  public isConnected: boolean = false
  public chainId: string

  constructor({ chainId, url, sdk }: { chainId: string; url: string; sdk: CredenzaSDK }) {
    this.sdk = sdk
    this.chainId = chainId
    this.provider = new JsonRpcProvider(url)
    void this.connect()
  }

  async connect() {
    const jsonRpcProvider = await this.getRpcProvider()
    const network = await jsonRpcProvider.getNetwork()
    if (toBeHex(network.chainId) !== this.chainId) {
      throw new Error('Invalid chain Id')
    }
    if (!this.isConnected) this.isConnected = true
  }

  async disconnect() {
    if (this.isConnected) this.isConnected = false
  }

  checkConnected() {
    if (!this.isConnected) throw new Error('Provider is not connected')
  }

  async getRpcProvider() {
    this.checkConnected()
    return this.provider
  }

  async listAccounts() {
    this.checkConnected()
    if (!this.addresses?.length) {
      this.addresses = await listAccounts(this.sdk)
    }
    return this.addresses
  }

  async populateTransaction(tx: unknown | TransactionLike) {
    this.checkConnected()
    const [address] = await this.listAccounts()
    const voidSigner = new VoidSigner(address, this.provider)
    const transactionJson = await voidSigner.populateTransaction(tx as TransactionLike)
    return transactionJson
  }

  // eslint-disable-next-line complexity
  async request({ method, params }: { method: string; params?: unknown[] }) {
    this.checkConnected()
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
      case 'eth_signTypedData_v4':
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
}
