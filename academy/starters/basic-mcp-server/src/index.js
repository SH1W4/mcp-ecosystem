// MCP Academy - Servidor Básico
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import chalk from 'chalk';

// Definição das ferramentas básicas
const tools = [
  {
    name: 'hello_world',
    description: 'Uma ferramenta simples para começar',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Seu nome'
        }
      },
      required: ['name']
    },
    handler: async ({ name }) => {
      return {
        message: `Olá, ${name}! Bem-vindo ao MCP Academy!`
      };
    }
  },
  {
    name: 'calculate',
    description: 'Calculadora simples',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'Operação matemática'
        },
        a: {
          type: 'number',
          description: 'Primeiro número'
        },
        b: {
          type: 'number',
          description: 'Segundo número'
        }
      },
      required: ['operation', 'a', 'b']
    },
    handler: async ({ operation, a, b }) => {
      let result;
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) throw new Error('Divisão por zero!');
          result = a / b;
          break;
      }
      return { result };
    }
  }
];

// Criar e configurar o servidor
const server = new Server(
  {
    name: 'mcp-academy-starter',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configurar handlers
server.setRequestHandler('list_tools', async () => {
  return { tools };
});

server.setRequestHandler('call_tool', async (request) => {
  const { name, arguments: args } = request.params;
  
  const tool = tools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Ferramenta não encontrada: ${name}`);
  }
  
  try {
    const result = await tool.handler(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Inicializar servidor
async function main() {
  console.log(chalk.cyan('=== MCP Academy - Servidor Básico ==='));
  console.log(chalk.yellow('Iniciando servidor...'));
  
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log(chalk.green('✓ Servidor iniciado com sucesso!'));
    console.log(chalk.gray('Aguardando comandos...'));
    
    // Mostrar ferramentas disponíveis
    console.log(chalk.cyan('\nFerramentas disponíveis:'));
    tools.forEach(tool => {
      console.log(chalk.yellow(`- ${tool.name}: ${tool.description}`));
    });
  } catch (error) {
    console.error(chalk.red('Erro ao iniciar servidor:'), error);
    process.exit(1);
  }
}

// Iniciar servidor
main();

