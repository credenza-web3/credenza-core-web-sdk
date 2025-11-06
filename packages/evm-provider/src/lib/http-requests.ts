import { toBeHex } from 'ethers'

export type TCredenzaRequestFields = {
  accessToken: string
  apiUrl: string
}

export type TRequestBody = { method: string; params?: unknown[] }

export async function listAccounts({ apiUrl, accessToken }: TCredenzaRequestFields) {
  if (!accessToken) throw new Error('Access token is required')
  try {
    const response = await fetch(`${apiUrl}/accounts/address`, {
      headers: {
        Authorization: accessToken,
      },
    })
    if (!response.ok) throw new Error(response.statusText)
    const json = await response.json()
    return [json.address]
  } catch (error) {
    throw new Error(`Error requesting accounts: ${error.message}`)
  }
}

export async function sign({ apiUrl, accessToken }: TCredenzaRequestFields, data: TRequestBody) {
  if (!accessToken) throw new Error('Access token is required')
  if (!data.method) throw new Error('Invalid method')
  if (!data.params) throw new Error('Invalid signature parameter')
  const body = JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? toBeHex(v) : v))
  const response = await fetch(`${apiUrl}/accounts/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body,
  })
  if (!response.ok) throw new Error(response.statusText)
  const { signature } = await response.json()
  return signature
}
