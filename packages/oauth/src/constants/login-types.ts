export const OAUTH_LOGIN_TYPE = {
  CREDENTIALS: 'credentials',
  PASSWORDLESS: 'passwordless',
  GOOGLE: 'google',
  TICKETMASTER: 'ticketmaster',
} as const

export const OAUTH_PASSWORDLESS_LOGIN_TYPE = {
  EMAIL: 'email',
  PHONE: 'phone',
} as const
