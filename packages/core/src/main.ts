import type { OAuthExtension } from '@packages/oauth/src/main'
import { get, set, remove } from '@packages/common/localstorage/localstorage'

let exts: OAuthExtension[]
export class CredenzaSDK {
  public oauth?: OAuthExtension
  public clientId: string
  public env: 'local' | 'staging' | 'prod'

  private accessToken: string | null

  constructor(opts: {
    clientId: string,
    env?: 'local' | 'staging' | 'prod',
    extensions?: OAuthExtension[]
  }) {
    exts = opts.extensions || []
    this.clientId = opts.clientId
    this.env = opts.env || 'prod'
  }

  async initialize() {
    this.accessToken = get('access_token')
    for (const ext of exts) {
      this[ext.name] = ext
      await ext.initialize(this)
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
