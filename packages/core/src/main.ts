import { jwtDecode } from 'jwt-decode'
import { get, set, remove } from '@packages/common/localstorage/localstorage'
import { SDK_ENV } from '@packages/common/constants/core'
import { LS_ACCESS_TOKEN_KEY, LS_LOGIN_PROVIDER_KEY, LS_LOGIN_PROVIDER } from '@packages/common/constants/localstorage'
import { SDK_EVENT } from './lib/events/events.constants'
import { TSdkEvent } from './lib/events/events.types'
import { emit, once, on } from '@packages/common/events/events'
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
    this.loginProvider = get(LS_LOGIN_PROVIDER_KEY) as (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER]
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

  public async _setAccessToken(
    token: string,
    loginProvider: (typeof LS_LOGIN_PROVIDER)[keyof typeof LS_LOGIN_PROVIDER],
  ) {
    set(LS_LOGIN_PROVIDER_KEY, loginProvider)
    set(LS_ACCESS_TOKEN_KEY, token)
    this.accessToken = token
    this.loginProvider = loginProvider
    emit(SDK_EVENT.LOGIN)
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
    this.accessToken = null
    this.loginProvider = null
    emit(SDK_EVENT.LOGOUT)
  }

  public once = once<TSdkEvent>
  public on = on<TSdkEvent>
  public _emit = emit<TSdkEvent>
}
