<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
  import { amoy, spicy } from '../evm-chain-config'

  import { CredenzaSDK } from '@credenza3/core-web/src/main'
  import { OAuthExtension } from '@credenza3/core-web-oauth-ext/src/main'
  import { AccountExtension } from '@credenza3/core-web-account-ext/src/main'
  import { MetamaskExtension } from '@credenza3/core-web-evm-metamask-ext/src/main'
  import { WalletConnectExtension } from '@credenza3/core-web-evm-walletconnect-ext/src/main'
  import { EvmExtension } from '@credenza3/core-web-evm-ext/src/main'
  import { SuiExtension } from '@credenza3/core-web-sui-ext/src/main'
  import { ZkLoginExtension } from '@packages/sui-zk-login/src/main'

  import Sui from '../components/Sui.svelte'
  import Evm from '../components/Evm.svelte'
  import Account from '../components/Account.svelte'

  let evmChainConfig = spicy
  let suiNetworkName = SuiExtension.SUI_NETWORK.DEVNET

  const sdk = new CredenzaSDK({
    clientId: PUBLIC_CLIENT_ID,
    env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
    extensions: [
      new SuiExtension({ suiNetwork: suiNetworkName, extensions: [new ZkLoginExtension()] }),
      new EvmExtension({
        chainConfig: evmChainConfig,
        extensions: [
          new MetamaskExtension(),
          new WalletConnectExtension({
            projectId: 'e98bfa148f5b128914133e707b993b1d',
            chains: [amoy, spicy],
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
        'profile profile.write email phone blockchain.evm.write blockchain.evm blockchain.sui blockchain.sui.write blockchain.sui.zk',
      redirectUrl: window.location.href,
      nonce: sdk.sui.zkLogin.generateZkNonce(),
      //type: OAuthExtension.LOGIN_TYPE.PASSWORDLESS,
      //passwordlessType: OAuthExtension.PASSWORDLESS_LOGIN_TYPE.EMAIL,
      //forceEmail: 'test@test.com',
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
  <Account {sdk} />
  <Evm {sdk} bind:chainConfig={evmChainConfig} />
  <Sui {sdk} bind:suiNetworkName />
{/if}
