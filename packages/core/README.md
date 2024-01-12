# CREDENZA WEB SDK Core

## Installation

```
npm install @credenza3/web-sdk
```

## Extensions

[OAuthExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-oauth)

[MetamaskExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-metamask)

[AccountExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-account)

[EvmExtension](https://www.npmjs.com/package/@credenza3/web-sdk-ext-evm)

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  clientId: <CLIENT_ID>,
  env?: CredenzaSDK.SDK_ENV.STAGING
  extensions: [
    new EvmExtension(chainConfig),
    new OAuthExtension(),
    new AccountExtension(),
    new MetamaskExtension()
  ], // select necessary extensions
})
```
