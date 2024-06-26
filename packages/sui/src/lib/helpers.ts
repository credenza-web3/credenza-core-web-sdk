import type { CredenzaSDK } from '@packages/core/src/main'
import { signSuiDataHttp } from './http-requests'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { verifyTransactionSignature, verifyPersonalMessageSignature } from '@mysten/sui/verify'

export async function defaultSignSuiBlockData({
  txb,
  client,
  sdk,
  method,
}: {
  method: string
  txb: Transaction
  client: SuiClient
  sdk: CredenzaSDK
}) {
  const transactionBlock = await txb.build({ client })
  const { signature } = await signSuiDataHttp(sdk, {
    method,
    param: Buffer.from(transactionBlock).toString('base64'),
  })
  await verifyTransactionSignature(transactionBlock, signature)
  return { signature, transactionBlock }
}

export async function defaultSignSuiPersonalMessage({
  message,
  sdk,
  method,
}: {
  message: string
  method: string
  sdk: CredenzaSDK
}) {
  const result = await signSuiDataHttp(sdk, {
    method,
    param: Buffer.from(message).toString('base64'),
  })
  await verifyPersonalMessageSignature(new TextEncoder().encode(message), result.signature)
  return result
}
