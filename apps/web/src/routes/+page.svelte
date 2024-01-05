<script lang="ts">
	import { onMount } from 'svelte'
	import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
	import { OAuthExtension } from '@credenza3/web-sdk-ext-oauth/src/main'
	import { AccountExtension } from '@credenza3/web-sdk-ext-account/src/main'

	const sdk = new CredenzaSDK({
		clientId: '123',
		env: 'local',
		extensions: [new OAuthExtension(), new AccountExtension()]
	})
	
	onMount(async () => {
		await sdk.initialize()
		if (!sdk.isLoggedIn()) {
			sdk.oauth?.login({
				scope: 'profile email phone',
				redirectUrl: window.location.href,
			})
		}
		sdk.account.info()
	})
</script>

<h1>Web</h1>
