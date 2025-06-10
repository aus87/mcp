<script lang="ts">
  import { account, rdt } from '$lib/stores/wallet';
  
  // CORRECT MAINNET ADDRESSES
  const ADDRESSES = {
    XRD: "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
    ASTRL: "resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3",
    DEFIPLAZA_POOL: "component_rdx1cqy7sq3mxj2whhlqlryy05hzs96m0ajnv23e7j7vanmdwwlccnmz68",
    VALIDATOR: "validator_rdx1sd5368vrdckmate4pqs4jz3l8qf725stgxqvuukf7msqfwvwqrx7df"
  };
  
  // APY inputs
  let astrlStakingAPY = 7.2;
  let validatorAPY = 7.6; 
  let defiPlazaAPY = 10.0;
  
  // User inputs
  let xrdAmount = 100;
  let xrdPrice = 0.0065;
  
  $: xrdTokens = Math.floor(xrdAmount / xrdPrice);
  
  $: bestOption = (() => {
    const options = [
      { name: 'ASTRL Staking', apy: astrlStakingAPY, type: 'astrl-stake' },
      { name: 'Validator Staking', apy: validatorAPY, type: 'validator' },
      { name: 'DefiPlaza ASTRL/XRD LP', apy: defiPlazaAPY, type: 'defiplaza' }
    ];
    
    return options.reduce((best, current) => 
      current.apy > best.apy ? current : best
    );
  })();
  
function generateRTM() {
    if (!$account) return '';
    
    switch (bestOption.type) {
case 'validator':
  return `CALL_METHOD
    Address("${$account}")
    "withdraw"
    Address("${ADDRESSES.XRD}")
    Decimal("${xrdTokens}")
;
TAKE_ALL_FROM_WORKTOP
    Address("${ADDRESSES.XRD}")
    Bucket("bucket1")
;
CALL_METHOD
    Address("validator_rdx1sw54cuswwzlcgw2zh3ax93pddnsm78qwwhmtvz650q84yyckzkh7nk")
    "stake"
    Bucket("bucket1")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1tkg6ndw69mwje4lfu93zk3vcxyjvnl3y07d2hxx4vxvq2et835jeah")
    Bucket("bucketLSU")
;
CALL_METHOD
    Address("${$account}")
    "deposit"
    Bucket("bucketLSU")
;`;

case 'defiplaza': // This is really OciSimple LP now
  const halfXrd = Math.floor(xrdTokens / 2);
  return `CALL_METHOD
    Address("${$account}")
    "withdraw"
    Address("${ADDRESSES.XRD}")
    Decimal("${xrdTokens}")
;
TAKE_FROM_WORKTOP
    Address("${ADDRESSES.XRD}")
    Decimal("${halfXrd}")
    Bucket("xrd_to_swap")
;
CALL_METHOD
    Address("component_rdx1cq7tc2pgyzawwjp4qf7ddfeq36scmkghmgl7ww4zp9tqpjuc452mp7")
    "swap"
    Bucket("xrd_to_swap")
;
TAKE_ALL_FROM_WORKTOP
    Address("${ADDRESSES.ASTRL}")
    Bucket("astrl_bucket")
;
TAKE_ALL_FROM_WORKTOP
    Address("${ADDRESSES.XRD}")
    Bucket("xrd_bucket")
;
CALL_METHOD
    Address("component_rdx1cq7tc2pgyzawwjp4qf7ddfeq36scmkghmgl7ww4zp9tqpjuc452mp7")
    "add_liquidity"
    Bucket("astrl_bucket")
    Bucket("xrd_bucket")
;
CALL_METHOD
    Address("${$account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;`;

      case 'astrl-stake':
        // First swap XRD to ASTRL, then stake
        return `CALL_METHOD
    Address("${$account}")
    "withdraw"
    Address("${ADDRESSES.XRD}")
    Decimal("${xrdTokens}")
;
TAKE_ALL_FROM_WORKTOP
    Address("${ADDRESSES.XRD}")
    Bucket("xrd_to_swap")
;
CALL_METHOD
    Address("component_rdx1cq7tc2pgyzawwjp4qf7ddfeq36scmkghmgl7ww4zp9tqpjuc452mp7")
    "swap"
    Bucket("xrd_to_swap")
;
TAKE_ALL_FROM_WORKTOP
    Address("${ADDRESSES.ASTRL}")
    Bucket("astrl_bucket")
;
CALL_METHOD
    Address("component_rdx1cz6ed6wksa2u4a3da5qfeg4tg453tczexulcf0z7vs885rkr6r6363")
    "add_stake"
    Bucket("astrl_bucket")
;
CALL_METHOD
    Address("${$account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;`;

      default:
        return '';
    }
  }
  
  async function executeTransaction() {
    if (!$rdt || !$account) return;
    
    const transactionManifest = generateRTM();
    
    console.log('=== EXECUTING TRANSACTION ===');
    console.log('Account:', $account);
    console.log('Network: MAINNET');
    console.log('Addresses being used:', ADDRESSES);
    console.log('Manifest:');
    console.log(transactionManifest);
    console.log('=== END MANIFEST ===');
    
    try {
      const result = await $rdt.walletApi.sendTransaction({
        transactionManifest
      });
      
      console.log('Transaction result:', result);
      
      if (result.isErr()) {
        console.error('❌ Transaction failed with error:', result.error);
        console.error('Full error object:', result);
        throw new Error(result.error);
      }
      
      console.log('✅ Transaction submitted successfully!');
      console.log('Transaction Hash:', result.value.transactionIntentHash);
      alert('Transaction submitted! Hash: ' + result.value.transactionIntentHash);
      
    } catch (error) {
      console.error('❌ Exception during transaction:', error);
      alert('Transaction failed: ' + error);
    }
  }
