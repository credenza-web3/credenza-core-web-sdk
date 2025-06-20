import type { CredenzaSDK } from '../../../packages/core/src/main'
import { SDK_ENV } from '../constants/core'
import { OAUTH_API_URL, OAUTH_UI_URL } from '../constants/oauth'

export function getOAuthApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return OAUTH_API_URL.LOCAL
    case SDK_ENV.STAGING:
      return OAUTH_API_URL.STAGING
    case SDK_ENV.PROD:
      return OAUTH_API_URL.PROD
    default:
      throw new Error('Invalid sdk env')
  }
}

export function getOauthUIApiUrl(sdk: CredenzaSDK) {
  switch (sdk.env) {
    case SDK_ENV.LOCAL:
      return OAUTH_UI_URL.LOCAL
    case SDK_ENV.STAGING:
      return OAUTH_UI_URL.STAGING
    case SDK_ENV.PROD:
      return OAUTH_UI_URL.PROD
    default:
      throw new Error('Invalid sdk env')
  }
}
