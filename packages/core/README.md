# CREDENZA WEB SDK Core

## Registering client

Visit https://developers.credenza3.com/ sign in and create your Client

## Installation

```
npm install @credenza3/core-web
```

## Extensions

[OAuthExtension](https://www.npmjs.com/package/@credenza3/core-web-oauth-ext)

[AccountExtension](https://www.npmjs.com/package/@credenza3/core-web-account-ext)

[EvmExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-ext)

-- [WalletConnectExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-walletconnect-ext)

-- [MetamaskExtension](https://www.npmjs.com/package/@credenza3/core-web-evm-metamask-ext)

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  clientId: <CLIENT_ID>,
  env?: CredenzaSDK.SDK_ENV.STAGING
  extensions: [
    new EvmExtension({chainConfig, extensions: [
      new MetamaskExtension()
      new WalletConnectExtension()
    ]}),
    new OAuthExtension(),
    new AccountExtension(),
  ], // select necessary extensions
})
```

## Events

```
const event = CredenzaSDK.SDK_EVENT.<EVENT_NAME>
const unsubscribe = sdk.on(event, (data) => {})
sdk.once(event, (data) => {})
```
