<script lang="ts">
  import { sdk } from '@farcaster/miniapp-sdk'
  import { onMount } from 'svelte'

  //let isReady = false

  onMount(async () => {
    try {
      await sdk.actions.ready()
      //isReady = true
      console.log('Farcaster SDK is ready')
    } catch (e) {
      console.log('Farcaster SDK error')
      console.error(e)
    }
  })
</script>

<slot />
