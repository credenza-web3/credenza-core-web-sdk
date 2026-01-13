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
const pending = await sdk.account.pendingVerificationContacts()
```

## Friends Management

Friendship Status Constants:

- `PENDING` - 'pending' (friend request sent, waiting for response)
- `ACCEPTED` - 'accepted' (friends are connected)
- `BLOCKED` - 'blocked' (user is blocked)

Get paginated friends list

```
const friends = await sdk.account.getFriendsPaginated({
  status?: 'pending' | 'accepted' | 'blocked' // default: 'accepted'
  client_id?: string
  include_sub_data?: boolean
  include_sui_data?: boolean
  include_evm_data?: boolean
  limit?: number
  offset?: string
})
```

Send friend request

```
const friendship = await sdk.account.sendFriendRequest(targetSub: string, clientId?: string)
```

Accept friend request

```
const friendship = await sdk.account.acceptFriendRequest(friendshipId: string)
```

Block user

```
const friendship = await sdk.account.blockUser(targetSub: string, clientId?: string)
```

Unblock user

```
const friendship = await sdk.account.unblockUser(targetSub: string, clientId?: string)
```

Remove friend

```
const friendship = await sdk.account.removeFriend(targetSub: string, clientId?: string)
```

Get friend information

```
const friendInfo = await sdk.account.getFriendInfo(targetSub: string, {
  client_id?: string
  include_sui_data?: boolean
  include_evm_data?: boolean
})
```
