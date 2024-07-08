import type { CredenzaSDK } from '@packages/core/src/main'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { SUI_NETWORK, SUI_RPC_URLS } from './main.constants'
import type { TSuiNetwork } from './main.types'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'
import { ZkLoginExtension } from '@packages/sui-zk-login/src/main'
import { getSuiAddressHttp } from './lib/http-requests'
import { defaultSignSuiBlockData, defaultSignSuiPersonalMessage } from './lib/helpers'
import { SDK_ENV } from '@packages/common/constants/core'

type TExtensionName = ZkLoginExtension['name']
type TExtension = ZkLoginExtension
export class SuiExtension {
  static SUI_NETWORK = SUI_NETWORK
  public name = 'sui' as const
  public zkLogin: ZkLoginExtension

  private sdk: CredenzaSDK
  private client: SuiClient
  private suiAddress: string | undefined
  private currentSuiNetwork: TSuiNetwork
  private extensions: TExtensionName[] = []
  private _isZkActive = false

  private _signSuiBlockData: (txb: Transaction) => ReturnType<typeof defaultSignSuiBlockData>
  private _signSuiPersonalMessage: (message: string) => ReturnType<typeof defaultSignSuiPersonalMessage>
  private _getSuiAddress: () => ReturnType<typeof getSuiAddressHttp>

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

    this.sdk.on(SDK_EVENT.LOGOUT, () => {
      this.suiAddress = undefined
    })

    const isValidForZk =
      this.extensions.length && sdk.env === SDK_ENV.PROD && this.currentSuiNetwork === SUI_NETWORK.DEVNET
    if (isValidForZk) {
      this._isZkActive = true
      this._signSuiBlockData = sdk.sui.zkLogin.signTransactionBlock.bind(this.sdk.sui.zkLogin)
      this._signSuiPersonalMessage = sdk.sui.zkLogin.signPersonalMessage.bind(this.sdk.sui.zkLogin)
      this._getSuiAddress = sdk.sui.zkLogin.getAddress.bind(this.sdk.sui.zkLogin)

      return
    }
    this._signSuiBlockData = async (txb: Transaction) =>
      await defaultSignSuiBlockData({
        txb,
        client: this.client,
        sdk: this.sdk,
      })

    this._signSuiPersonalMessage = async (message: string) =>
      await defaultSignSuiPersonalMessage({ message, sdk: this.sdk })

    this._getSuiAddress = async () => await getSuiAddressHttp(this.sdk)
  }

  private _assureLogin() {
    const accessToken = this.sdk.getAccessToken()
    if (!accessToken) throw new Error('User is not logged in')
    return accessToken
  }

  public switchNetwork(suiNetwork: TSuiNetwork): { client: SuiClient; network: TSuiNetwork } {
    if (this._isZkActive) throw new Error('ZK is available only on devnet')
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
}
