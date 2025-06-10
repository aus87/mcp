<script lang="ts">
  import { onMount } from 'svelte';
  
  export let onMessage = (data: any) => {};
  
  let eventSource: EventSource | null = null;
  let isConnected = false;
  let messages: any[] = [];
  let rawLogs: string[] = [];
  
  export function connect() {
    console.log('Connecting to MCP SSE...');
    rawLogs = [...rawLogs, 'Attempting connection...'];
    
    eventSource = new EventSource('https://mcp.astrolescent.com/sse');
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      isConnected = true;
      messages = [...messages, { time: new Date().toLocaleTimeString(), text: 'Connected' }];
      rawLogs = [...rawLogs, 'Connection opened - waiting for data...'];
    };
    
    // Capture ANY data that comes through
    eventSource.addEventListener('message', (event) => {
      console.log('Raw SSE data received:', event);
      rawLogs = [...rawLogs, `Raw data: ${JSON.stringify(event.data)}`];
      messages = [...messages, { time: new Date().toLocaleTimeString(), text: `Data: ${event.data}` }];
      
      try {
        const parsed = JSON.parse(event.data);
        console.log('Parsed data:', parsed);
        onMessage(parsed);
      } catch (e) {
        console.log('Data is not JSON:', event.data);
        onMessage(event.data);
      }
    });
    
    // Listen for any custom event types
    const customEvents = ['apy', 'price', 'quote', 'hello', 'ping', 'init'];
    customEvents.forEach(eventType => {
      if (!eventSource) return; // Add null check
      
      eventSource.addEventListener(eventType, (event: any) => {
        console.log(`Custom event "${eventType}":`, event);
        rawLogs = [...rawLogs, `Event ${eventType}: ${event.data}`];
        messages = [...messages, { time: new Date().toLocaleTimeString(), text: `[${eventType}] ${event.data}` }];
      });
    });
    
    eventSource.onerror = (error: any) => {
      console.error('SSE error:', error);
      rawLogs = [...rawLogs, `Error: ${JSON.stringify(error)}`];
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        isConnected = false;
        messages = [...messages, { time: new Date().toLocaleTimeString(), text: 'Connection closed' }];
      }
    };
  }
  
  export function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      isConnected = false;
      messages = [...messages, { time: new Date().toLocaleTimeString(), text: 'Disconnected manually' }];
    }
  }
  
  // Since we can't POST, let's at least check what the SSE endpoint returns
  async function checkSSEDirectly() {
    try {
      const response = await fetch('https://mcp.astrolescent.com/sse', {
        headers: {
          'Accept': 'text/event-stream'
        }
      });
      const text = await response.text();
      console.log('Direct SSE fetch response:', text);
      rawLogs = [...rawLogs, `Direct fetch: ${text.substring(0, 200)}...`];
    } catch (e) {
      console.error('Direct fetch failed:', e);
    }
  }
</script>

<div class="card p-4">
  <h3 class="font-semibold mb-2">MCP Connection Debug</h3>
  
  <div class="flex gap-2 mb-4 flex-wrap">
    <button 
      class="btn btn-sm variant-filled-primary"
      on:click={connect}
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
      on:click={checkSSEDirectly}
    >
      Check Direct
    </button>
  </div>
  
  <div class="text-sm mb-2">
    Status: 
    <span class={isConnected ? 'text-success-400' : 'text-error-400'}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </span>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h4 class="text-sm font-semibold mb-2">Event Log:</h4>
      <div class="bg-surface-700 p-2 rounded text-xs max-h-48 overflow-y-auto font-mono">
        {#each messages as msg}
          <div class="mb-1">
            <span class="text-gray-500">[{msg.time}]</span> {msg.text}
          </div>
        {/each}
        {#if messages.length === 0}
          <span class="text-gray-500">No events yet...</span>
        {/if}
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-semibold mb-2">Raw Logs:</h4>
      <div class="bg-surface-700 p-2 rounded text-xs max-h-48 overflow-y-auto font-mono">
        {#each rawLogs as log}
          <div class="mb-1 text-gray-300">{log}</div>
        {/each}
      </div>
    </div>
  </div>
  
  <div class="mt-4 text-xs text-gray-400">
    <p>The MCP server uses CORS restrictions. For the hackathon, we can:</p>
    <ol class="list-decimal ml-4 mt-1">
      <li>Use mock data to demonstrate the concept</li>
      <li>Note that production would need a backend proxy</li>
      <li>Or use a different approach to get APY data</li>
    </ol>
  </div>
</div>