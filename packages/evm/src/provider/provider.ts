/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
//const { Wallet, utils} = require('ethers')
import { Eip1193Provider, JsonRpcProvider, ZeroHash } from 'ethers'
import type { CredenzaSDK } from '@packages/core/src/main'
import {listAccounts} from './account/account'
import { signMessage } from './signature/signature'

export class CredenzaProvider implements Eip1193Provider {
  private sdk: CredenzaSDK

  private provider: JsonRpcProvider
  //private selectedAddress: string = null
  private isConnected: boolean = false
  //private networkVersion: string = null
  private listeners: any = {}

  constructor({url, sdk}: {
    url: string
    sdk: CredenzaSDK
  }) {
    this.sdk = sdk
    this.provider = new JsonRpcProvider(url)
  }

  async request({method, params}: {method: string; params?: any[]}) {
    switch (method) {
      case 'eth_requestId':
          return ZeroHash  
      case 'net_version':
        return this.provider.getNetwork().then(network => network.chainId.toString())
      case 'eth_chainId':
        return this.provider.getNetwork().then(network => network.chainId)
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return await listAccounts(this.sdk)
      case 'personal_sign':
      case 'eth_sign': {
        if (!params?.[0]) throw new Error(`At least 1 param is required`)
        return await signMessage(this.sdk, { data: params[0], address: params[1] })
      }
        
      // case 'eth_sendTransaction':
      //   const [transactionObject] = params
      //   try {
      //     const signedTx = await this.signTransaction(transactionObject)
      //     const txResponse = await this.provider.sendSignedTransaction(signedTx)
      //     return txResponse.hash
      //   } catch (error) {
      //     throw new Error(`Error sending transaction: ${error.message}`)
      //   }
      // case 'eth_sign':
      //   const [address, data] = params
      //   try {
      //     const signature = await this.signMessage(address, data)
      //     return signature
      //   } catch (error) {
      //     throw new Error(`Error signing message: ${error.message}`)
      //   }
      // case 'eth_signTypedData':
      //   const [typedData, signer] = params
      //   try {
      //     const signature = await this.signTypedData(signer, typedData)
      //     return signature
      //   } catch (error) {
      //     throw new Error(`Error signing typed data: ${error.message}`)
      //   }
      // // Add support for other JSON-RPC methods as needed
      default:
        throw new Error(`Method ${method} not supported ${params}`,)
    }
  }

  // async signTransaction(transactionObject) {
  //   const privateKey = 'YOUR_PRIVATE_KEY' // Replace with your private key
  //   const wallet = new Wallet(privateKey, this.provider)

  //   const { to, value, data, nonce, gasLimit, gasPrice, chainId } = transactionObject
  //   const transaction = {
  //     to,
  //     value: utils.parseEther(value.toString()),
  //     data,
  //     nonce,
  //     gasLimit,
  //     gasPrice: utils.parseUnits(gasPrice.toString(), 'gwei'),
  //     chainId
  //   }

  //   return wallet.sign(transaction)
  // }

  // async signMessage(address, data) {
  //   const privateKey = 'YOUR_PRIVATE_KEY' // Replace with your private key
  //   const wallet = new Wallet(privateKey, this.provider)

  //   return wallet.signMessage(utils.arrayify(data))
  // }

  // async signTypedData(signer, typedData) {
  //   const privateKey = 'YOUR_PRIVATE_KEY' // Replace with your private key
  //   const wallet = new Wallet(privateKey, this.provider)

  //   return wallet._signTypedData(signer, typedData)
  // }

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
