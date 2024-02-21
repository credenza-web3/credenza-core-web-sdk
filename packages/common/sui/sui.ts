import type { CredenzaSDK } from '../../../packages/core/src/main'
import { SDK_ENV } from '../constants/core'
import { SUI_API_URL } from '../constants/sui'

export function getSuiApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return SUI_API_URL.LOCAL
    case SDK_ENV.STAGING:
      return SUI_API_URL.STAGING
    case SDK_ENV.PROD:
      return SUI_API_URL.PROD
    default:
      throw new Error('Invalid sdk env')
  }
}
