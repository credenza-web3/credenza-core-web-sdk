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
    }

export type TOAuthLoginRedirectUrlOpts = {
  redirectUrl: string
}

export type TOAuthPasswordlessLoginOpts = {
  forceEmail?: string
  forcePhone?: string
}

export type TOAuthLoginJwtOpts = {
  validatorId: string
} & ({ idToken: string } | { accessToken: string })

export type TOAuthCodeLoginOpts = {
  clientServerUri?: string
}

export type TOAuthLoginWithRedirectOpts = TOAuthLoginBaseOpts &
  TOAuthLoginRedirectUrlOpts &
  TOAuthPasswordlessLoginOpts &
  TOAuthLoginResponseTypeOpts &
  TOAuthCodeLoginOpts
