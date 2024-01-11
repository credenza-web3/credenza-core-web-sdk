<script lang="ts">
	import { onMount } from 'svelte'
	import { PUBLIC_ENV, PUBLIC_CLIENT_ID } from '$env/static/public'
	import { BrowserProvider } from 'ethers'
	import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
	import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
	import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
	import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'
	import { EvmExtension } from '@credenza3/web-sdk-ext-evm/src/main'

	const sdk = new CredenzaSDK({
		clientId: PUBLIC_CLIENT_ID,
		env: PUBLIC_ENV as (typeof CredenzaSDK.SDK_ENV)[keyof typeof CredenzaSDK.SDK_ENV],
		extensions: [
			new EvmExtension({
			  chainId: '0x15b32',
			  rpcUrl: 'https://chiliz-spicy.publicnode.com'
		  }),
			new OAuthExtension(), 
			new AccountExtension(), 
			new MetamaskExtension(), 
			]
	})

	let isLoggedIn = false
	let provider:BrowserProvider

	const handleLogin = async () => {
		isLoggedIn = true
		const pr = await sdk.evm.getProvider()
		provider = new BrowserProvider(pr)
		console.log('ChainID:', (await provider.getNetwork()).chainId)
	}

	const handleOAuthLogin = () => {
		sdk.oauth.login({
			scope: 'profile email phone blockchain.evm.write blockchain.evm',
			redirectUrl: window.location.href
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

	onMount(async () => {
		await sdk.initialize()
		if (sdk.isLoggedIn()) await handleLogin()

		// const signer = await provider.getSigner()
		// const feeData = await provider.getFeeData()
		// const tx = {
		// 	to: "0xc4F69E4fB203F832616f8CCb134ba25417455039",
    //   value: '1',
		// 	gasPrice: feeData.gasPrice,
		// }
		// const t = await signer.sendTransaction(tx)
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

