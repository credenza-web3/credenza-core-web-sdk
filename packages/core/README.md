# CREDENZA WEB SDK Core

## Registering client

Visit https://developers.credenza3.com/ sign in and create your Client

## Installation

```
npm install @credenza3/core-web
```

## Extensions

- [OAuthExtension](https://www.npmjs.com/package/@credenza3/core-web-oauth-ext)

- [AccountExtension](https://www.npmjs.com/package/@credenza3/core-web-account-ext)

- [SuiExtension](https://www.npmjs.com/package/@credenza3/core-web-sui-ext)

  - [ZkExtension](https://www.npmjs.com/package/@credenza3/core-web-sui-zklogin-ext)

- [EvmExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-ext)

  - [MetamaskExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-metamask-ext)

## Usage

Create the SDK instance and Initialize

```
const sdk = new CredenzaSDK({
  clientId: <CLIENT_ID>,
  env?: CredenzaSDK.SDK_ENV.STAGING // LOCAL | STAGING | PROD,
  extensions: [
    new EvmExtension({chainConfig, extensions: [
      new MetamaskExtension()
    ]}),
    new OAuthExtension(),
    new AccountExtension(),
    new SuiExtension({ suiNetwork: suiNetworkName, extensions: [new ZkLoginExtension()] }),
  ],
})

// init all of the extensions and emits INIT event
await sdk.initialize()
```

## Usage

Get access token

```
const token = sdk.getAccessToken(): string
```

Get login provider

```
const loginProvider = sdk.getLoginProvider(): string ("oauth" | "metamask")
```

Get is user logged in

```
const isLoggedIn = sdk.isLoggedIn(): boolean
```

Logout // destroy access token and emit LOGOUT event

```
sdk.logout()
```

## Events

```
SDK_EVENT = {
  ERROR: 'ERROR',
  INIT: 'INIT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
}

const event = CredenzaSDK.SDK_EVENT.<EVENT_NAME>
const unsubscribe = sdk.on(event, (data) => {})
sdk.once(event, (data) => {})
```
