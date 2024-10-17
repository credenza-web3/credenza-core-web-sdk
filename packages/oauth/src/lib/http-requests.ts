import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import * as loginUrl from './login-url'
import { OAUTH_LOGIN_TYPE } from '../constants/login-types'
import type { TOAuthLoginWithJwtOpts } from '../main.types'

export async function revokeOAuth2Session(sdk: CredenzaSDK) {
  try {
    const response = await fetch(`${getOAuthApiUrl(sdk)}/oauth2/revoke-session`, {
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

export async function loginWithJwtRequest(sdk: CredenzaSDK, opts: TOAuthLoginWithJwtOpts) {
  try {
    const url = loginUrl.buildLoginUrl(sdk, opts)
    loginUrl.extendLoginUrlWithLoginType(url, { type: OAUTH_LOGIN_TYPE.JWT })
    loginUrl.extendLoginUrlWithRedirectUri(url, { redirectUrl: 'none' })

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        validator_id: opts.validatorId,
        ...('idToken' in opts ? { id_token: opts.idToken } : {}),
        ...('accessToken' in opts ? { access_token: opts.accessToken } : {}),
      }).toString(),
    })
    if (!response.ok) throw new Error(response.statusText)
    return await response.json()
  } catch (error) {
    throw new Error(`Jwt login failed: ${error.message}`)
  }
}
