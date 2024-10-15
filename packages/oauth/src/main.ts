import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { set, get } from '@packages/common/localstorage/localstorage'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import { jwtDecode } from 'jwt-decode'
import { LS_OAUTH_NONCE_KEY, LS_OAUTH_STATE_KEY } from './constants/localstorage'
import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from './constants/login-types'
import type { TOAuthLoginWithRedirectOpts, TOAuthLoginWithJwtOpts } from './main.types'
import { revokeOAuth2Session, loginWithJwtRequest } from './lib/http-requests'
import * as loginUrl from './lib/login-url'
import { recursiveToCamel } from '@packages/common/obj/obj'

export class OAuthExtension {
  static LOGIN_TYPE = OAUTH_LOGIN_TYPE
  static PASSWORDLESS_LOGIN_TYPE = OAUTH_PASSWORDLESS_LOGIN_TYPE

  public name = 'oauth' as const
  private sdk: CredenzaSDK

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    await this._handleRedirectResult()
  }

  async revokeSession() {
    if (!this.sdk.isLoggedIn()) throw new Error('Revoke failed: User is not logged in')
    return await revokeOAuth2Session(this.sdk)
  }

  revokeBrowserSessionWithRedirect(redirectUri: string) {
    const url = new URL(getOAuthApiUrl(this.sdk) + '/oauth2/logout')
    url.searchParams.append('redirect_uri', redirectUri)
    return (window.location.href = url.toString())
  }

  login(opts: TOAuthLoginWithRedirectOpts) {
    // eslint-disable-next-line no-console
    console.warn(`login is deprecated and will be removed soon. Use "loginWithRedirect" instead.`)
    return this.loginWithRedirect(opts)
  }
  loginWithRedirect(opts: TOAuthLoginWithRedirectOpts) {
    const url = loginUrl.buildLoginUrl(this.sdk, opts)
    loginUrl.extendLoginUrlWithRedirectUri(url, opts)
    loginUrl.extendLoginUrlWithLoginType(url, opts)
    loginUrl.extendLoginUrlWithPasswordlessConfig(url, opts)

    set(LS_OAUTH_NONCE_KEY, url.searchParams.get('nonce') as string)
    set(LS_OAUTH_STATE_KEY, url.searchParams.get('state') as string)

    window.location.href = url.toString()
  }

  async loginWithJwt(opts: TOAuthLoginWithJwtOpts) {
    const result = await loginWithJwtRequest(this.sdk, opts)
    if (result.access_token) {
      await this.sdk._setAccessToken(result.access_token, LS_LOGIN_PROVIDER.OAUTH)
    }
    return recursiveToCamel(result)
  }

  async _handleRedirectResult() {
    const hash = window.location.hash
    if (!hash) return

    const hashObj = hash
      .replace('#', '')
      .split('&')
      .reduce((acc: { [key: string]: string }, item: string) => {
        const [key, val] = item.split('=')
        acc[key] = val
        return acc
      }, {})

    const state = get(LS_OAUTH_STATE_KEY)
    if (hashObj.state !== state) throw new Error('Invalid state')

    if (!hashObj.access_token) throw new Error('Invalid access token')
    const decodedJwt = jwtDecode<{ nonce: string }>(hashObj.access_token)

    const nonce = get(LS_OAUTH_NONCE_KEY)
    if (nonce !== decodedJwt.nonce) throw new Error('Invalid nonce')
    await this.sdk._setAccessToken(hashObj.access_token, LS_LOGIN_PROVIDER.OAUTH)

    if (history && window.location.hash) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search)
    } else {
      window.location.hash = ''
    }
  }
}
