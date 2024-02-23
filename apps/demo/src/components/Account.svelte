<script lang="ts">
  import type { CredenzaSDK } from '@credenza3/web-sdk/src/main'

  export let sdk: CredenzaSDK

  let emailToChange = ''
  let phoneToChange = '+'
  let verificationCode = ''
  let oldPassword = ''
  let newPassword = ''
  let confirmPassword = ''
  let name = ''
  let picture = ''

  const handleGetUserInfo = async () => {
    const result = await sdk.account.info()
    console.log('UserInfo: ', result)
    name = result.name || ''
    picture = result.picture || ''
  }

  const handleChangeEmail = async () => {
    const result = await sdk.account.changeEmail(emailToChange)
    console.log('Change email request sent: ', result)
    emailToChange = ''
  }

  const handleChangePhone = async () => {
    const result = await sdk.account.changePhone(phoneToChange)
    console.log('Change phone request sent: ', result)
    phoneToChange = '+'
  }

  const handleVerifyCode = async () => {
    const result = await sdk.account.verifyCode(verificationCode)
    console.log('Code verified: ', result)
    verificationCode = ''
  }

  const handleUpdateProfile = async () => {
    const result = await sdk.account.updateProfile({ name, picture })
    console.log('Profile updated:', result)
  }

  const handleChangePassword = async () => {
    const result = await sdk.account.changePassword({ oldPassword, newPassword, confirmPassword })
    console.log('Password changed:', result)
    oldPassword = newPassword = confirmPassword = ''
  }
</script>

<br />
<div>
  <div style="border: 2px solid #000; text-align: center">ACCOUNT</div>
  <div style="margin-top: 5px">
    <button on:click={handleGetUserInfo}> Log Account Info </button>
  </div>

  <div style="margin-top: 5px">
    <input type="email" bind:value={emailToChange} style="min-width: 350px" placeholder="Email address" />
    <button on:click={handleChangeEmail}> Request Change Email </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={phoneToChange} style="min-width: 350px" placeholder="Phone number" />
    <button on:click={handleChangePhone}> Request Change Phone </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={verificationCode} style="min-width: 350px" placeholder="Code" />
    <button on:click={handleVerifyCode}> Verify code </button>
  </div>
  <div style="margin-top: 5px">
    <input type="password" bind:value={oldPassword} placeholder="old password" />
    <input type="password" bind:value={newPassword} placeholder="new password" />
    <input type="password" bind:value={confirmPassword} placeholder="confirm password" />
    <button on:click={handleChangePassword}> Change password </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={name} placeholder="name" />
    <input type="text" bind:value={picture} placeholder="image url" />
    <button on:click={handleUpdateProfile}> Update profile </button>
  </div>
</div>
