import { jwtDecode } from 'jwt-decode'
import { get, set, remove } from '@packages/common/localstorage/localstorage'
import { SDK_ENV } from '@packages/common/constants/core'
import {
  LS_ACCESS_TOKEN_KEY,
  LS_LOGIN_PROVIDER_KEY,
  LS_LOGIN_PROVIDER,
  LS_REFRESH_TOKEN_KEY,
} from '@packages/common/constants/localstorage'
import { SDK_EVENT } from './lib/events/events.constants'
import type { TSdkEvent } from './lib/events/events.types'
import { emit, once, on } from '@packages/common/events/events'
import type { OAuthExtension } from '@packages/oauth/src/main'
import type { AccountExtension } from '@packages/account/src/main'
import type { ZkLoginExtension } from '@packages/sui-zk-login/src/main'
import type { EvmExtension } from '@packages/evm/src/main'
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
  public evm: EvmExtension
  public sui: SuiExtension
  public zklogin: ZkLoginExtension

  private accessToken: string | null
  private refreshToken: string | null
  private loginProvider: (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER] | null

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
    this.refreshToken = get(LS_REFRESH_TOKEN_KEY)
    this.loginProvider = get(LS_LOGIN_PROVIDER_KEY) as (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER]
    if (this.accessToken) {
      const decodedJwt = jwtDecode(this.accessToken)
      if (!decodedJwt.exp || decodedJwt.exp * 1000 < new Date().getTime()) this.logout()
    }
    for (const extensionName of this.extensions) {
      await this[extensionName]?._initialize(this)
    }
    emit(SDK_EVENT.INIT)
  }

  public async _setAccessToken(
    token: string,
    loginProvider: (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER],
    shouldSaveLS: boolean = true,
  ) {
    set(LS_LOGIN_PROVIDER_KEY, loginProvider)

    if (shouldSaveLS) set(LS_ACCESS_TOKEN_KEY, token)
    this.accessToken = token
    this.loginProvider = loginProvider
    emit(SDK_EVENT.LOGIN)
  }

  public _setRefreshToken(token: string) {
    set(LS_REFRESH_TOKEN_KEY, token)
    this.refreshToken = token
  }

  public getRefreshToken() {
    return this.refreshToken
  }

  public getAccessToken() {
    return this.accessToken
  }

  public getLoginProvider() {
    return this.loginProvider
  }

  public isLoggedIn() {
    return !!this.accessToken && !!this.loginProvider
  }

  public logout() {
    remove(LS_ACCESS_TOKEN_KEY)
    remove(LS_REFRESH_TOKEN_KEY)
    this.accessToken = null
    this.refreshToken = null
    this.loginProvider = null
    emit(SDK_EVENT.LOGOUT)
  }

  public once = once<TSdkEvent>
  public on = on<TSdkEvent>
  public _emit = emit<TSdkEvent>
}
