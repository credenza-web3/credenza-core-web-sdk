import type { CredenzaSDK } from '@packages/core/src/main'
import { jwtToAddress } from '@mysten/zklogin'
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async extendEphemeralPublicKey() {
    //const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey())
  }
}
