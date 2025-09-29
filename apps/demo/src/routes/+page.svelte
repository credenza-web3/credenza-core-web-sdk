<script lang="ts">
  import { sdk as farcasterSDK } from '@farcaster/miniapp-sdk'

  import { onMount } from 'svelte'
  import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
  import { amoy } from '../evm-chain-config'

  import { CredenzaSDK } from '@credenza3/core-web/src/main'
  import { OAuthExtension } from '@credenza3/core-web-oauth-ext/src/main'
  import { AccountExtension } from '@credenza3/core-web-account-ext/src/main'
  import { EvmExtension } from '@credenza3/core-web-evm-ext/src/main'
  import { SuiExtension } from '@credenza3/core-web-sui-ext/src/main'
  // import { ZkLoginExtension } from '@packages/sui-zk-login/src/main'

  import Sui from '../components/Sui.svelte'
  import Evm from '../components/Evm.svelte'
  import Account from '../components/Account.svelte'
  import type { TSuiNetwork } from '@packages/sui/src/main.types'

  let evmChainConfig = amoy
  let sdk: CredenzaSDK
  let suiNetworkName: TSuiNetwork

  let isLoggedIn = false

  const handleLogin = async () => (isLoggedIn = true)

  const handleOAuthLogin = async () => {
    sdk.oauth.loginWithRedirect({
      scope:
        'profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write blockchain.sui.zk',
      redirectUrl: window.location.href,
      responseType: 'token',
      // nonce: sdk.sui.zkLogin.generateZkNonce(),
      //forceEmail: 'test@test.com',
    })
  }

  const handleOAuthLoginCode = async () => {
    let clientServerUri = prompt('Enter the client server uri')

    //clientServerUri = 'http://localhost:3000/api'
    if (!clientServerUri) return
    sdk.oauth.loginWithRedirect({
      scope:
        'offline.access profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write blockchain.sui.zk',
      redirectUrl: window.location.href,
      responseType: 'code',
      clientServerUri,
      // nonce: sdk.sui.zkLogin.generateZkNonce(),
      //forceEmail: 'test@test.com',
    })
  }

  const handleOAuthLoginWithJwt = async () => {
    const validatorId = prompt(`Enter the validator id`)
    if (!validatorId) return
    const isIdToken = confirm('Are you using the ID token?')
    const token = prompt(`Enter the ${isIdToken ? 'ID' : 'access'} token`)
    if (!token) return

    const result = await sdk.oauth.loginWithJwt({
      scope:
        'openid profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write blockchain.sui.zk',
      validatorId,
      ...(isIdToken ? { idToken: token } : { accessToken: token }),
    })
    if (sdk.isLoggedIn()) await handleLogin()
    console.log('Jwt Login success:', result)
  }

  const handleMetamaskLogin = async () => {
    await sdk.evm.loginWithSignature()

    if (sdk.isLoggedIn()) await handleLogin()
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

  onMount(async () => {
    try {
      await farcasterSDK.actions.ready()
      console.log('Farcaster SDK is ready')
    } catch (e) {
      console.log('Farcaster SDK error')
      console.error(e)
    }

    const suiNetworkFromLS =
      typeof window !== 'undefined'
        ? (window.localStorage?.getItem(
            'CREDENZA_SUI_NETWORK',
          ) as (typeof SuiExtension.SUI_NETWORK)[keyof typeof SuiExtension.SUI_NETWORK])
        : null
    suiNetworkName = suiNetworkFromLS || SuiExtension.SUI_NETWORK.DEVNET
    console.log(window.ethereum)
    sdk = new CredenzaSDK({
      clientId: PUBLIC_CLIENT_ID,
      env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
      extensions: [
        new SuiExtension({ suiNetwork: suiNetworkName, extensions: [] }),
        new EvmExtension({
          chainConfig: evmChainConfig,
          provider: window.ethereum,
        }),
        new OAuthExtension(),
        new AccountExtension(),
      ],
    })
    await sdk.initialize()
    Object.assign(window, { credenzaSDK: sdk })
    if (!sdk.isLoggedIn()) return
    await handleLogin()
  })
</script>

{#if !isLoggedIn}
  <button on:click={handleOAuthLogin}> Login With OAuth2 </button>
  <button on:click={handleOAuthLoginCode}> Login With OAuth2 Code method</button>
  <button on:click={handleMetamaskLogin}> Login With Metamask </button>
  <button on:click={handleOAuthLoginWithJwt}> Login With JWT </button>
{:else}
  <div>
    <button on:click={handleLogout}> Logout </button>
    <button on:click={() => handleRevokeSession({ revokeAllSessions: true })}> Revoke session </button>
    <button on:click={() => handleRevokeSession({ revokeBrowserSession: true })}>
      Revoke browser session with redirect
    </button>
  </div>
  <Account {sdk} />
  <Evm {sdk} bind:chainConfig={evmChainConfig} />
  <Sui {sdk} bind:suiNetworkName />
{/if}
