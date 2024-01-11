import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import type { CredenzaSDK } from '@packages/core/src/main'
import { toBeHex } from 'ethers'

export async function sign(sdk: CredenzaSDK, data: { method: string; params?: unknown[] }) {
  if (!data.method) throw new Error('Invalid method')
  if (!data.params) throw new Error('Invalid signature parameter')

  const body = JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? toBeHex(v) : v))
  const response = await fetch(`${getOAuthApiUrl(sdk)}/accounts/evm/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sdk.getAccessToken()}`,
    },
    body,
  })
  if (!response.ok) throw new Error(response.statusText)

  const { signature } = await response.json()
  return signature
}
