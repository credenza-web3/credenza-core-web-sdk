import type { CredenzaSDK } from '@packages/core/src/main'
import {
  generateRandomness,
  jwtToAddress,
  getExtendedEphemeralPublicKey,
  genAddressSeed,
  getZkLoginSignature,
  generateNonce,
} from '@mysten/zklogin'
import { set, get } from '@packages/common/localstorage/localstorage'
import { jwtDecode } from 'jwt-decode'
import { SuiClient } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'

import { TransactionBlock } from '@mysten/sui.js/transactions'
import { LS_ZK_EPHEMERAL_KEY, LS_ZK_RANDOMNESS_KEY } from './constants/localstorage'

export class ZkLoginExtension {
  public name = 'zkLogin' as const
  private sdk: CredenzaSDK
  private suiClient: SuiClient
  // private zkLoginUserAddress: string
  private _salt: string = '91415186453971526646820450783233590556'
  private _decodedJwt: { sub: string; aud: string }
  private _maxEpoch: number
  private _extendedEphemeralPublicKey: string
  private _ephemeralKeyPair: Ed25519Keypair
  private _randomness: string

  async _initialize(sdk: CredenzaSDK) {
    try {
      this.sdk = sdk
      this.suiClient = this.sdk.sui.getSuiClient()
      const { epoch } = await this.suiClient.getLatestSuiSystemState()
      this._maxEpoch = Number(epoch) + 2

      try {
        const parsedkey = JSON.parse(get(LS_ZK_EPHEMERAL_KEY) as string)
        this._ephemeralKeyPair = new Ed25519Keypair(parsedkey)
      } catch (err) {
        this._ephemeralKeyPair = new Ed25519Keypair()
      }
      set(
        LS_ZK_EPHEMERAL_KEY,
        JSON.stringify({
          publicKey: Array.from(this._ephemeralKeyPair.getPublicKey().toRawBytes()),
          secretKey: Array.from(this._ephemeralKeyPair['keypair'].secretKey),
        }),
      )
      // @ts-expect-error for some reaason the type Ed25519PublicKey is not valid as PublicKey
      this._extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(this._ephemeralKeyPair.getPublicKey())
      this._randomness = get(LS_ZK_RANDOMNESS_KEY) || generateRandomness()
      set(LS_ZK_RANDOMNESS_KEY, this._randomness)
    } catch (err) {
      /** */
    }
  }

  public generateZkNonce = () => {
    // @ts-expect-error for some reaason the type Ed25519PublicKey is not valid as PublicKey
    return generateNonce(this._ephemeralKeyPair.getPublicKey(), this._maxEpoch, this._randomness)
  }

  private _zkProof = async () => {
    const token = this.sdk.getAccessToken()
    if (!token) return

    this._decodedJwt = jwtDecode(token)
    const url = 'https://prover-dev.mystenlabs.com/v1'
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
        salt: this._salt,
        keyClaimName: 'sub',
      }),
    })
    const test = await response.json()
    console.log(test)
    return test
  }

  public getZkLoginSignature = async () => {
    const partialZkLoginSignature = await this._zkProof()

    const addressSeed = genAddressSeed(BigInt(this._salt), 'sub', this._decodedJwt.sub, this._decodedJwt.aud).toString()

    const txb = new TransactionBlock()
    txb.setSender(jwtToAddress(this.sdk.getAccessToken() as string, this._salt))
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

    return zkLoginSignature
  }
}
