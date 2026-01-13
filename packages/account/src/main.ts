import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { getGeneralApiUrl } from '@packages/common/core/api'

export class AccountExtension {
  public name = 'account' as const
  private sdk: CredenzaSDK

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
  }

  private async _updateAccountContact(params: { email: string } | { phone: string } | { code: string }) {
    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me/change-contact`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({
        ...('email' in params ? { email: params.email.trim() } : {}),
        ...('phone' in params ? { phone: params.phone.trim() } : {}),
        ...('code' in params ? { code: params.code.trim() } : {}),
      }),
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

  async verifyCode(code: string) {
    return await this._updateAccountContact({ code })
  }

  async pendingVerificationContacts() {
    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me/change-contact`
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)
    const json = await response.json()
    return json
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

  async updateProfile(params: { name: string; picture: string }) {
    if (!params.name && !params.picture) throw new Error('Nothing to update')

    const apiUrl = `${getOAuthApiUrl(this.sdk)}/accounts/me`
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({
        ...(params.name ? { name: params.name.trim() } : {}),
        ...(params.picture ? { image: params.picture.trim() } : {}),
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
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({
        old_password: params.oldPassword.trim(),
        new_password: params.newPassword.trim(),
        confirm_password: params.confirmPassword.trim(),
      }),
    })
    if (!response.ok) throw new Error(`Cannot change password: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async getFriendsPaginated(params?: {
    status?: 'pending' | 'accepted' | 'blocked'
    client_id?: string
    include_sub_data?: boolean
    include_sui_data?: boolean
    include_evm_data?: boolean
    limit?: number
    offset?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.client_id) queryParams.append('client_id', params.client_id)
    if (params?.include_sub_data !== undefined)
      queryParams.append('include_sub_data', params.include_sub_data.toString())
    if (params?.include_sui_data !== undefined)
      queryParams.append('include_sui_data', params.include_sui_data.toString())
    if (params?.include_evm_data !== undefined)
      queryParams.append('include_evm_data', params.include_evm_data.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset)

    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends?${queryParams.toString()}`
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Cannot get friends: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async sendFriendRequest(targetSub: string, clientId?: string) {
    const queryParams = clientId ? `?client_id=${clientId}` : ''
    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/request${queryParams}`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({ sub: targetSub }),
    })
    if (!response.ok) throw new Error(`Cannot send friend request: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async acceptFriendRequest(friendshipId: string) {
    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/${friendshipId}/accept`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Cannot accept friend request: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async blockUser(targetSub: string, clientId?: string) {
    const queryParams = clientId ? `?client_id=${clientId}` : ''
    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/block${queryParams}`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({ sub: targetSub }),
    })
    if (!response.ok) throw new Error(`Cannot block user: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async unblockUser(targetSub: string, clientId?: string) {
    const queryParams = clientId ? `?client_id=${clientId}` : ''
    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/unblock${queryParams}`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
      body: JSON.stringify({ sub: targetSub }),
    })
    if (!response.ok) throw new Error(`Cannot unblock user: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async removeFriend(targetSub: string, clientId?: string) {
    const queryParams = clientId ? `?client_id=${clientId}` : ''
    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/sub/${targetSub}${queryParams}`
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Cannot remove friend: ${response.statusText}`)
    const json = await response.json()
    return json
  }

  async getFriendInfo(
    targetSub: string,
    params?: {
      client_id?: string
      include_sui_data?: boolean
      include_evm_data?: boolean
    },
  ) {
    const queryParams = new URLSearchParams()
    if (params?.client_id) queryParams.append('client_id', params.client_id)
    if (params?.include_sui_data !== undefined)
      queryParams.append('include_sui_data', params.include_sui_data.toString())
    if (params?.include_evm_data !== undefined)
      queryParams.append('include_evm_data', params.include_evm_data.toString())

    const apiUrl = `${getGeneralApiUrl(this.sdk)}/friends/info/${targetSub}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${this.sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(`Cannot get friend info: ${response.statusText}`)
    const json = await response.json()
    return json
  }
}
