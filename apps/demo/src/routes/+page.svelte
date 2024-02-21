<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
  import { mumbai, spicy } from './chain-config'

  import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
  import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
  import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'
  import { WalletConnectExtension } from '@credenza3/web-sdk-ext-walletconnect/src/main'
  import { EvmExtension } from '@credenza3/web-sdk-ext-evm/src/main'
  import { SuiExtension } from '@credenza3/web-sdk-ext-sui/src/main'

  import Sui from '../components/Sui.svelte'
  import Evm from '../components/Evm.svelte'

  let chainConfig = spicy
  let emailToChange = ''
  let phoneToChange = '+'
  let verificationCode = ''
  let oldPassword = ''
  let newPassword = ''
  let confirmPassword = ''
  let name = ''
  let picture = ''

  const sdk = new CredenzaSDK({
    clientId: PUBLIC_CLIENT_ID,
    env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
    extensions: [
      new SuiExtension(SuiExtension.SUI_NETWORK.DEVNET),
      new EvmExtension({
        chainConfig,
        extensions: [
          new MetamaskExtension(),
          new WalletConnectExtension({
            projectId: 'e98bfa148f5b128914133e707b993b1d',
            chains: [mumbai, spicy],
            metadata: {
              name: 'Test',
              description: 'Test description ',
              url: 'http://localhost:5173',
              icons: [],
            },
          }),
        ],
      }),
      new OAuthExtension(),
      new AccountExtension(),
    ],
  })

  let isLoggedIn = false

  const handleLogin = async () => (isLoggedIn = true)

  const handleOAuthLogin = () => {
    sdk.oauth.login({
      scope:
        'profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write',
      redirectUrl: window.location.href,
      //type: OAuthExtension.LOGIN_TYPE.PASSWORDLESS,
      //passwordless_type: OAuthExtension.PASSWORDLESS_LOGIN_TYPE.PHONE,
    })
  }

  const handleMetamaskLogin = async () => {
    await sdk.evm.metamask.login()
    await handleLogin()
  }

  const handleWalletConnectLogin = async () => {
    await sdk.evm.walletconnect.login()
    await handleLogin()
  }

  const handleLogout = async () => {
    sdk.logout()
    isLoggedIn = false
    console.log('User logged out')
  }

  const handleRevokeSession = async (opts?: { revokeAllSessions?: boolean; revokeBrowserSession?: boolean }) => {
    const loginProvider = sdk.getLoginProvider()
    if (opts?.revokeBrowserSession && loginProvider === 'oauth') {
      sdk.oauth.revokeBrowserSessionWithRedirect(window.location.href)
    }
    if (opts?.revokeAllSessions && loginProvider === 'oauth') {
      await sdk.oauth.revokeSession()
      console.log('Session revoked')
    }
  }

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

  onMount(async () => {
    await sdk.initialize()
    Object.assign(window, { credenzaSDK: sdk })
    if (!sdk.isLoggedIn()) return
    await handleLogin()
  })
</script>

{#if !isLoggedIn}
  <button on:click={handleOAuthLogin}> Login With OAuth2 </button>
  <button on:click={handleMetamaskLogin}> Login With Metamask </button>
  <button on:click={handleWalletConnectLogin}> Login With WalletConnect </button>
{:else}
  <div>
    <button on:click={handleLogout}> Logout </button>
    <button on:click={() => handleRevokeSession({ revokeAllSessions: true })}> Revoke session </button>
    <button on:click={() => handleRevokeSession({ revokeBrowserSession: true })}>
      Revoke browser session with redirect
    </button>
  </div>
  <br />
  <button on:click={handleGetUserInfo}> Log Account Info </button>
  <br />
  <div>
    <input type="email" bind:value={emailToChange} style="min-width: 350px" placeholder="Email address" />
    <button on:click={handleChangeEmail}> Request Change Email </button>
  </div>
  <div>
    <input type="text" bind:value={phoneToChange} style="min-width: 350px" placeholder="Phone number" />
    <button on:click={handleChangePhone}> Request Change Phone </button>
  </div>
  <div>
    <input type="text" bind:value={verificationCode} style="min-width: 350px" placeholder="Code" />
    <button on:click={handleVerifyCode}> Verify code </button>
  </div>
  <br />
  <div>
    <input type="password" bind:value={oldPassword} placeholder="old password" />
    <input type="password" bind:value={newPassword} placeholder="new password" />
    <input type="password" bind:value={confirmPassword} placeholder="confirm password" />
    <button on:click={handleChangePassword}> Change password </button>
  </div>
  <br />
  <div>
    <input type="text" bind:value={name} placeholder="name" />
    <input type="text" bind:value={picture} placeholder="image url" />
    <button on:click={handleUpdateProfile}> Update profile </button>
  </div>

  <Evm {sdk} bind:chainConfig />
  <Sui {sdk} />
{/if}
