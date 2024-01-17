import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'

export class AccountExtension {
  public name = 'account' as const
  private sdk: CredenzaSDK

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
  }

  private async _updateAccountContact(params: { email: string } | { phone: string } | { code: number }) {
    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me/change-contact`
    const response = await fetch(apiUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async changeEmail(email: string) {
    return await this._updateAccountContact({ email })
  }

  async changePhone(phone: string) {
    return await this._updateAccountContact({ phone })
  }

  async verifyCode(code: number) {
    return await this._updateAccountContact({ code })
  }

  async info() {
    const apiUrl = `${getOAuthApiUrl(this.sdk)}/oauth2/userinfo`
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Cannot get userInfo: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async updateProfile(params: { name: string; image: string }) {
    if (!params.name && !params.image) throw new Error('Nothing to update')

    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me`
    const response = await fetch(apiUrl, {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({
        ...(params.name ? { name: params.name } : {}),
        ...(params.image ? { image: params.image } : {}),
      }),
    })
    if (!response.ok) throw new Error(`Cannot update user: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async changePassword(params: { oldPassword: string; newPassword: string; confirmPassword: string }) {
    if (!params.oldPassword || !params.newPassword) throw new Error('Invalid parameters')
    if (params.newPassword !== params.confirmPassword) throw new Error('Passwords do not match')

    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me/password`
    const response = await fetch(apiUrl, {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({
        old_password: params.oldPassword,
        new_password: params.newPassword,
        confirm_password: params.confirmPassword,
      }),
    })
    if (!response.ok) throw new Error(`Cannot change password: ${response.statusText}`)
    const json = await response.json()
    return json
  }
}
