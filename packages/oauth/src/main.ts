import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { set, get } from '@packages/common/localstorage/localstorage'
import { generateRandomString } from '@packages/common/str/str'
import { LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import { jwtDecode } from 'jwt-decode'
import { LS_OAUTH_NONCE_KEY, LS_OAUTH_STATE_KEY } from './constants/localstorage'

export class OAuthExtension {
  static LOGIN_TYPE = {
    CREDENTIALS: 'credentials',
    PASSWORDLESS: 'passwordless',
    GOOGLE: 'google',
    TICKETMASTER: 'ticketmaster',
  }

  public name = 'oauth' as const
  private sdk: CredenzaSDK

  async _initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    await this._handleRedirectResult()
  }

  login(opts: {
    scope: string
    redirectUrl: string
    type?: (typeof OAuthExtension.LOGIN_TYPE)[keyof typeof OAuthExtension.LOGIN_TYPE]
  }) {
    const nonce = generateRandomString()
    const state = generateRandomString()

    const url = new URL(getOAuthApiUrl(this.sdk) + '/oauth2/authorize')
    url.searchParams.append('client_id', this.sdk.clientId)
    url.searchParams.append('response_type', 'token')
    url.searchParams.append('scope', opts.scope)
    url.searchParams.append('redirect_uri', opts.redirectUrl)
    url.searchParams.append('nonce', nonce)
    url.searchParams.append('state', state)
    if (opts.type) {
      if (opts.type !== 'credentials') url.pathname += `/${opts.type}`
      url.searchParams.append('allowed_login_types', opts.type)
    }

    set(LS_OAUTH_NONCE_KEY, nonce)
    set(LS_OAUTH_STATE_KEY, state)

    window.location.href = url.toString()
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
