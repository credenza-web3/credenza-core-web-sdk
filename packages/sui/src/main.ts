import type { CredenzaSDK } from '@packages/core/src/main'
import { getSuiAddress } from './lib/http-requests'

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
    this._assureLogin()
    const { address } = await getSuiAddress(this.sdk)
    return address
  }
}
