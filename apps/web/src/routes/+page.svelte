<script lang="ts">
	import { onMount } from 'svelte'
	import { CredenzaSDK } from '@credenza3/web-sdk/src/main'
	import { OAuthExtension } from '@credenza3/web-sdk-oauth/src/main'

	const credenzaSDK = new CredenzaSDK({
		clientId: '123',
		env: 'local',
		extensions: [new OAuthExtension()]
	})
	
	onMount(async () => {
		await credenzaSDK.initialize()
		if (!credenzaSDK.isLoggedIn()) {
			credenzaSDK.oauth?.login({
				scope: 'profile email phone',
				redirectUrl: window.location.href,
			})
		}
		console.log(credenzaSDK)
	})
</script>

<h1>Web</h1>
