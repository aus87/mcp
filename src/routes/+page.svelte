<script lang="ts">
  import RDTConnect from '../components/RDTConnect.svelte';
  import MCPConnection from '../components/MCPConnection.svelte';
  import { account } from '$lib/stores/wallet';
  
  let mcpConnection: MCPConnection;
  
  function handleMCPMessage(data: any) {
    console.log('Main page received MCP data:', data);
    // Here we'll parse and handle the APY data when we figure out the format
  }
</script>

<div class="container mx-auto p-8 max-w-4xl">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">MCP Portfolio Optimizer</h1>
    <RDTConnect />
  </div>
  
  {#if $account}
    <div class="card p-4 mb-6">
      <p class="text-sm text-gray-400">Connected: {$account}</p>
    </div>
  {/if}
  
  <MCPConnection bind:this={mcpConnection} onMessage={handleMCPMessage} />
</div>