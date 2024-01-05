import type {CredenzaSDK} from '../../../packages/core/src/main'
import {SDK_ENV} from '../constants/core/core'

export function getOAuthApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return 'http://localhost:8081'
    case SDK_ENV.STAGING:
      return ''
    case SDK_ENV.PROD:
      return ''
    default:
      throw new Error('Invalid sdk env')      
  }
}