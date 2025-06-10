// src/lib/mcp-test.ts
export async function testMCPConnection() {
  // Try different endpoints to see what works
  const endpoints = [
    'https://mcp.astrolescent.com/sse',
    'https://mcp.astrolescent.com/api/tools/apy',
    'https://mcp.astrolescent.com/tools/apy',
    'https://mcp.astrolescent.com/apy'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    
    try {
      // Try GET first
      const getResponse = await fetch(endpoint);
      console.log(`GET ${endpoint} - Status: ${getResponse.status}`);
      const getText = await getResponse.text();
      console.log(`GET Response:`, getText.substring(0, 200));
      
      // Try POST
      const postResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      console.log(`POST ${endpoint} - Status: ${postResponse.status}`);
      const postText = await postResponse.text();
      console.log(`POST Response:`, postText.substring(0, 200));
      
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
    }
  }
  
  // Try SSE connection
  try {
    console.log('Testing SSE connection...');
    const eventSource = new EventSource('https://mcp.astrolescent.com/sse');
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };
    
    eventSource.onmessage = (event) => {
      console.log('SSE message:', event.data);
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
    
    // Close after 5 seconds
    setTimeout(() => {
      eventSource.close();
      console.log('SSE connection closed');
    }, 5000);
    
  } catch (error) {
    console.error('SSE connection error:', error);
  }
}