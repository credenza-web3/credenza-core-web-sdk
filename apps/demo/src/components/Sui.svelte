<script lang="ts">
  import type { CredenzaSDK } from '@credenza3/web-sdk/src/main'
  import { SuiExtension } from '@credenza3/web-sdk-ext-sui/src/main'
  import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet'
  import { MIST_PER_SUI } from '@mysten/sui.js/utils'
  import { TransactionBlock } from '@mysten/sui.js/transactions'

  export let sdk: CredenzaSDK
  export let suiNetworkName: (typeof SuiExtension.SUI_NETWORK)[keyof typeof SuiExtension.SUI_NETWORK]

  let messageToSign = 'test message'
  let transferToAddress = '0x656e8778c895f266be103088653e5437000cdb84399e40b43fa9a690c9a7da8f'

  const handleGetSuiAddress = async () => {
    const address = await sdk.sui.getAddress()
    console.log('Sui address:', address)
  }

  const handleSuiBalance = async () => {
    const client = sdk.sui.getSuiClient()
    const balance = await client.getBalance({
      owner: await sdk.sui.getAddress(),
    })
    const result = Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI)
    console.log('Sui balance:', result)
  }

  const handleSuiFaucet = async () => {
    const currentNetwork = sdk.sui.getNetworkName()
    if (currentNetwork === SuiExtension.SUI_NETWORK.MAINNET) throw new Error('faucet is not available for mainnet')

    const result = await requestSuiFromFaucetV0({
      host: getFaucetHost(currentNetwork),
      recipient: await sdk.sui.getAddress(),
    })
    console.log('Sui faucet result:', result)
  }

  const handleSuiSwitchNetwork = () => {
    sdk.sui.switchNetwork(suiNetworkName)
    console.log('Switched to: ', sdk.sui.getNetworkName())
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
    const [coin] = txb.splitCoins(txb.gas, [Math.round(1 * Number(MIST_PER_SUI))])
    txb.transferObjects([coin], transferToAddress)
    const result = await sdk.sui.signAndExecuteTransactionBlock(txb)
    console.log('Tx sent:', result)
  }
</script>

<br />
<div>
  <div style="border: 2px solid #000; text-align: center;">SUI</div>
  <div style="margin-top: 5px">
    <select bind:value={suiNetworkName} on:change={handleSuiSwitchNetwork}>
      {#each Object.values(SuiExtension.SUI_NETWORK) as network}
        <option selected={suiNetworkName === network} value={network}>
          {network}
        </option>
      {/each}
    </select>
    <button on:click={handleGetSuiAddress}>Sui Address</button>
    <button on:click={handleSuiBalance}> Sui balance </button>
    {#if suiNetworkName === SuiExtension.SUI_NETWORK.DEVNET}
      <button on:click={handleSuiFaucet}> Sui Faucet </button>
    {/if}
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
