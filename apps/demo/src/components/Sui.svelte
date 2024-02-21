<script lang="ts">
  import type { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client'
  import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet'
  import { MIST_PER_SUI } from '@mysten/sui.js/utils'

  export let sdk: CredenzaSDK

  const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') })

  const handleGetSuiAddress = async () => {
    const address = await sdk.sui.getAddress()
    console.log('Sui address: ', address)
  }

  const handleSuiBalance = async () => {
    const balance = await suiClient.getBalance({
      owner: await sdk.sui.getAddress(),
    })
    const result = Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI)
    console.log('Sui balance: ', result)
  }

  const handleSuiFaucet = async () => {
    const result = await requestSuiFromFaucetV0({
      host: getFaucetHost('devnet'),
      recipient: await sdk.sui.getAddress(),
    })
    console.log('Sui faucet result', result)
  }

  const handleSuiSignMessage = () => {}
</script>

<br />
<div>
  Sui
  <br />
  <button on:click={handleGetSuiAddress}>Sui Address</button>
  <button on:click={handleSuiBalance}> Sui balance </button>
  <button on:click={handleSuiFaucet}> Sui Faucet </button>
  <button on:click={handleSuiSignMessage}> Sui tx </button>
</div>
