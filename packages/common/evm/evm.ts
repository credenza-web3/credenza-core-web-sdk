import type { CredenzaSDK } from '../../../packages/core/src/main'
import { SDK_ENV } from '../constants/core'
import { EVM_API_URL } from '../constants/evm'

export function getEvmApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return EVM_API_URL.LOCAL
    case SDK_ENV.STAGING:
      return EVM_API_URL.STAGING
    case SDK_ENV.PROD:
      return EVM_API_URL.PROD
    default:
      throw new Error('Invalid sdk env')
  }
}
