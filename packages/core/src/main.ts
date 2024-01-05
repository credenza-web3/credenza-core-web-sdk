import { jwtDecode } from 'jwt-decode'
import { get, set, remove } from '@packages/common/localstorage/localstorage'
import { SDK_ENV } from '@packages/common/constants/core/core'
import type { OAuthExtension } from '@packages/oauth/src/main'
import type { AccountExtension } from '@packages/account/src/main'
export class CredenzaSDK {
  public static SDK_ENV = SDK_ENV

  public clientId: string
  public env: (typeof SDK_ENV)[keyof typeof SDK_ENV]

  private extensions: (OAuthExtension['name'] | AccountExtension['name'])[] = []
  public oauth: OAuthExtension
  public account: AccountExtension

  private accessToken: string | null

  constructor(opts: {
    clientId: string
    env?: (typeof SDK_ENV)[keyof typeof SDK_ENV]
    extensions?: (OAuthExtension | AccountExtension)[]
  }) {
    this.clientId = opts.clientId
    this.env = opts.env || SDK_ENV.PROD
    for (const ext of opts.extensions || []) {
      Object.assign(this, { [ext.name]: ext })
      this.extensions.push(ext.name)
    }
  }

  async initialize() {
    this.accessToken = get('access_token')
    if (this.accessToken) {
      const decodedJwt = jwtDecode(this.accessToken)
      if (!decodedJwt.exp || decodedJwt.aud !== this.clientId || decodedJwt.exp * 1000 < new Date().getTime())
        this.logout()
    }
    for (const extensionName of this.extensions) {
      await this[extensionName]?.initialize(this)
    }
  }

  setAccessToken(token: string) {
    set('access_token', token)
    this.accessToken = token
  }

  getAccessToken() {
    return this.accessToken
  }

  isLoggedIn() {
    return !!this.accessToken
  }

  logout() {
    remove('access_token')
    this.accessToken = null
  }
}
