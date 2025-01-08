import type { CredenzaSDK } from '@packages/core/src/main'
import { Buffer } from 'buffer'
import { signSuiDataHttp } from './http-requests'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { verifyTransactionSignature, verifyPersonalMessageSignature } from '@mysten/sui/verify'
import { SUI_SIGN_METHODS } from '../main.constants'

export async function defaultSignSuiBlockData({
  txb,
  client,
  sdk,
}: {
  txb: Transaction
  client: SuiClient
  sdk: CredenzaSDK
}) {
  const transactionBlock = await txb.build({ client })
  const { signature } = await signSuiDataHttp(sdk, {
    method: SUI_SIGN_METHODS.SIGN_TRANSACTION,
    param: Buffer.from(transactionBlock).toString('base64'),
  })
  await verifyTransactionSignature(transactionBlock, signature)
  return { signature, transactionBlock }
}

export async function defaultSignSuiPersonalMessage({ message, sdk }: { message: string; sdk: CredenzaSDK }) {
  const result = await signSuiDataHttp(sdk, {
    method: SUI_SIGN_METHODS.SIGN_PERSONAL_MESSAGE,
    param: Buffer.from(message).toString('base64'),
  })
  await verifyPersonalMessageSignature(new TextEncoder().encode(message), result.signature)
  return result
}
