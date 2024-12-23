import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { generateRandomString } from '@packages/common/str/str'

import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from '../constants/login-types'

import type { CredenzaSDK } from '@packages/core/src/main'
import type {
  TOAuthLoginBaseOpts,
  TOAuthLoginRedirectUrlOpts,
  TOAuthLoginTypeOpts,
  TOAuthPasswordlessLoginOpts,
  TOAuthLoginResponseTypeOpts,
} from '../main.types'

function extendLoginUrlWithResponseType(url: URL, opts: TOAuthLoginResponseTypeOpts): void {
  url.searchParams.append('response_type', opts.responseType || 'token')
  if (opts.responseType === 'code') {
    if (!opts.codeChallenge || !opts.codeChallengeMethod) {
      throw new Error('code_challenge and code_challenge_method are required for response_type=code')
    }
    url.searchParams.append('code_challenge', opts.codeChallenge)
    url.searchParams.append('code_challenge_method', opts.codeChallengeMethod)
  }
}

export function buildLoginUrl(sdk: CredenzaSDK, opts: TOAuthLoginBaseOpts & TOAuthLoginResponseTypeOpts): URL {
  const url = new URL(getOAuthApiUrl(sdk) + '/oauth2/authorize')
  url.searchParams.append('client_id', sdk.clientId)
  url.searchParams.append('scope', opts.scope)
  url.searchParams.append('nonce', opts.nonce || generateRandomString())
  url.searchParams.append('state', opts.state || generateRandomString())
  url.searchParams.append('credenza_session_length_seconds', String(opts.sessionLengthSeconds ?? 60 * 60))
  extendLoginUrlWithResponseType(url, opts)
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
