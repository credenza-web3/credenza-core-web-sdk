import type { CredenzaSDK } from '@packages/core/src/main'
import { getSuiApiUrl } from '@packages/common/sui/sui'

export async function getSuiAddress(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getSuiApiUrl(sdk)}/accounts/address`, {
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
