import type { CredenzaSDK } from '@packages/core/src/main'
import { getSuiAddressHttp, signSuiDataHttp } from './http-requests'

export async function getSuiAddress(sdk: CredenzaSDK, isZkLogin: boolean) {
  if (isZkLogin) {
    return await sdk.sui.zkLogin.getAddress()
  }

  return await getSuiAddressHttp(sdk)
}

export async function signSuiData(sdk: CredenzaSDK, data: { method: string; param: string; isZkLogin: boolean }) {
  if (data.isZkLogin) {
    return await sdk.sui.zkLogin.getZkLoginSignature()
  }

  return await signSuiDataHttp(sdk, data)
}
