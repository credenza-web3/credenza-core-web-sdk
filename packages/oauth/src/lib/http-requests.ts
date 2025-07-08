import type { CredenzaSDK } from '@packages/core/src/main'
import { getOauthUIApiUrl } from '@packages/common/oauth/oauth'
import * as loginUrl from './login-url'
import type { TOAuthLoginWithJwtOpts } from '../main.types'
import { sessionGet } from '@packages/common/sessionstorage/sessionstorage'
import { SS_CLIENT_CODE_VERIFIER_KEY } from '../constants/sessionstorage'

export async function revokeOAuth2Session(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getOauthUIApiUrl(sdk)}/oauth2/revoke-session`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sdk.getAccessToken()}`,
      },
    })
    if (!response.ok) throw new Error(response.statusText)
  } catch (error) {
    throw new Error(`Error revoking session: ${error.message}`)
  }
}

export async function exchangeCodeForTokenRequest(
  sdk: CredenzaSDK,
  opts: { code: string; clientServerUri: string },
): Promise<{ access_token: string; refresh_token: string }> {
  try {
    const response = await fetch(opts.clientServerUri.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: opts.code,
        client_id: sdk.clientId,
        grant_type: 'authorization_code',
        code_verifier: sessionGet(SS_CLIENT_CODE_VERIFIER_KEY),
      }),
    })
    if (!response.ok) throw new Error(response.statusText)

    return await response.json()
  } catch (error) {
    throw new Error(`Code exchange failed: ${error.message}`)
  }
}

export async function refreshTokenRequest(
  sdk: CredenzaSDK,
  opts: {
    refreshToken: string
    clientServerUri: string
  },
) {
  try {
    const response = await fetch(opts.clientServerUri.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: opts.refreshToken,
        client_id: sdk.clientId,
        grant_type: 'refresh_token',
      }),
    })
    if (!response.ok) throw new Error(response.statusText)
    return await response.json()
  } catch (error) {
    throw new Error(`Code refresh failed: ${error.message}`)
  }
}

export async function loginWithJwtRequest(sdk: CredenzaSDK, opts: TOAuthLoginWithJwtOpts) {
  try {
    const url = await loginUrl.buildLoginUrl(sdk, opts, true)
    loginUrl.extendLoginUrlWithRedirectUri(url, { redirectUrl: 'none' })

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        validator_id: opts.validatorId,
        ...('idToken' in opts ? { id_token: opts.idToken } : {}),
        ...('accessToken' in opts ? { access_token: opts.accessToken } : {}),
      }),
    })
    if (!response.ok) throw new Error(response.statusText)
    return await response.json()
  } catch (error) {
    throw new Error(`Jwt login failed: ${error.message}`)
  }
}
