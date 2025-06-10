<!-- src/components/PortfolioOptimizerDemo.svelte -->
<script lang="ts">
  import { account, rdt } from '$lib/stores/wallet';
  
  // Simulated APY data (in production, AI agent would get this from MCP)
  const mockAPYData = {
    staking: [
      { validator: "CaviarNine", apy: 9.5 },
      { validator: "RadixPool", apy: 9.2 }
    ],
    liquidity: [
      { pool: "ASTRL/XRD", apy: 25.5 },
      { pool: "DFP2/XRD", apy: 18.2 }
    ]
  };
  
  let xrdAmount = 100;
  let userPrompt = "I have 100 XRD, should I stake or provide liquidity?";
  let aiResponse = "";
  let recommendation: 'stake' | 'lp' | null = null;
  
  function simulateAIAgent() {
    // This simulates what an AI agent would do with MCP data
    const bestStaking = mockAPYData.staking[0];
    const bestLP = mockAPYData.liquidity[0];
    
    if (bestLP.apy > bestStaking.apy) {
      recommendation = 'lp';
      aiResponse = `Based on current APY data from MCP:
      
📊 Analysis:
- Best staking option: ${bestStaking.validator} at ${bestStaking.apy}% APY
- Best LP option: ${bestLP.pool} at ${bestLP.apy}% APY

💡 Recommendation: Provide liquidity to ${bestLP.pool}
- You'll earn ${bestLP.apy}% APY (${bestLP.apy - bestStaking.apy}% more than staking)
- On ${xrdAmount} XRD, that's ~${(xrdAmount * bestLP.apy / 100).toFixed(2)} XRD per year

⚠️ Note: LP has impermanent loss risk, while staking is safer.`;
    } else {
      recommendation = 'stake';
      aiResponse = `Based on current APY data from MCP:
      
📊 Analysis:
- Best staking option: ${bestStaking.validator} at ${bestStaking.apy}% APY
- Best LP option: ${bestLP.pool} at ${bestLP.apy}% APY

💡 Recommendation: Stake with ${bestStaking.validator}
- Safer option with ${bestStaking.apy}% APY
- No impermanent loss risk
- On ${xrdAmount} XRD, that's ~${(xrdAmount * bestStaking.apy / 100).toFixed(2)} XRD per year`;
    }
  }
  
  async function executeRecommendation() {
    if (!$rdt || !$account) return;
    
    // Generate the appropriate transaction
    const manifest = recommendation === 'stake' 
      ? generateStakingManifest()
      : generateLPManifest();
      
    console.log('Executing:', manifest);
    
    // Execute transaction
    const result = await $rdt.walletApi.sendTransaction({
      transactionManifest: manifest
    });
    
    if (result.isOk()) {
      console.log('Transaction submitted:', result.value.transactionIntentHash);
    }
  }
  
  function generateStakingManifest() {
    // Example validator address
    const validatorAddress = "validator_rdx1sd5368vrdckmate4pqs4jz3l8qf725stgxqvuukf7msqfwvwqrx7df";
    
    return `
CALL_METHOD
    Address("${$account}")
    "withdraw"
    Address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc")
    Decimal("${xrdAmount}")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc")
    Bucket("xrd_bucket")
;
CALL_METHOD
    Address("${validatorAddress}")
    "stake"
    Bucket("xrd_bucket")
;
CALL_METHOD
    Address("${$account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;`;
  }
  
  function generateLPManifest() {
    // Simplified - would need actual pool addresses and swap logic
    return `# LP provision would require:
# 1. Swap half XRD for the other token
# 2. Add liquidity to the pool
# This is a placeholder for demonstration`;
  }
</script>

<div class="card p-6">
  <h2 class="text-2xl font-bold mb-6">AI Agent Portfolio Optimizer</h2>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- User Input Side -->
    <div>
      <h3 class="font-semibold mb-4">Ask the AI Agent</h3>
      
      <div class="mb-4">
        <label class="label">
          <span>Your prompt to the AI:</span>
          <textarea
            bind:value={userPrompt}
            class="textarea"
            rows="3"
          />
        </label>
      </div>
      
      <div class="mb-4">
        <label class="label">
          <span>Amount (XRD)</span>
          <input
            type="number"
            bind:value={xrdAmount}
            class="input"
            min="10"
          />
        </label>
      </div>
      
      <button
        class="btn variant-filled-primary w-full"
        on:click={simulateAIAgent}
      >
        Get AI Recommendation
      </button>
    </div>
    
    <!-- AI Response Side -->
    <div>
      <h3 class="font-semibold mb-4">AI Agent Response</h3>
      
      {#if aiResponse}
        <div class="bg-surface-700 p-4 rounded-lg">
          <pre class="whitespace-pre-wrap text-sm">{aiResponse}</pre>
        </div>
        
        {#if recommendation && $account}
          <button
            class="btn variant-filled-success w-full mt-4"
            on:click={executeRecommendation}
          >
            Execute {recommendation === 'stake' ? 'Staking' : 'LP'} Transaction
          </button>
        {/if}
      {:else}
        <div class="bg-surface-700 p-4 rounded-lg text-gray-400">
          AI response will appear here...
        </div>
      {/if}
    </div>
  </div>
  
  <div class="mt-6 p-4 bg-surface-700 rounded">
    <h4 class="font-semibold mb-2">How this works with MCP:</h4>
    <ol class="list-decimal list-inside text-sm text-gray-300 space-y-1">
      <li>AI agents (like Claude) connect to Astrolescent MCP server</li>
      <li>User asks: "Should I stake or LP my XRD?"</li>
      <li>AI calls MCP tools (apy, price, quote) to get real-time data</li>
      <li>AI analyzes the data and provides recommendation</li>
      <li>AI can generate transaction manifests for execution</li>
    </ol>
  </div>
</div>