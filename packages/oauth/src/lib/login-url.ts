import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { generateRandomString } from '@packages/common/str/str'

import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from '../constants/login-types'

import type { CredenzaSDK } from '@packages/core/src/main'
import type {
  TOAuthLoginBaseOpts,
  TOAuthLoginRedirectUrlOpts,
  TOAuthLoginTypeOpts,
  TOAuthPasswordlessLoginOpts,
} from '../main.types'

export function buildLoginUrl(sdk: CredenzaSDK, opts: TOAuthLoginBaseOpts): URL {
  const url = new URL(getOAuthApiUrl(sdk) + '/oauth2/authorize')
  url.searchParams.append('client_id', sdk.clientId)
  url.searchParams.append('scope', opts.scope)
  url.searchParams.append('nonce', opts.nonce || generateRandomString())
  url.searchParams.append('state', opts.state || generateRandomString())
  url.searchParams.append('response_type', opts.responseType || 'token')
  url.searchParams.append('credenza_session_length_seconds', String(opts.sessionLengthSeconds ?? 60 * 60))
  return url
}

export function extendLoginUrlWithRedirectUri(url: URL, opts: TOAuthLoginRedirectUrlOpts): void {
  url.searchParams.append('redirect_uri', opts.redirectUrl)
}

export function extendLoginUrlWithLoginType(url: URL, opts: TOAuthLoginTypeOpts): void {
  if (!opts.type) return
  if (opts.type !== OAUTH_LOGIN_TYPE.CREDENTIALS) url.pathname += `/${opts.type}`
  url.searchParams.append('allowed_login_types', opts.type)
}

export function extendLoginUrlWithPasswordlessConfig(url: URL, opts: TOAuthPasswordlessLoginOpts): void {
  if (!opts.passwordlessType || url.searchParams.get('allowed_login_types') !== OAUTH_LOGIN_TYPE.PASSWORDLESS) return

  url.searchParams.append('allowed_passwordless_login_type', opts.passwordlessType)
  if (opts.forceEmail && opts.passwordlessType === OAUTH_PASSWORDLESS_LOGIN_TYPE.EMAIL) {
    url.searchParams.append('force_email', opts.forceEmail)
  } else if (opts.forcePhone && opts.passwordlessType === OAUTH_PASSWORDLESS_LOGIN_TYPE.PHONE) {
    url.searchParams.append('force_phone', opts.forcePhone)
  }
}
