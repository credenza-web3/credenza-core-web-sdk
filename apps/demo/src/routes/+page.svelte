<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
  import { BrowserProvider, isAddress } from 'ethers'
  import { mumbai, spicy } from './chain-config'

  import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
  import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
  import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'
  import { EvmExtension } from '@credenza3/web-sdk-ext-evm/src/main'

  let chainConfig = spicy
  let transferTo = '0xc4F69E4fB203F832616f8CCb134ba25417455039'
  let emailToChange = ''
  let phoneToChange = '+'
  let verificationCode = ''

  const sdk = new CredenzaSDK({
    clientId: PUBLIC_CLIENT_ID,
    env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
    extensions: [new EvmExtension(chainConfig), new OAuthExtension(), new AccountExtension(), new MetamaskExtension()],
  })

  let isLoggedIn = false

  const handleLogin = async () => (isLoggedIn = true)

  const handleOAuthLogin = () => {
    sdk.oauth.login({
      scope: 'profile profile.write email phone blockchain.evm.write blockchain.evm',
      redirectUrl: window.location.href,
    })
  }

  const handleMetamaskLogin = async () => {
    await sdk.metamask.login()
    await handleLogin()
  }

  const handleLogout = () => {
    sdk.logout()
    isLoggedIn = false
  }

  const handleGetUserInfo = async () => {
    const result = await sdk.account.info()
    console.log('UserInfo: ', result)
  }

  const handleSwitchChain = async () => {
    await sdk.evm.switchChain(chainConfig)
    console.log('New chain config: ', chainConfig)
  }

  const handleTransferNativeCurrency = async () => {
    const evmProvider = await sdk.evm.getProvider()
    const provider = new BrowserProvider(evmProvider)
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

  const handleChangeEmail = async () => {
    const result = await sdk.account.changeEmail(emailToChange.trim())
    console.log('Change email request sent: ', result)
    emailToChange = ''
  }

  const handleChangePhone = async () => {
    const result = await sdk.account.changePhone(phoneToChange.trim())
    console.log('Change phone request sent: ', result)
    phoneToChange = '+'
  }

  const handleVerifyCode = async () => {
    const result = await sdk.account.verifyCode(Number(verificationCode.trim()))
    console.log('Code verified: ', result)
    verificationCode = ''
  }

  onMount(async () => {
    await sdk.initialize()
    if (sdk.isLoggedIn()) await handleLogin()
  })
</script>

{#if !isLoggedIn}
  <button on:click={handleOAuthLogin}> Login With OAuth2 </button>
  <button on:click={handleMetamaskLogin}> Login With Metamask </button>
{:else}
  <button on:click={handleLogout}> Logout </button>
  <button on:click={handleGetUserInfo}> Log Account Info </button>
  <select bind:value={chainConfig} on:change={handleSwitchChain}>
    {#each [mumbai, spicy] as chain}
      <option selected={chain.chainId === chainConfig.chainId} value={chain}>
        {chain.displayName} ({chain.chainId})
      </option>
    {/each}
  </select>
  <div>
    <br />
    <input type="text" bind:value={transferTo} style="min-width: 350px" />
    <button on:click={handleTransferNativeCurrency}> Transfer native currency </button>
  </div>
  <br />
  <div>
    <input type="email" bind:value={emailToChange} style="min-width: 350px" />
    <button on:click={handleChangeEmail}> Request Change Email </button>
  </div>
  <div>
    <input type="text" bind:value={phoneToChange} style="min-width: 350px" />
    <button on:click={handleChangePhone}> Request Change Phone </button>
  </div>
  <div>
    <input type="text" bind:value={verificationCode} style="min-width: 350px" />
    <button on:click={handleVerifyCode}> Verify code </button>
  </div>
{/if}
