<script lang="ts">
	import { onMount } from 'svelte'
	import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
	import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
	import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
	import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
	import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'
	import { EvmExtension } from '@credenza3/web-sdk-ext-evm/src/main'

	const sdk = new CredenzaSDK({
		clientId: PUBLIC_CLIENT_ID,
		env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
		extensions: [new OAuthExtension(), new AccountExtension(), new MetamaskExtension(), new EvmExtension()]
	})

	let isLoggedIn = false

	const handleOAuthLogin = () => {
		sdk.oauth.login({
			scope: 'profile email phone blockchain.evm.write blockchain.evm',
			redirectUrl: window.location.href
		})
	}

	const handleMetamaskLogin = async () => {
		await sdk.metamask.login()
		isLoggedIn = true
	}
	
	const handleLogout = () => {
		sdk.logout()
		isLoggedIn = false
	}

	onMount(async () => {
		await sdk.initialize()
		if (sdk.isLoggedIn()) isLoggedIn = true

		console.log(await sdk.evm.provider.request({method: 'eth_requestAccounts'}))
		console.log(await sdk.evm.provider.request({method: 'eth_chainId'}))
	})
</script>

{#if !isLoggedIn}
  <button on:click={handleOAuthLogin}>
	  Login With OAuth2
  </button>
  <button on:click={handleMetamaskLogin}>
	  Login With Metamask
  </button>
{:else}
  <button on:click={handleLogout}>
	  Logout
  </button>
{/if}

