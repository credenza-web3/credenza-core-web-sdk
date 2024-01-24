# CREDENZA WEB SDK Core

## Registering client

Visit https://developers.credenza3.com/ sign in and create your Client

## Installation

```
npm install @credenza3/web-sdk
```

## Extensions

[OAuthExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-oauth)

[AccountExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-account)

[EvmExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-evm)

-- [WalletConnectExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-walletconnect)

-- [MetamaskExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-metamask)

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
