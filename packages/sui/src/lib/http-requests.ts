import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'

export async function getSuiSalt(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getOAuthApiUrl(sdk)}/accounts/sui/salt`, {
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(response.statusText)

    return await response.json()
  } catch (error) {
    throw new Error(`Error requesting SUI salt: ${error.message}`)
  }
}
