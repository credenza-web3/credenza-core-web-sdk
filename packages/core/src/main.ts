import { jwtDecode } from 'jwt-decode'
import { get, set, remove } from '@packages/common/localstorage/localstorage'
import { SDK_ENV } from '@packages/common/constants/core'
import { LS_ACCESS_TOKEN_KEY, LS_LOGIN_TYPE_KEY, LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import type { OAuthExtension } from '@packages/oauth/src/main'
import type { AccountExtension } from '@packages/account/src/main'
import type { MetamaskExtension } from '@packages/metamask/src/main'
import type { EvmExtension } from '@packages/evm/src/main'

type TExtensionName =
  | OAuthExtension['name']
  | AccountExtension['name']
  | MetamaskExtension['name']
  | EvmExtension['name']
type TExtension = OAuthExtension | AccountExtension | MetamaskExtension | EvmExtension
export class CredenzaSDK {
  public static SDK_ENV = SDK_ENV

  public clientId: string
  public env: (typeof SDK_ENV)[keyof typeof SDK_ENV]

  private extensions: TExtensionName[] = []
  public oauth: OAuthExtension
  public account: AccountExtension
  public metamask: MetamaskExtension
  public evm: EvmExtension

  private accessToken: string | null
  private loginType: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE] | null

  constructor(opts: { clientId: string; env?: (typeof SDK_ENV)[keyof typeof SDK_ENV]; extensions?: TExtension[] }) {
    this.clientId = opts.clientId
    this.env = opts.env || SDK_ENV.PROD
    for (const ext of opts.extensions || []) {
      Object.assign(this, { [ext.name]: ext })
      this.extensions.push(ext.name)
    }
    // make sure evm ext is loaded after all other extensions
    this.extensions = this.extensions.sort((a, b) => {
      if (a === 'evm') return 1
      if (b === 'evm') return -1
      return 0
    })
  }

  private async reInitializeExtensions() {
    if (this.evm) await this.evm.initialize(this)
  }

  async initialize() {
    this.accessToken = get(LS_ACCESS_TOKEN_KEY)
    this.loginType = get(LS_LOGIN_TYPE_KEY) as (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]
    if (this.accessToken) {
      const decodedJwt = jwtDecode(this.accessToken)
      if (!decodedJwt.exp || decodedJwt.aud !== this.clientId || decodedJwt.exp * 1000 < new Date().getTime())
        this.logout()
    }
    for (const extensionName of this.extensions) {
      await this[extensionName]?.initialize(this)
    }
  }

  async setAccessToken(token: string, loginType: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]) {
    set(LS_LOGIN_TYPE_KEY, loginType)
    set(LS_ACCESS_TOKEN_KEY, token)
    this.accessToken = token
    this.loginType = loginType
    await this.reInitializeExtensions()
  }

  getAccessToken() {
    return this.accessToken
  }

  getLoginType() {
    return this.loginType
  }

  isLoggedIn() {
    return !!this.accessToken && !!this.loginType
  }

  logout() {
    remove(LS_ACCESS_TOKEN_KEY)
    this.accessToken = null
    this.loginType = null
  }
}
