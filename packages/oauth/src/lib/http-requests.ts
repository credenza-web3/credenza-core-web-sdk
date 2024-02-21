import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'

export async function revokeOAuth2Session(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getOAuthApiUrl(sdk)}/oauth2/revoke-session`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(response.statusText)
  } catch (error) {
    throw new Error(`Error revoking session: ${error.message}`)
  }
}
