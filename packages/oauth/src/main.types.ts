import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from './constants/login-types'

export type TOAuthLoginBaseOpts = {
  scope: string
  responseType?: 'token' | 'code'
  nonce?: string
  state?: string
  sessionLengthSeconds?: number
}

export type TOAuthLoginRedirectUrlOpts = {
  redirectUrl: string
}

export type TOAuthLoginTypeOpts = {
  type?: (typeof OAUTH_LOGIN_TYPE)[keyof typeof OAUTH_LOGIN_TYPE]
}

export type TOAuthPasswordlessLoginOpts = {
  passwordlessType?: (typeof OAUTH_PASSWORDLESS_LOGIN_TYPE)[keyof typeof OAUTH_PASSWORDLESS_LOGIN_TYPE]
  forceEmail?: string
  forcePhone?: string
}

export type TOAuthLoginJwtOpts = {
  validatorId: string
} & ({ idToken: string } | { accessToken: string })

export type TOAuthLoginWithRedirectOpts = TOAuthLoginBaseOpts &
  TOAuthLoginRedirectUrlOpts &
  TOAuthLoginTypeOpts &
  TOAuthPasswordlessLoginOpts
export type TOAuthLoginWithJwtOpts = TOAuthLoginBaseOpts & TOAuthLoginJwtOpts
