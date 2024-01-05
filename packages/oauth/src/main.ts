import type { CredenzaSDK } from '@packages/core/src/main'
import { getOAuthApiUrl } from '@packages/common/oauth/oauth'
import { set, get } from '@packages/common/localstorage/localstorage'
import { generateRandomString } from '@packages/common/str/str'

import { jwtDecode } from 'jwt-decode'

export class OAuthExtension {
  public name = 'oauth' as const
  private sdk: CredenzaSDK

  async initialize(sdk: CredenzaSDK) {
    this.sdk = sdk
    this.handleRedirectResult()
  }

  login(opts: { scope: string; redirectUrl: string }) {
    const nonce = generateRandomString()
    const state = generateRandomString()

    const url = new URL(getOAuthApiUrl(this.sdk) + '/oauth2/authorize')
    url.searchParams.append('client_id', this.sdk.clientId)
    url.searchParams.append('response_type', 'token')
    url.searchParams.append('scope', opts.scope)
    url.searchParams.append('redirect_uri', opts.redirectUrl)
    url.searchParams.append('nonce', nonce)
    url.searchParams.append('state', state)

    set('oauth:nonce', nonce)
    set('oauth:state', state)

    window.location.href = url.toString()
  }

  handleRedirectResult() {
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

    const state = get('oauth:state')
    if (hashObj.state !== state) throw new Error('Invalid state')

    if (!hashObj.access_token) throw new Error('Invalid access token')
    const decodedJwt = jwtDecode<{ nonce: string }>(hashObj.access_token)

    const nonce = get('oauth:nonce')
    if (nonce !== decodedJwt.nonce) throw new Error('Invalid nonce')

    this.sdk.setAccessToken(hashObj.access_token)
  }
}
