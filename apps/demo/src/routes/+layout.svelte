<script lang="ts">
  import { sdk } from '@farcaster/miniapp-sdk'
  import { onMount } from 'svelte'
  interface IProps {
    children?: import('svelte').Snippet
  }

  let { children }: IProps = $props()

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

{@render children?.()}
