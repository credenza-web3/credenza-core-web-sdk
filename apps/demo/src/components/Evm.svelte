<script lang="ts">
  import type { CredenzaSDK } from '@credenza3/core-web/src/main'
  import { ethers } from '@credenza3/core-web-evm-ext/src/main'
  import { spicy, amoy, fuji } from '../evm-chain-config'

  export let sdk: CredenzaSDK
  export let chainConfig: typeof amoy | typeof spicy | typeof fuji

  const { isAddress } = ethers

  let transferTo = '0xc4F69E4fB203F832616f8CCb134ba25417455039'
  let messageToSign = ''

  const handleGetEvmAddress = async () => {
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
    const signer = await provider.getSigner()
    const result = await signer.getAddress()
    console.log('Evm address: ', result)
  }

  const handleSwitchChain = async () => {
    await sdk.evm.switchChain(chainConfig)
    console.log('New chain config: ', chainConfig)
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
  }

  const handleTransferNativeCurrencyEvm = async () => {
    const provider = await sdk.evm.getEthersProvider()
    console.log('ChainID:', (await provider.getNetwork()).chainId)
    const signer = await provider.getSigner()
    console.log('Current address: ', await signer.getAddress())
    if (!isAddress(transferTo.trim())) throw new Error('Invalid transfer address')
    console.log('To Address: ', transferTo)
    const tx = {
      to: transferTo.trim(),
      value: '1',
    }
    const result = await signer.sendTransaction(tx)
    console.log('Transaction response: ', result)
  }

  const handleSignMessage = async () => {
    const provider = await sdk.evm.getEthersProvider()
    const signer = await provider.getSigner()
    const sig = await signer.signMessage(messageToSign.trim())
    console.log('Signature: ', sig)
    console.log(await signer.getAddress(), ethers.verifyMessage(messageToSign, sig))
    messageToSign = ''
  }
</script>

<br />
<div>
  <div style="border: 2px solid #000; text-align: center">EVM</div>
  <div style="margin-top: 5px">
    <select bind:value={chainConfig} on:change={handleSwitchChain}>
      {#each [fuji, amoy, spicy] as chain}
        <option selected={chain.chainId === chainConfig.chainId} value={chain}>
          {chain.displayName} ({chain.chainId})
        </option>
      {/each}
    </select>
    <button on:click={handleGetEvmAddress}> Log Blockchain Info </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={transferTo} style="min-width: 350px" placeholder="0x..." />
    <button on:click={handleTransferNativeCurrencyEvm}> Transfer native currency EVM </button>
  </div>
  <div style="margin-top: 5px">
    <input type="text" bind:value={messageToSign} style="min-width: 350px" placeholder="" />
    <button on:click={handleSignMessage}> Sign Message </button>
  </div>
</div>
