<!-- src/components/MCPConnection.svelte -->
<script lang="ts">
  export let onAPYData = (data: any) => {};
  
  let eventSource: EventSource | null = null;
  let messages: any[] = [];
  let isConnected = false;
  
  function connectToMCP() {
    console.log('Connecting to MCP SSE...');
    
    eventSource = new EventSource('https://mcp.astrolescent.com/sse');
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      isConnected = true;
      
      // Try sending an initialization message
      // MCP might expect a specific handshake
      console.log('Sending init message...');
    };
    
    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event);
      messages = [...messages, {
        time: new Date().toLocaleTimeString(),
        data: event.data,
        type: 'message'
      }];
      
      try {
        const parsed = JSON.parse(event.data);
        console.log('Parsed:', parsed);
        
        // Check if this is APY data
        if (parsed.method === 'tools/apy' || parsed.apy || parsed.result?.apy) {
          onAPYData(parsed);
        }
      } catch (e) {
        console.log('Not JSON:', event.data);
      }
    };
    
    // Listen for specific event types that MCP might use
    ['tools/apy', 'tools/price', 'tools/quote', 'result', 'notification'].forEach(eventType => {
      eventSource?.addEventListener(eventType, (event: any) => {
        console.log(`Event type "${eventType}":`, event.data);
        messages = [...messages, {
          time: new Date().toLocaleTimeString(),
          data: event.data,
          type: eventType
        }];
      });
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };
  }
  
  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      isConnected = false;
    }
  }
  
  // Since direct HTTP doesn't work, let's document how this would work with an LLM
  function showLLMExample() {
    const example = `
// How an LLM would use this MCP server:

// 1. LLM connects to MCP server
const mcp = connectToMCP('https://mcp.astrolescent.com/sse');

// 2. LLM calls the APY tool
const apyData = await mcp.callTool('apy', {});

// 3. LLM analyzes the data
const bestStakingAPY = apyData.staking[0].apy;
const bestLPAPY = apyData.liquidity[0].apy;

// 4. LLM makes recommendation
if (bestLPAPY > bestStakingAPY) {
  return "I recommend providing liquidity for " + bestLPAPY + "% APY";
} else {
  return "I recommend staking for " + bestStakingAPY + "% APY";
}
    `;
    
    messages = [...messages, {
      time: new Date().toLocaleTimeString(),
      data: example,
      type: 'example'
    }];
  }
</script>

<div class="card p-4">
  <h3 class="font-semibold mb-2">MCP Integration for AI Agents</h3>
  
  <div class="text-xs text-info-400 mb-4">
    ℹ️ MCP servers are designed for AI agents. This demo shows how an AI would use the data.
  </div>
  
  <div class="flex gap-2 mb-4 flex-wrap">
    <button 
      class="btn btn-sm variant-filled-primary"
      on:click={connectToMCP}
      disabled={isConnected}
    >
      Connect SSE
    </button>
    
    <button 
      class="btn btn-sm variant-filled-error"
      on:click={disconnect}
      disabled={!isConnected}
    >
      Disconnect
    </button>
    
    <button 
      class="btn btn-sm variant-filled-secondary"
      on:click={showLLMExample}
    >
      Show LLM Usage
    </button>
  </div>
  
  <div>
    <h4 class="text-sm font-semibold mb-2">Event Log:</h4>
    <div class="bg-surface-700 p-2 rounded text-xs max-h-64 overflow-y-auto">
      {#each messages as msg}
        <div class="mb-2 p-2 bg-surface-800 rounded">
          <div class="text-gray-400 mb-1">[{msg.time}] Type: {msg.type}</div>
          <pre class="text-gray-300 whitespace-pre-wrap">{msg.data}</pre>
        </div>
      {/each}
    </div>
  </div>
</div>