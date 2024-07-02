import type { CredenzaSDK } from '@packages/core/src/main'
import { getSuiApiUrl } from '@packages/common/sui/sui'

export async function getSuiAddressHttp(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getSuiApiUrl(sdk)}/accounts/address`, {
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(response.statusText)

    return await response.json()
  } catch (error) {
    throw new Error(`Error requesting SUI address: ${error.message}`)
  }
}

export async function signSuiDataHttp(sdk: CredenzaSDK, data: { method: string; param: string }) {
  try {
    const response = await fetch(`${getSuiApiUrl(sdk)}/accounts/sign`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(response.statusText)

    const json = await await response.json()
    return json
  } catch (error) {
    throw new Error(`Error Signing SUI data: ${error.message}`)
  }
}
