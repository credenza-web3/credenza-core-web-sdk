import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import type { CredenzaSDK } from '@packages/core/src/main'

export async function createAccount(sdk: CredenzaSDK) {
  const response = await fetch(`${getOAuthApiUrl(sdk)}/accounts/evm`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sdk.getAccessToken()}`
    }
  })
  const json = await response.json()
  return [json.blockchain.evm.address]
}

export async function listAccounts(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getOAuthApiUrl(sdk)}/accounts/evm`, {
      headers: {
        'Authorization': `Bearer ${sdk.getAccessToken()}`
      }
    })
    const json = await response.json()
    if (!json.blockchain?.evm?.address) return await createAccount(sdk)
    return [json.blockchain.evm.address]
  } catch (error) {
    throw new Error(`Error requesting accounts: ${error.message}`)
  }
}