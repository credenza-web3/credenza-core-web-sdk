import type { CredenzaSDK } from '@packages/core/src/main'
import { getSuiApiUrl } from '@packages/common/sui/sui'

export async function getSuiZkSalt(sdk: CredenzaSDK): Promise<string> {
  try {
    const response = await fetch(`${getSuiApiUrl(sdk)}/accounts/zk/salt`, {
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(response.statusText)

    const { salt } = await response.json()
    return salt
  } catch (error) {
    throw new Error(`Error requesting SUI zk salt: ${error.message}`)
  }
}
