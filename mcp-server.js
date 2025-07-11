#!/usr/bin/env node

// MCP Server entry point for Warp integration
const { MCPEcosystem } = require('./dist/index.js');

async function startMCPServer() {
  console.log('Starting MCP Ecosystem Server...');
  
  try {
    const ecosystem = new MCPEcosystem({
      configPath: process.env.MCP_CONFIG_PATH || './ecosystem.json',
      enableVireon: process.env.VIREON_INTEGRATION === 'true',
      enableGuardrive: process.env.GUARDRIVE_INTEGRATION === 'true',
      enableGiden: process.env.GIDEN_INTEGRATION === 'true'
    });

    // Initialize the ecosystem
    await ecosystem.initialize();
    
    // Start MCP server interface
    const server = ecosystem.createMCPServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down MCP Ecosystem Server...');
      await ecosystem.shutdown();
      process.exit(0);
    });

    console.log('MCP Ecosystem Server is running');
    
  } catch (error) {
    console.error('Failed to start MCP Ecosystem Server:', error);
    process.exit(1);
  }
}

// Start the server
startMCPServer();
