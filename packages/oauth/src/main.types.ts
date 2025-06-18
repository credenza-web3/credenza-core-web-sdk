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

export type TOAuthPasswordlessLoginOpts = {
  forceEmail?: string
  forcePhone?: string
}

export type TOAuthLoginJwtOpts = {
  validatorId: string
} & ({ idToken: string } | { accessToken: string })

export type TOAuthLoginWithRedirectOpts = TOAuthLoginBaseOpts &
  TOAuthLoginRedirectUrlOpts &
  TOAuthPasswordlessLoginOpts &
  TOAuthLoginResponseTypeOpts
export type TOAuthLoginWithJwtOpts = TOAuthLoginBaseOpts & TOAuthLoginJwtOpts & TOAuthLoginResponseTypeOpts
