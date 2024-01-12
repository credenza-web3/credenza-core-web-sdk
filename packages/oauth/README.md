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
  redirectUrl: window.location.href,
})
```
