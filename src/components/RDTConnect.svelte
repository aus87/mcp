<script lang="ts">
  import { onMount } from 'svelte';
  import { rdt, account } from '$lib/stores/wallet';
  import { DataRequestBuilder, RadixDappToolkit, RadixNetwork } from '@radixdlt/radix-dapp-toolkit';
  import { PUBLIC_DAPP_DEFINITION_ADDRESS } from '$env/static/public';

  let rdtInstance: any;

  onMount(() => {
    rdtInstance = RadixDappToolkit({
      dAppDefinitionAddress: PUBLIC_DAPP_DEFINITION_ADDRESS,
      networkId: RadixNetwork.Stokenet,
      applicationName: 'MCP Portfolio Optimizer',
      applicationVersion: '1.0.0'
    });
    
    rdtInstance.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1));
    rdtInstance.buttonApi.setTheme('black');
    rdt.set(rdtInstance);
    
    rdtInstance.walletApi.walletData$.subscribe((walletData: any) => {
      if (walletData && walletData.accounts.length > 0) {
        account.set(walletData.accounts[0].address);
      }
    });
  });
</script>

<radix-connect-button />