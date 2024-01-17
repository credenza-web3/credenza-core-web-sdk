# CREDENZA WEB SDK AccountExtension

## Installation

```
npm i @credenza3/web-sdk-ext-account

import { AccountExtension } from '@credenza3/web-sdk-ext-account'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new AccountExtension()],
  ...other sdk params
})
```

Get UserInfo

```
await sdk.account.info()
```

Update Profile data

```
await sdk.account.updateProfile({
  name?: string
  image?: string // url
})
```

Change Password (Only available for logged in with credentials users)

```
await sdk.account.changePassword({
  oldPassword: string;
  newPassword: string;
  confirmPassword: string
})
```

Change Email (Disabled for logged in with social networks users)

```
await sdk.account.changeEmail(email:string)
// Verify by passing the code received in the Email
await sdk.account.verifyCode(code: string)
```

Change Phone number (Disabled for logged in with social networks users)

```
await sdk.account.changePhone(phone:string)
// Verify by passing the code received in the SMS
await sdk.account.verifyCode(code: string)
```
