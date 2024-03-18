import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from './constants/login-types'

export type TOAuthLoginOpts = {
  scope: string
  redirectUrl: string
  sessionLengthSeconds?: number
  type?: (typeof OAUTH_LOGIN_TYPE)[keyof typeof OAUTH_LOGIN_TYPE]
  passwordlessType?: (typeof OAUTH_PASSWORDLESS_LOGIN_TYPE)[keyof typeof OAUTH_PASSWORDLESS_LOGIN_TYPE]
  forceEmail?: string
  forcePhone?: string
}
