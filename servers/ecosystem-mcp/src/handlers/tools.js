import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { fileTools } from '../tools/file-tools.js';
import { systemTools } from '../tools/system-tools.js';

// Registro de todas as ferramentas disponíveis
const toolRegistry = new Map();

// Registrar ferramentas
function registerTools() {
  // Registrar ferramentas de arquivo
  fileTools.forEach(tool => {
    toolRegistry.set(tool.name, tool);
  });
  
  // Registrar ferramentas de sistema
  systemTools.forEach(tool => {
    toolRegistry.set(tool.name, tool);
  });
  
  logger.info(`Registered ${toolRegistry.size} tools`);
}

export async function setupToolHandlers(server) {
  // Registrar todas as ferramentas
  registerTools();
  
  // Handler para listar ferramentas
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = Array.from(toolRegistry.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
    
    logger.debug(`Listing ${tools.length} available tools`);
    return { tools };
  });
  
  // Handler para chamar ferramentas
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    logger.info(`Calling tool: ${name}`);
    logger.debug('Tool arguments:', args);
    
    const tool = toolRegistry.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    try {
      const result = await tool.handler(args);
      logger.debug(`Tool ${name} completed successfully`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      logger.error(`Tool ${name} failed:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });
}

