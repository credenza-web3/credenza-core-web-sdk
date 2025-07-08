import { getOAuthApiUrl, getOauthUIApiUrl } from '@packages/common/oauth/oauth'
import { generateCode } from '@packages/common/str/str'

import type { CredenzaSDK } from '@packages/core/src/main'
import type {
  TOAuthLoginBaseOpts,
  TOAuthLoginRedirectUrlOpts,
  TOAuthPasswordlessLoginOpts,
  TOAuthLoginResponseTypeOpts,
  TOAuthCodeLoginOpts,
} from '../main.types'

import { sessionSet } from '@packages/common/sessionstorage/sessionstorage'
import { SS_CLIENT_CODE_VERIFIER_KEY } from '../constants/sessionstorage'

async function extendLoginUrlWithResponseType(
  sdk: CredenzaSDK,
  url: URL,
  opts: TOAuthLoginResponseTypeOpts,
): Promise<void> {
  url.searchParams.append('response_type', opts.responseType || 'token')
  if (opts.responseType === 'code') {
    const plainVerifier = generateCode()

    sessionSet(SS_CLIENT_CODE_VERIFIER_KEY, plainVerifier)

    const { codeChallenge, codeChallengeMethod } = await sdk.oauth.buildS256CodeChallenge(plainVerifier)

    url.searchParams.append('code_challenge', codeChallenge)
    url.searchParams.append('code_challenge_method', codeChallengeMethod)
  }
}

export async function buildLoginUrl(
  sdk: CredenzaSDK,
  opts: TOAuthLoginBaseOpts & TOAuthLoginResponseTypeOpts,
  is_jwt: boolean = false,
): Promise<URL> {
  const urlF = is_jwt ? getOAuthApiUrl : getOauthUIApiUrl
  const url = new URL(urlF(sdk) + `/oauth2/authorize` + (is_jwt ? '/jwt' : ''))
  url.searchParams.append('client_id', sdk.clientId)
  url.searchParams.append('scope', opts.scope)
  url.searchParams.append('nonce', opts.nonce || generateCode(32))
  url.searchParams.append('state', opts.state || generateCode(32))
  url.searchParams.append('credenza_session_length_seconds', String(opts.sessionLengthSeconds ?? 60 * 60))

  await extendLoginUrlWithResponseType(sdk, url, opts)
  return url
}

export function extendLoginUrlWithRedirectUri(url: URL, opts: TOAuthLoginRedirectUrlOpts): void {
  url.searchParams.append('redirect_uri', opts.redirectUrl)
}

export function extendLoginUrlWithClientServerUri(url: URL, opts: TOAuthCodeLoginOpts): void {
  if (!opts.clientServerUri) return
  url.searchParams.append('client_server_uri', opts.clientServerUri)
}

export function extendLoginUrlWithPasswordlessConfig(url: URL, opts: TOAuthPasswordlessLoginOpts): void {
  if (opts.forceEmail) {
    url.searchParams.append('force_email', opts.forceEmail)
  } else if (opts.forcePhone) {
    url.searchParams.append('force_phone', opts.forcePhone)
  }
}
