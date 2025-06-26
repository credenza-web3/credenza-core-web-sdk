import { getOAuthApiUrl, getOauthUIApiUrl } from '@packages/common/oauth/oauth'
import { generateRandomString } from '@packages/common/str/str'

import type { CredenzaSDK } from '@packages/core/src/main'
import type {
  TOAuthLoginBaseOpts,
  TOAuthLoginRedirectUrlOpts,
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

export function buildLoginUrl(
  sdk: CredenzaSDK,
  opts: TOAuthLoginBaseOpts & TOAuthLoginResponseTypeOpts,
  is_jwt: boolean = false,
): URL {
  const urlF = is_jwt ? getOAuthApiUrl : getOauthUIApiUrl
  const url = new URL(urlF(sdk) + `/oauth2/authorize` + (is_jwt ? '/jwt' : ''))
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

export function extendLoginUrlWithPasswordlessConfig(url: URL, opts: TOAuthPasswordlessLoginOpts): void {
  if (opts.forceEmail) {
    url.searchParams.append('force_email', opts.forceEmail)
  } else if (opts.forcePhone) {
    url.searchParams.append('force_phone', opts.forcePhone)
  }
}
