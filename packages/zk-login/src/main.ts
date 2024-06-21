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
import { SuiClient } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'

import { TransactionBlock } from '@mysten/sui.js/transactions'
import { getZkKeysFromCache, getZkRandomnessFromCache, setZkCache } from './lib/cache'

export class ZkLoginExtension {
  public name = 'zkLogin' as const
  private sdk: CredenzaSDK
  private suiClient: SuiClient
  private _userAddress: string
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
        const { publicKey, secretKey } = getZkKeysFromCache()
        this._ephemeralKeyPair = new Ed25519Keypair({ publicKey, secretKey })
      } catch (err) {
        this._ephemeralKeyPair = new Ed25519Keypair()
      }
      // @ts-expect-error for some reaason the type Ed25519PublicKey is not valid as PublicKey
      this._extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(this._ephemeralKeyPair.getPublicKey())
      this._randomness = getZkRandomnessFromCache() || generateRandomness()

      setZkCache(
        Array.from(this._ephemeralKeyPair.getPublicKey().toRawBytes()),
        Array.from(this._ephemeralKeyPair['keypair'].secretKey),
        this._randomness,
      )
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
    return test
  }

  public getZkLoginSignature = async (): Promise<{ signature: string }> => {
    const partialZkLoginSignature = await this._zkProof()

    const addressSeed = genAddressSeed(BigInt(this._salt), 'sub', this._decodedJwt.sub, this._decodedJwt.aud).toString()
    const txb = new TransactionBlock()
    const { address } = await this.getAddress()
    txb.setSender(address)
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

    return { signature: zkLoginSignature }
  }

  public async getAddress() {
    if (!this._userAddress) {
      this._userAddress = jwtToAddress(this.sdk.getAccessToken() as string, this._salt)
    }

    return { address: this._userAddress }
  }

  public login() {
    this.sdk.oauth.login({
      scope:
        'profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write',
      redirectUrl: window.location.href,
      nonce: this.generateZkNonce(),
      isZkLogin: true,
    })
  }
}
