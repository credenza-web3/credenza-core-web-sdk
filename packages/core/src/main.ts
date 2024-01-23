import { jwtDecode } from 'jwt-decode'
import { get, set, remove } from '@packages/common/localstorage/localstorage'
import { SDK_ENV } from '@packages/common/constants/core'
import { LS_ACCESS_TOKEN_KEY, LS_LOGIN_TYPE_KEY, LS_LOGIN_TYPE } from '@packages/common/constants/localstorage'
import { emit, once, on, SDK_EVENT } from './lib/events/events'
import type { OAuthExtension } from '@packages/oauth/src/main'
import type { AccountExtension } from '@packages/account/src/main'
import type { MetamaskExtension } from '@packages/metamask/src/main'
import type { EvmExtension } from '@packages/evm/src/main'
import type { WalletConnectExtension } from '@packages/walletconnect/src/main'
import type { SuiExtension } from '@packages/sui/src/main'

type TExtensionName = OAuthExtension['name'] | AccountExtension['name'] | EvmExtension['name'] | SuiExtension['name']
type TExtension = OAuthExtension | AccountExtension | EvmExtension | SuiExtension
export class CredenzaSDK {
  public static SDK_ENV = SDK_ENV
  public static SDK_EVENT = SDK_EVENT

  public clientId: string
  public env: (typeof SDK_ENV)[keyof typeof SDK_ENV]

  private extensions: TExtensionName[] = []
  public oauth: OAuthExtension
  public account: AccountExtension
  public metamask: MetamaskExtension
  public evm: EvmExtension
  public walletconnect: WalletConnectExtension
  public sui: SuiExtension

  private accessToken: string | null
  private loginType: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE] | null

  constructor(opts: { clientId: string; env?: (typeof SDK_ENV)[keyof typeof SDK_ENV]; extensions?: TExtension[] }) {
    this.clientId = opts.clientId
    this.env = opts.env || SDK_ENV.PROD
    for (const ext of opts.extensions || []) {
      Object.assign(this, { [ext.name]: ext })
      this.extensions.push(ext.name)
    }
  }

  public async initialize() {
    this.accessToken = get(LS_ACCESS_TOKEN_KEY)
    this.loginType = get(LS_LOGIN_TYPE_KEY) as (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]
    if (this.accessToken) {
      const decodedJwt = jwtDecode(this.accessToken)
      if (!decodedJwt.exp || decodedJwt.aud !== this.clientId || decodedJwt.exp * 1000 < new Date().getTime())
        this.logout()
    }
    for (const extensionName of this.extensions) {
      await this[extensionName]?._initialize(this)
    }
    emit(SDK_EVENT.INIT)
  }

  public async _setAccessToken(token: string, loginType: (typeof LS_LOGIN_TYPE)[keyof typeof LS_LOGIN_TYPE]) {
    set(LS_LOGIN_TYPE_KEY, loginType)
    set(LS_ACCESS_TOKEN_KEY, token)
    this.accessToken = token
    this.loginType = loginType
    emit(SDK_EVENT.LOGIN)
  }

  public getAccessToken() {
    return this.accessToken
  }

  public getLoginType() {
    return this.loginType
  }

  public isLoggedIn() {
    return !!this.accessToken && !!this.loginType
  }

  public logout() {
    remove(LS_ACCESS_TOKEN_KEY)
    this.accessToken = null
    this.loginType = null
    emit(SDK_EVENT.LOGOUT)
  }

  public once = once
  public on = on
  public _emit = emit
}
