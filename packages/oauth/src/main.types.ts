import { OAUTH_LOGIN_TYPE, OAUTH_PASSWORDLESS_LOGIN_TYPE } from './constants/login-types'

export type TOAuthLoginOpts = {
  scope: string
  redirectUrl: string
  session_length_seconds?: number
  type?: (typeof OAUTH_LOGIN_TYPE)[keyof typeof OAUTH_LOGIN_TYPE]
  passwordless_type?: (typeof OAUTH_PASSWORDLESS_LOGIN_TYPE)[keyof typeof OAUTH_PASSWORDLESS_LOGIN_TYPE]
  force_email?: string
  force_phone?: string
}
