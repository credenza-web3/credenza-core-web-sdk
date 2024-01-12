import { toBeHex } from 'ethers'

export type TCredenzaRequestFields = {
  accessToken: string
  apiUrl: string
}
export type TRequestBody = { method: string; params?: unknown[] }

export async function createAccount({ apiUrl, accessToken }: TCredenzaRequestFields) {
  const response = await fetch(`${apiUrl}/accounts/evm`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
  })
  const json = await response.json()
  return [json.blockchain.evm.address]
}

export async function listAccounts({ apiUrl, accessToken }: TCredenzaRequestFields) {
  try {
    const response = await fetch(`${apiUrl}/accounts/evm`, {
      headers: {
        Authorization: accessToken,
      },
    })
    const json = await response.json()
    if (!json.blockchain?.evm?.address) return await createAccount({ apiUrl, accessToken })
    return [json.blockchain.evm.address]
  } catch (error) {
    throw new Error(`Error requesting accounts: ${error.message}`)
  }
}

export async function sign({ apiUrl, accessToken }: TCredenzaRequestFields, data: TRequestBody) {
  if (!data.method) throw new Error('Invalid method')
  if (!data.params) throw new Error('Invalid signature parameter')

  const body = JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? toBeHex(v) : v))
  const response = await fetch(`${apiUrl}/accounts/evm/sign`, {
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
