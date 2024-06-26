import type { CredenzaSDK } from '@packages/core/src/main'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { SUI_NETWORK, SUI_RPC_URLS } from './main.constants'
import type { TSuiNetwork } from './main.types'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import { ZkLoginExtension } from '@packages/sui-zk-login/src/main'
import { getSuiAddressHttp } from './lib/http-requests'
import { defaultSignSuiBlockData, defaultSignSuiPersonalMessage } from './lib/helpers'

type TExtensionName = ZkLoginExtension['name']
type TExtension = ZkLoginExtension
export class SuiExtension {
  static SUI_NETWORK = SUI_NETWORK
  public name = 'sui' as const
  private sdk: CredenzaSDK
  private client: SuiClient
  private suiAddress: string | undefined
  private currentSuiNetwork: TSuiNetwork
  private extensions: TExtensionName[] = []

  public zkLogin: ZkLoginExtension

  constructor({ suiNetwork = SUI_NETWORK.MAINNET, extensions }: { suiNetwork: TSuiNetwork; extensions: TExtension[] }) {
    this.switchNetwork(suiNetwork)
    for (const ext of extensions || []) {
      Object.assign(this, { [ext.name]: ext })
      this.extensions.push(ext.name)
    }
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk

    for (const extensionName of this.extensions) {
      await this[extensionName]?._initialize(this.sdk)
    }

    if (this.extensions.length) {
      this._signSuiBlockData = async (txb: Transaction) => await sdk.sui.zkLogin.signTransactionBlock(txb)
      this._signSuiPersonalMessage = async (message: string) => await sdk.sui.zkLogin.signPersonalMessage(message)
      this._getSuiAddress = async () => await sdk.sui.zkLogin.getAddress()
    }

    this.sdk.on(SDK_EVENT.LOGOUT, () => {
      this.suiAddress = undefined
    })
  }

  private _assureLogin() {
    const accessToken = this.sdk.getAccessToken()
    if (!accessToken) throw new Error('User is not logged in')
    return accessToken
  }

  public switchNetwork(suiNetwork: TSuiNetwork): { client: SuiClient; network: TSuiNetwork } {
    if (this.client && this.currentSuiNetwork === suiNetwork) throw new Error(`Already on sui ${suiNetwork}`)

    this.client = new SuiClient({ url: SUI_RPC_URLS[suiNetwork] })
    this.currentSuiNetwork = suiNetwork
    this.suiAddress = undefined
    return { client: this.getSuiClient(), network: this.getNetworkName() }
  }

  public getSuiClient(): SuiClient {
    return this.client
  }

  public getNetworkName(): TSuiNetwork {
    return this.currentSuiNetwork
  }

  public async getAddress(): Promise<string> {
    this._assureLogin()
    if (!this.suiAddress) {
      const { address } = await this._getSuiAddress()
      this.suiAddress = address
    }
    return this.suiAddress as string
  }

  public async signPersonalMessage(message: string): Promise<{ signature: string; bytes: string }> {
    this._assureLogin()
    return this._signSuiPersonalMessage(message)
  }

  public async signTransactionBlock(txb: Transaction): Promise<{ signature: string; transactionBlock: Uint8Array }> {
    this._assureLogin()
    txb.setSenderIfNotSet(await this.getAddress())

    const { signature, transactionBlock } = await this._signSuiBlockData(txb)
    return { signature, transactionBlock }
  }

  public async signAndExecuteTransactionBlock(
    txb: Transaction,
  ): ReturnType<typeof this.client.executeTransactionBlock> {
    const txbParams = await this.signTransactionBlock(txb)
    return await this.client.executeTransactionBlock(txbParams)
  }

  private _signSuiBlockData = async (txb: Transaction) =>
    await defaultSignSuiBlockData({ txb, client: this.client, sdk: this.sdk, method: this.signTransactionBlock.name })

  private _signSuiPersonalMessage = async (message: string) =>
    await defaultSignSuiPersonalMessage({ message, sdk: this.sdk, method: this.signPersonalMessage.name })

  private _getSuiAddress = async (): Promise<{ address: string }> => {
    return await getSuiAddressHttp(this.sdk)
  }
}
