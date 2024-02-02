import type { CredenzaSDK } from '@packages/core/src/main'
import { jwtToAddress, getExtendedEphemeralPublicKey, generateRandomness } from '@mysten/zklogin'
import type { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { getSuiSalt } from './lib/http-requests'

export class SuiExtension {
  public name = 'sui' as const
  private sdk: CredenzaSDK

  constructor() {}

  public async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
  }

  private _assureLogin() {
    const accessToken = this.sdk.getAccessToken()
    if (!accessToken) throw new Error('User is not logged in')
    return accessToken
  }

  public async getAddress() {
    const jwt = this._assureLogin()
    const { salt } = await getSuiSalt(this.sdk)
    return jwtToAddress(jwt, salt)
  }

  public async extendEphemeralPublicKey(ephemeralKeyPair: Ed25519Keypair) {
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey())
    return extendedEphemeralPublicKey
  }

  public async getZKProof(ephemeralKeyPair: Ed25519Keypair) {
    const { salt } = await getSuiSalt(this.sdk)
    const data = {
      jwt: this.sdk.getAccessToken(),
      extendedEphemeralPublicKey: await this.extendEphemeralPublicKey(ephemeralKeyPair),
      maxEpoch: '10',
      jwtRandomness: generateRandomness(),
      salt: BigInt(salt).toString(),
      keyClaimName: 'sub',
    }
    const response = await fetch('https://prover-dev.mystenlabs.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return await response.json()
  }
}
