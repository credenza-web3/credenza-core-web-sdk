<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
  import { mumbai, spicy } from './chain-config'

  import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
  import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
  import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'
  import { WalletConnectExtension } from '@credenza3/web-sdk-ext-walletconnect/src/main'
  import { EvmExtension, ethers } from '@credenza3/web-sdk-ext-evm/src/main'

  const { isAddress } = ethers

  let chainConfig = spicy
  let transferTo = '0xc4F69E4fB203F832616f8CCb134ba25417455039'
  let messageToSign = ''
  let emailToChange = ''
  let phoneToChange = '+'
  let verificationCode = ''
  let oldPassword = ''
  let newPassword = ''
  let confirmPassword = ''
  let name = ''
  let image = ''

  const sdk = new CredenzaSDK({
    clientId: PUBLIC_CLIENT_ID,
    env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
    extensions: [
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
      scope: 'profile profile.write email phone blockchain.evm.write blockchain.evm',
      redirectUrl: window.location.href,
      //type: OAuthExtension.LOGIN_TYPE.GOOGLE,
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

  const handleLogout = () => {
    sdk.logout()
    isLoggedIn = false
  }

  const handleGetUserInfo = async () => {
    const result = await sdk.account.info()
    console.log('UserInfo: ', result)
    name = result.name || ''
    image = result.image || ''
  }

  const handleSwitchChain = async () => {
    await sdk.evm.switchChain(chainConfig)
    console.log('New chain config: ', chainConfig)
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
  }

  const handleTransferNativeCurrencyEvm = async () => {
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
    const signer = await provider.getSigner()
    console.log('Current address: ', await signer.getAddress())
    if (!isAddress(transferTo.trim())) throw new Error('Invalid transfer address')
    console.log('To Address: ', transferTo)
    const tx = {
      to: transferTo.trim(),
      value: '1',
    }
    const result = await signer.sendTransaction(tx)
    console.log('Transaction response: ', result)
  }

  const handleSignMessage = async () => {
    const provider = await sdk.evm.getEthersProvider()
    const signer = await provider.getSigner()
    const sig = await signer.signMessage(messageToSign.trim())
    console.log('Signature: ', sig)
    console.log(await signer.getAddress(), ethers.verifyMessage(messageToSign, sig))
    messageToSign = ''
  }

  const handleGetEvmAddress = async () => {
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
    const signer = await provider.getSigner()
    const result = await signer.getAddress()
    console.log('Evm address: ', result)
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
    const result = await sdk.account.updateProfile({ name, picture: image })
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
  <select bind:value={chainConfig} on:change={handleSwitchChain}>
    {#each [mumbai, spicy] as chain}
      <option selected={chain.chainId === chainConfig.chainId} value={chain}>
        {chain.displayName} ({chain.chainId})
      </option>
    {/each}
  </select>
  <button on:click={handleLogout}> Logout </button>
  <button on:click={handleGetUserInfo}> Log Account Info </button>
  <button on:click={handleGetEvmAddress}> Log Blockchain Info </button>
  <div>
    <br />
    <input type="text" bind:value={transferTo} style="min-width: 350px" placeholder="0x..." />
    <button on:click={handleTransferNativeCurrencyEvm}> Transfer native currency EVM </button>
  </div>
  <div>
    <br />
    <input type="text" bind:value={messageToSign} style="min-width: 350px" placeholder="" />
    <button on:click={handleSignMessage}> Sign Message </button>
  </div>
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
    <input type="text" bind:value={image} placeholder="image url" />
    <button on:click={handleUpdateProfile}> Update profile </button>
  </div>
{/if}
