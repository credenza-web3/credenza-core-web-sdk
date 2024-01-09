<script lang="ts">
	import { onMount } from 'svelte'
	import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
	import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
	import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'
	import { MetamaskExtension } from '@credenza3/web-sdk-ext-metamask/src/main'

	const sdk = new CredenzaSDK({
		clientId: '659c216219f2618516768913',
		env: 'local',
		extensions: [new OAuthExtension(), new AccountExtension(), new MetamaskExtension()]
	})

	onMount(async () => {
		await sdk.initialize()
		// if (!sdk.isLoggedIn()) {
		// 	sdk.oauth.login({
		// 		scope: 'profile email phone',
		// 		redirectUrl: window.location.href
		// 	})
		// }
		//const info = await sdk.account.info()
		//console.log(sdk.metamask)
		//await sdk.metamask.login()
		//console.log(sdk.getAccessToken())
	})
</script>

<h1>Web</h1>
