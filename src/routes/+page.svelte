<!-- src/routes/+page.svelte -->
<script lang="ts">
  import RDTConnect from '../components/RDTConnect.svelte';
  import PortfolioOptimizerRTM from '../components/portfolioOptimizerRTM.svelte';
  import { account } from '$lib/stores/wallet';
</script>

<div class="container mx-auto p-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">MCP Portfolio Optimizer</h1>
    <RDTConnect />
  </div>
  
  <PortfolioOptimizerRTM />
</div>