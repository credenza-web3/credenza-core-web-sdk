# CREDENZA WEB SDK OAuthExtension

## Installation

```
npm i @credenza3/core-web-oauth-ext

import { OAuthExtension } from '@credenza3/core-web-oauth-ext'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new OAuthExtension()],
  ...other sdk params
})
```

Login with Credenza OAuth2 UI

```
await sdk.oauth.loginWithRedirect({
  scope: 'profile email phone blockchain.evm.write blockchain.evm',
  redirectUrl: window.location.href, // must be configured in client settings

  // defines Authentication flow session duration
  // defaults to 1h
  sessionLengthSeconds?: number

  // explicitly define nonce
  nonce?: string

  // explicitly define state
  state?: string

  responseType?: 'token' | 'code' // 'token

  // Required if 'responseType' === 'code'
  codeChallenge: string
  codeChallengeMethod: 'S256' | 'plain'

  // explicitly define login type
  type?: OAuthExtension.LOGIN_TYPE.<SELECTED_TYPE>

  // explicitly define passwordless login type
  // only available if `type` set to OAuthExtension.LOGIN_TYPE.PASSWORDLESS`
  passwordlessType?: OAuthExtension.PASSWORDLESS_LOGIN_TYPE<SELECTED_TYPE>

  // explicitly define passwordless email. This will skip email enter page and send verification email and navigate user to verification page.
  // only available if `passwordless_type` set to OAuthExtension.PASSWORDLESS_LOGIN_TYPE.EMAIL`
  forceEmail?: string

  // explicitly define passwordless phone. This will skip phone enter page and send verification sms and navigate user to verification page.
  // only available if `passwordless_type` set to OAuthExtension.PASSWORDLESS_LOGIN_TYPE.PHONE`
  forcePhone?: string
})
```

Login with JWT

```
await sdk.oauth.loginWithRedirect({
  scope: 'openid profile email phone blockchain.evm.write blockchain.evm',
  validatorId: string
  accessToken?: string
  idToken?: string
  responseType?: 'token' | 'code' // 'token
  codeChallenge?: string
  codeChallengeMethod?: 'S256' | 'plain'
})
```

Destroy OAuth flow session (Requires user to be logged in)

```
await sdk.oauth.revokeSession()
```

Destroy OAuth flow browser session and redirect user.

```
await sdk.oauth.revokeBrowserSessionWithRedirect(<REDIRECT_URI>)
```

Build Code Challenge

```
const {
  codeChallenge,
  codeChallengeMethod
} = await sdk.oauth.buildS256CodeChallenge(codeVerifier: string)
```

Set access token. Allows to manually set the access token. Typically used for 'code' grant flow

```
await sdk.oauth.setAccessToken(token: string)
```
