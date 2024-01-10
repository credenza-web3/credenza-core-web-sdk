import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import type { CredenzaSDK } from '@packages/core/src/main'

export async function signMessage(sdk: CredenzaSDK, params: {
  data: string,
  address?: string,
}) {
  const response = await fetch(`${getOAuthApiUrl(sdk)}/accounts/evm/sign_message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sdk.getAccessToken()}`
    },
    body: JSON.stringify(params),
  })
  const { signature } = await response.json()
  return signature
}