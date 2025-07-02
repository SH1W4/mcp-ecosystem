# Quick Start Guide

Welcome to the MCP Ecosystem! This guide will help you get up and running with your first MCP server in just a few minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **TypeScript** knowledge (recommended)

## 🚀 Installation

### Option 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/NEO-SH1W4/cognition-mcp.git
cd cognition-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 2: Use npm Package (when published)

```bash
# Install globally
npm install -g @mcp-ecosystem/core

# Or locally in your project
npm install @mcp-ecosystem/core
```

## 🎯 Your First MCP Server

Let's create a simple "Hello World" MCP server:

### 1. Create a New Server

```typescript
// my-first-server.ts
import { MCPServer, Tool } from '@mcp-ecosystem/core';

class HelloWorldServer extends MCPServer {
  constructor() {
    super({
      name: 'hello-world-server',
      version: '1.0.0',
      description: 'My first MCP server'
    });

    // Register a simple tool
    this.registerTool(new HelloTool());
  }
}

class HelloTool implements Tool {
  name = 'say_hello';
  description = 'Says hello to a person';
  
  async execute(args: { name?: string }) {
    const name = args.name || 'World';
    return {
      success: true,
      data: `Hello, ${name}! Welcome to MCP Ecosystem!`
    };
  }
}

// Start the server
const server = new HelloWorldServer();
server.start().then(() => {
  console.log('🚀 Hello World MCP Server started!');
});
```

### 2. Run Your Server

```bash
# Compile and run
npx ts-node my-first-server.ts

# Or compile first
npx tsc my-first-server.ts
node my-first-server.js
```

### 3. Test Your Server

```bash
# Test using curl (if HTTP transport)
curl -X POST http://localhost:3000/tools/say_hello \
  -H "Content-Type: application/json" \
  -d '{"name": "Developer"}'

# Expected response:
# {
#   "success": true,
#   "data": "Hello, Developer! Welcome to MCP Ecosystem!"
# }
```

## 🔧 Basic Configuration

Create a configuration file for your server:

```yaml
# mcp-config.yaml
server:
  name: "my-mcp-server"
  port: 3000
  host: "localhost"
  
transport:
  type: "http"  # or "websocket", "stdio"
  
features:
  logging: true
  metrics: true
  
tools:
  - name: "say_hello"
    enabled: true
```

Load the configuration in your server:

```typescript
import { loadConfig } from '@mcp-ecosystem/core';

const config = loadConfig('./mcp-config.yaml');
const server = new HelloWorldServer(config);
```

## 🎪 Adding More Features

### Resources

Add file system resources to your server:

```typescript
import { Resource } from '@mcp-ecosystem/core';

class FileResource implements Resource {
  name = 'file://local';
  description = 'Local file system access';
  
  async read(uri: string) {
    // Implementation for reading files
    return { content: 'File content...' };
  }
}

// Register the resource
server.registerResource(new FileResource());
```

### Prompts

Create reusable prompts:

```typescript
import { Prompt } from '@mcp-ecosystem/core';

class CodeReviewPrompt implements Prompt {
  name = 'code_review';
  description = 'Performs code review analysis';
  
  async generate(args: { code: string }) {
    return {
      messages: [
        {
          role: 'system',
          content: 'You are a senior code reviewer...'
        },
        {
          role: 'user',
          content: `Please review this code:\n${args.code}`
        }
      ]
    };
  }
}

server.registerPrompt(new CodeReviewPrompt());
```

## 🔍 Using the Rules Engine

The MCP Ecosystem includes a powerful rules engine:

```typescript
import { RulesEngine, Rule } from '@mcp-ecosystem/rules';

// Create a rule
const rule: Rule = {
  name: 'auto_respond',
  description: 'Auto-respond to hello messages',
  conditions: [
    {
      field: 'message.content',
      operator: 'contains',
      value: 'hello'
    }
  ],
  actions: [
    {
      type: 'respond',
      template: 'Hello! How can I help you today?'
    }
  ]
};

// Add rule to engine
const rulesEngine = new RulesEngine();
rulesEngine.addRule(rule);

// Apply rules to messages
server.on('message', async (message) => {
  await rulesEngine.evaluate(message);
});
```

## 📊 Monitoring & Observability

Enable built-in monitoring:

```typescript
import { enableMetrics, enableLogging } from '@mcp-ecosystem/observability';

// Enable metrics collection
enableMetrics(server, {
  endpoint: '/metrics',
  prometheus: true
});

// Enable structured logging
enableLogging(server, {
  level: 'info',
  format: 'json',
  destinations: ['console', 'file']
});
```

## 🐳 Docker Deployment

Create a simple Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
# Build Docker image
docker build -t my-mcp-server .

# Run container
docker run -p 3000:3000 my-mcp-server
```

## 🎯 Next Steps

Now that you have a basic MCP server running, here's what to explore next:

### Learn More
- 📚 [Creating MCP Servers](./creating-servers.md) - Detailed server development guide
- 🏗️ [System Architecture](../architecture/overview.md) - Understand the platform architecture
- ⚡ [Rules Engine](./rules-engine.md) - Advanced automation capabilities

### Examples
- 🗂️ [File System Server](../examples/filesystem.md) - File operations
- 🗄️ [Database Integration](../examples/database.md) - Database connectivity
- 🤖 [AI Agent Orchestration](../examples/ai-orchestration.md) - Multi-agent coordination

### Advanced Topics
- 🔧 [Performance Tuning](./performance-tuning.md) - Optimize your servers
- 🔐 [Security Best Practices](../architecture/security.md) - Secure your deployment
- 📊 [Monitoring Setup](../deployment/monitoring.md) - Production monitoring

## ❓ Need Help?

- 📖 Check the [full documentation](../index.md)
- 🐛 Report issues on [GitHub](https://github.com/NEO-SH1W4/cognition-mcp/issues)
- 💬 Join discussions in our [community forum](https://github.com/NEO-SH1W4/cognition-mcp/discussions)
- 🌐 Visit the [live demo](https://neo-sh1w4.github.io/cognition-mcp/)

---

**🎉 Congratulations!** You've successfully created your first MCP server. Welcome to the MCP Ecosystem community!

