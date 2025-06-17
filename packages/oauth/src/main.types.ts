import { OAUTH_LOGIN_TYPE } from './constants/login-types'

export type TOAuthLoginBaseOpts = {
  scope: string
  nonce?: string
  state?: string
  sessionLengthSeconds?: number
}

export type TOAuthLoginResponseTypeOpts =
  | {
      responseType?: 'token'
    }
  | {
      responseType: 'code'
      codeChallengeMethod: 'S256' | 'plain'
      codeChallenge: string
    }

export type TOAuthLoginRedirectUrlOpts = {
  redirectUrl: string
}

export type TOAuthLoginTypeOpts = {
  type?: (typeof OAUTH_LOGIN_TYPE)[keyof typeof OAUTH_LOGIN_TYPE]
}

export type TOAuthPasswordlessLoginOpts = {
  forceEmail?: string
  forcePhone?: string
}

export type TOAuthLoginJwtOpts = {
  validatorId: string
} & ({ idToken: string } | { accessToken: string })

export type TOAuthLoginWithRedirectOpts = TOAuthLoginBaseOpts &
  TOAuthLoginRedirectUrlOpts &
  TOAuthLoginTypeOpts &
  TOAuthPasswordlessLoginOpts &
  TOAuthLoginResponseTypeOpts
export type TOAuthLoginWithJwtOpts = TOAuthLoginBaseOpts & TOAuthLoginJwtOpts & TOAuthLoginResponseTypeOpts