</script>

<div class="max-w-4xl mx-auto p-6">
  <div class="card p-6 mb-6">
    <h2 class="text-2xl font-bold mb-6">Portfolio Optimizer - RTM Generator</h2>
    <p class="text-sm text-gray-400 mb-6">
      Input APY values from Claude Desktop's MCP query below
    </p>
    
    <!-- APY Inputs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="label">
          <span>ASTRL Staking APY (%)</span>
          <input
            type="number"
            bind:value={astrlStakingAPY}
            step="0.1"
            class="input"
          />
        </label>
      </div>
      
      <div>
        <label class="label">
          <span>Validator APY (%)</span>
          <input
            type="number"
            bind:value={validatorAPY}
            step="0.1"
            class="input"
          />
        </label>
      </div>
      
      <div>
        <label class="label">
          <span>DefiPlaza LP APY (%)</span>
          <input
            type="number"
            bind:value={defiPlazaAPY}
            step="0.1"
            class="input"
          />
        </label>
      </div>
    </div>
    
    <!-- Investment Amount -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="label">
          <span>Investment Amount (USD)</span>
          <input
            type="number"
            bind:value={xrdAmount}
            step="10"
            class="input"
          />
        </label>
      </div>
      
      <div>
        <label class="label">
          <span>XRD Price (USD)</span>
          <input
            type="number"
            bind:value={xrdPrice}
            step="0.0001"
            class="input"
          />
        </label>
      </div>
    </div>
    
    <!-- Results -->
    <div class="bg-surface-700 p-4 rounded-lg mb-6">
      <h3 class="font-semibold mb-4">Analysis Results</h3>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-sm text-gray-400">XRD Tokens:</p>
          <p class="text-2xl font-bold">{xrdTokens.toLocaleString()}</p>
        </div>
        
        <div>
          <p class="text-sm text-gray-400">Best Option:</p>
          <p class="text-2xl font-bold text-success-400">{bestOption.name}</p>
          <p class="text-sm">{bestOption.apy}% APY</p>
        </div>
      </div>
      
      <div class="mt-4">
        <p class="text-sm text-gray-400 mb-2">Expected Annual Return:</p>
        <p class="text-lg">
          ${(xrdAmount * bestOption.apy / 100).toFixed(2)} 
          <span class="text-sm text-gray-400">
            ({(xrdTokens * bestOption.apy / 100).toFixed(0)} XRD)
          </span>
        </p>
      </div>
    </div>
    
    <!-- RTM Preview -->
    <div class="mb-6">
      <h3 class="font-semibold mb-2">Generated Transaction Manifest</h3>
      <div class="bg-surface-800 p-4 rounded-lg overflow-x-auto">
        <pre class="text-xs text-gray-300 whitespace-pre">{generateRTM()}</pre>
      </div>
    </div>
    
    <!-- Execute Button -->
    {#if $account}
      <button
        class="btn variant-filled-success w-full"
        on:click={executeTransaction}
      >
        Execute {bestOption.name} Strategy
      </button>
    {:else}
      <p class="text-center text-warning-400">Connect wallet to execute transactions</p>
    {/if}
  </div>
  
  <!-- Instructions -->
  <div class="card p-6">
    <h3 class="font-semibold mb-4">How to Use</h3>
    <ol class="list-decimal list-inside space-y-2 text-sm text-gray-300">
      <li>Ask Claude Desktop: "Use Astrolescent to check current APY rates"</li>
      <li>Input the three APY values Claude provides into the fields above</li>
      <li>Enter your investment amount in USD and current XRD price</li>
      <li>The system will automatically recommend the highest APY option</li>
      <li>Review the generated transaction manifest</li>
      <li>Click "Execute" to submit the transaction to your wallet</li>
    </ol>
  </div>
</div>