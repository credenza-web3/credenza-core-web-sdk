import type { CredenzaSDK } from '../../core/src/main'
import { SDK_ENV } from '../constants/core'
import { GENERAL_API_URL } from '../constants/core'

export function getGeneralApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return GENERAL_API_URL.LOCAL
    case SDK_ENV.STAGING:
      return GENERAL_API_URL.STAGING
    case SDK_ENV.PROD:
      return GENERAL_API_URL.PROD
    default:
      throw new Error('Invalid sdk env')
  }
}
