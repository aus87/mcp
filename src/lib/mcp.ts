// src/lib/mcp.ts
export class MCPClient {
  private baseUrl = 'https://mcp.astrolescent.com/sse';
  
  async callTool(toolName: string, args: any) {
    try {
      // MCP uses Server-Sent Events, but we can try a direct HTTP call first
      const response = await fetch(`https://mcp.astrolescent.com/api/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('MCP call failed:', error);
      throw error;
    }
  }
  
  async getAPY() {
    return this.callTool('apy', {});
  }
  
  async getPrice(token: string) {
    return this.callTool('price', { token });
  }
  
  async getQuote(operation: string, sellToken: string, buyToken: string, amount: string, accountAddress: string) {
    return this.callTool('quote', {
      operation,
      sell_token: sellToken,
      buy_token: buyToken,
      amount,
      account_address: accountAddress
    });
  }
}