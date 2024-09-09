# CREDENZA WEB SDK AccountExtension

## Installation

```
npm i @credenza3/core-web-account-ext

import { AccountExtension } from '@credenza3/core-web-account-ext'
```

## Usage

Create the SDK instance

```
const sdk = new CredenzaSDK({
  extensions: [new AccountExtension()],
  ...other sdk params
})
```

Get UserInfo // makes an API call and returns user object

```
const user = await sdk.account.info()
```

Update Profile data

```
await sdk.account.updateProfile({
  name?: string
  picture?: string // url
})
```

Change Password (Only available for logged in with credentials users)

```
await sdk.account.changePassword({
  oldPassword: string
  newPassword: string
  confirmPassword: string
})
```

Change Email (Disabled for logged in with social networks users)

```
await sdk.account.changeEmail(email: string)
// Verify by passing the code received in the Email
await sdk.account.verifyCode(code: string)
```

Change Phone number (Disabled for logged in with social networks users)

```
await sdk.account.changePhone(phone: string)
// Verify by passing the code received in the SMS
await sdk.account.verifyCode(code: string)
```

Get pending verifications (for email and phone. To display unverified contact data)

```
const pending = await sdk.accountpendingVerificationContacts()
```
