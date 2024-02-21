<script lang="ts">
  import type { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client'
  import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet'
  import { MIST_PER_SUI } from '@mysten/sui.js/utils'
  import { TransactionBlock } from '@mysten/sui.js/transactions'

  export let sdk: CredenzaSDK

  const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') })

  let messageToSign = 'test message'
  let transferToAddress = '0xfd9290417f7810f62a93cec8b57b5b6c9e16ddc11627a4df88b5d3db68851baf'

  const handleGetSuiAddress = async () => {
    const address = await sdk.sui.getAddress()
    console.log('Sui address:', address)
  }

  const handleSuiBalance = async () => {
    const balance = await suiClient.getBalance({
      owner: await sdk.sui.getAddress(),
    })
    const result = Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI)
    console.log('Sui balance:', result)
  }

  const handleSuiFaucet = async () => {
    const result = await requestSuiFromFaucetV0({
      host: getFaucetHost('devnet'),
      recipient: await sdk.sui.getAddress(),
    })
    console.log('Sui faucet result', result)
  }

  const handleSuiSignMessage = async () => {
    if (!messageToSign) return
    console.log('Sui signing:', messageToSign)
    const { signature } = await sdk.sui.signPersonalMessage(messageToSign)
    console.log('Sui message signature:', signature)
  }

  const handleSuiTransfer = async () => {
    if (!transferToAddress) return

    const txb = new TransactionBlock()
    const [coin] = txb.splitCoins(txb.gas, [10])
    txb.transferObjects([coin], transferToAddress)
    const result = await sdk.sui.signAndExecuteTransactionBlock(txb)
    console.log('Tx sent:', result)
  }
</script>

<br />
<div>
  <div style="border: 1px solid #000; text-align: center;">SUI</div>
  <div style="margin-top: 5px">
    <button on:click={handleGetSuiAddress}>Sui Address</button>
    <button on:click={handleSuiBalance}> Sui balance </button>
    <button on:click={handleSuiFaucet}> Sui Faucet </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={messageToSign} style="min-width: 500px" placeholder="" />
    <button on:click={handleSuiSignMessage}> Sui Sign Message </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={transferToAddress} style="min-width: 500px" placeholder="" />
    <button on:click={handleSuiTransfer}> Sui Transfer </button>
  </div>
</div>
