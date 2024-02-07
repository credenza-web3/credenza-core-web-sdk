# CREDENZA WEB SDK OAuthExtension

## Installation

```
npm i @credenza3/web-sdk-ext-oauth

import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new OAuthExtension()],
  ...other sdk params
})
```

Login with Credenza OAuth2

```
await sdk.oauth.login({
  scope: 'profile email phone blockchain.evm.write blockchain.evm',
  redirectUrl: window.location.href, // must be configured in client settings

  // defines Authentication flow session duration
  // defaults to 1h
  session_length_seconds?: number

  // explicitly define login type
  type?: OAuthExtension.LOGIN_TYPE.<SELECTED_TYPE>

  // explicitly define passwordless login type
  // only available if `type` set to OAuthExtension.LOGIN_TYPE.PASSWORDLESS`
  passwordless_type?: OAuthExtension.PASSWORDLESS_LOGIN_TYPE<SELECTED_TYPE>
})
```
