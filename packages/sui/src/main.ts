import type { CredenzaSDK } from '@packages/core/src/main'
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client'
import { TransactionBlock } from '@mysten/sui.js/transactions'
import { verifyTransactionBlock, verifyPersonalMessage } from '@mysten/sui.js/verify'
import { getSuiAddress, signSuiData } from './lib/http-requests'
import { SUI_NETWORK } from './main.constants'
import type { TSuiNetwork } from './main.types'
import { SDK_EVENT } from '@packages/core/src/lib/events/events.constants'

export class SuiExtension {
  static SUI_NETWORK = SUI_NETWORK
  public name = 'sui' as const
  private sdk: CredenzaSDK
  private client: SuiClient
  private suiAddress: string | undefined
  private currentSuiNetwork: TSuiNetwork

  constructor({ suiNetwork = SUI_NETWORK.MAINNET }: { suiNetwork: TSuiNetwork }) {
    this.switchNetwork(suiNetwork)
  }

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
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

    this.client = new SuiClient({ url: getFullnodeUrl(suiNetwork) })
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
      const { address } = await getSuiAddress(this.sdk)
      this.suiAddress = address
    }
    return this.suiAddress as string
  }

  public async signPersonalMessage(message: string): Promise<{ signature: string; bytes: string }> {
    this._assureLogin()
    const result = await signSuiData(this.sdk, {
      method: this.signPersonalMessage.name,
      param: Buffer.from(message).toString('base64'),
    })
    await verifyPersonalMessage(new TextEncoder().encode(message), result.signature)
    return result
  }

  public async signTransactionBlock(
    txb: TransactionBlock,
  ): Promise<{ signature: string; transactionBlock: Uint8Array }> {
    this._assureLogin()
    txb.setSenderIfNotSet(await this.getAddress())
    const transactionBlock = await txb.build({ client: this.client })
    const { signature } = await signSuiData(this.sdk, {
      method: this.signTransactionBlock.name,
      param: Buffer.from(transactionBlock).toString('base64'),
    })
    await verifyTransactionBlock(transactionBlock, signature)
    return { signature, transactionBlock }
  }

  public async signAndExecuteTransactionBlock(
    txb: TransactionBlock,
  ): ReturnType<typeof this.client.executeTransactionBlock> {
    const txbParams = await this.signTransactionBlock(txb)
    return await this.client.executeTransactionBlock(txbParams)
  }
}
