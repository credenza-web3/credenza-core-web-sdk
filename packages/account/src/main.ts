import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'

export class AccountExtension {
  public name = 'account' as const
  private sdk: CredenzaSDK

  async initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
  }

  async info() {
    try {
      const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me`
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${this.sdk.getAccessToken()}`,
        },
      })
      const json = await response.json()
      return json
    } catch (err) {
      throw err
    }
  }
}
