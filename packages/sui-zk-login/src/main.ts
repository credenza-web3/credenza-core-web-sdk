import type { CredenzaSDK } from '@packages/core/src/main'
import {
  generateRandomness,
  jwtToAddress,
  getExtendedEphemeralPublicKey,
  genAddressSeed,
  getZkLoginSignature,
  generateNonce,
} from '@mysten/zklogin'
import { jwtDecode } from 'jwt-decode'
import { SuiClient } from '@mysten/sui/client'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'

import { Transaction } from '@mysten/sui/transactions'
import { getZkKeysFromCache, getZkRandomnessFromCache, setZkCache } from './lib/cache'
import { getSuiZkSalt } from './lib/http-requests'
import { getZkProofUrl } from './lib/helper'

export class ZkLoginExtension {
  public name = 'zkLogin' as const
  private sdk: CredenzaSDK
  private suiClient: SuiClient
  private _userAddress: string
  private _salt: string
  private _decodedJwt: { sub: string; aud: string }
  private _maxEpoch: number
  private _extendedEphemeralPublicKey: string
  private _ephemeralKeyPair: Ed25519Keypair
  private _randomness: string

  async _initialize(sdk: CredenzaSDK) {
    try {
      this.sdk = sdk
      await this._setEpoch()
      await this._setKeyPairs()
    } catch (err) {
      /** */
    }
  }

  async _setEpoch() {
    this.suiClient = this.sdk.sui.getSuiClient()
    const { epoch } = await this.suiClient.getLatestSuiSystemState()
    this._maxEpoch = Number(epoch) + 2
  }

  private _setKeyPairs = async () => {
    try {
      const { publicKey, secretKey } = getZkKeysFromCache()
      this._ephemeralKeyPair = new Ed25519Keypair({ publicKey, secretKey })
    } catch (err) {
      this._ephemeralKeyPair = new Ed25519Keypair()
    }

    this._extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(this._ephemeralKeyPair.getPublicKey())
    this._randomness = getZkRandomnessFromCache() || generateRandomness()

    setZkCache(
      Array.from(this._ephemeralKeyPair.getPublicKey().toRawBytes()),
      Array.from(this._ephemeralKeyPair['keypair'].secretKey),
      this._randomness,
    )
  }

  public generateZkNonce = () => {
    return generateNonce(this._ephemeralKeyPair.getPublicKey(), this._maxEpoch, this._randomness)
  }

  private _zkProof = async () => {
    const token = this.sdk.getAccessToken()
    if (!token) return

    this._decodedJwt = jwtDecode(token)
    const url = getZkProofUrl(this.sdk.sui.getNetworkName())
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jwt: token,
        extendedEphemeralPublicKey: this._extendedEphemeralPublicKey,
        maxEpoch: this._maxEpoch,
        jwtRandomness: this._randomness,
        salt: await this._getZkSalt(),
        keyClaimName: 'sub',
      }),
    })
    return await response.json()
  }

  public signTransactionBlock = async (
    txb: Transaction,
  ): Promise<{ signature: string; transactionBlock: Uint8Array }> => {
    const partialZkLoginSignature = await this._zkProof()

    const addressSeed = genAddressSeed(
      BigInt(await this._getZkSalt()),
      'sub',
      this._decodedJwt.sub,
      this._decodedJwt.aud,
    ).toString()

    const { signature: userSignature } = await txb.sign({
      client: this.suiClient,
      signer: this._ephemeralKeyPair,
    })

    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...partialZkLoginSignature,
        addressSeed,
      },
      maxEpoch: this._maxEpoch,
      userSignature,
    })

    const transactionBlock = await txb.build({ client: this.suiClient })
    return { signature: zkLoginSignature, transactionBlock }
  }

  public signPersonalMessage = async (message: string) => {
    const partialZkLoginSignature = await this._zkProof()

    const addressSeed = genAddressSeed(
      BigInt(await this._getZkSalt()),
      'sub',
      this._decodedJwt.sub,
      this._decodedJwt.aud,
    ).toString()

    const messageData = new Uint8Array(Buffer.from(message))
    const { signature: userSignature } = await this._ephemeralKeyPair.signPersonalMessage(messageData)

    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...partialZkLoginSignature,
        addressSeed,
      },
      maxEpoch: this._maxEpoch,
      userSignature,
    })

    return { signature: zkLoginSignature }
  }

  private _getZkSalt = async () => {
    return this._salt || (this._salt = await getSuiZkSalt(this.sdk))
  }

  public async getAddress() {
    if (!this._userAddress) {
      this._userAddress = jwtToAddress(this.sdk.getAccessToken() as string, await this._getZkSalt())
    }
    return { address: this._userAddress }
  }
}
