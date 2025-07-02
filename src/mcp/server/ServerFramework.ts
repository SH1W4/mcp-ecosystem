/**
 * MCP Server Framework - Advanced Implementation
 * Provides server registry, discovery, protocol handling, and resource management
 */

import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer, Server } from 'http';
import { logger } from '@/shared/logger';
import { config } from '@/shared/config';

// MCP Protocol Types
export interface MCPMessage {
  id: string;
  method: string;
  params?: Record<string, any>;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

export interface ServerConfig {
  port: number;
  host: string;
  maxConnections: number;
  timeout: number;
  enableMetrics: boolean;
}

export class MCPServerFramework extends EventEmitter {
  private httpServer: Server;
  private wsServer: WebSocketServer;
  private connections = new Map<string, WebSocket>();
  private resources = new Map<string, MCPResource>();
  private tools = new Map<string, MCPTool>();
  private config: ServerConfig;
  private isRunning = false;

  constructor(serverConfig: ServerConfig) {
    super();
    this.config = serverConfig;
    this.httpServer = createServer();
    this.wsServer = new WebSocketServer({
      server: this.httpServer,
      maxPayload: 1024 * 1024, // 1MB max payload
    });

    this.setupWebSocketServer();
    this.setupHealthEndpoint();
  }

  /**
   * A.1 - Server Registry & Discovery
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer.listen(this.config.port, this.config.host, () => {
          this.isRunning = true;
          logger.info(`MCP Server started on ${this.config.host}:${this.config.port}`);
          this.emit('server:started', {
            host: this.config.host,
            port: this.config.port,
          });
          resolve();
        });

        this.httpServer.on('error', error => {
          logger.error('Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise(resolve => {
      this.isRunning = false;

      // Close all WebSocket connections
      this.connections.forEach((ws, id) => {
        ws.close(1000, 'Server shutting down');
        this.connections.delete(id);
      });

      // Close servers
      this.wsServer.close(() => {
        this.httpServer.close(() => {
          logger.info('MCP Server stopped');
          this.emit('server:stopped');
          resolve();
        });
      });
    });
  }

  /**
   * A.2 - Protocol Message Handling
   */
  private setupWebSocketServer(): void {
    this.wsServer.on('connection', (ws: WebSocket, request) => {
      const connectionId = this.generateConnectionId();
      this.connections.set(connectionId, ws);

      logger.info(`New MCP connection: ${connectionId}`, {
        ip: request.socket.remoteAddress,
        userAgent: request.headers['user-agent'],
      });

      // Connection limits
      if (this.connections.size > this.config.maxConnections) {
        ws.close(1013, 'Server overloaded');
        this.connections.delete(connectionId);
        return;
      }

      // Setup message handling
      ws.on('message', async (data: Buffer) => {
        try {
          const message: MCPMessage = JSON.parse(data.toString());
          await this.handleMessage(connectionId, message);
        } catch (error) {
          logger.error('Message parsing error:', error);
          this.sendError(connectionId, 'PARSE_ERROR', 'Invalid JSON message');
        }
      });

      ws.on('close', (code, reason) => {
        this.connections.delete(connectionId);
        logger.info(`Connection closed: ${connectionId}`, {
          code,
          reason: reason.toString(),
        });
        this.emit('connection:closed', { connectionId, code, reason });
      });

      ws.on('error', error => {
        logger.error(`Connection error: ${connectionId}`, error);
        this.connections.delete(connectionId);
      });

      // Send welcome message
      this.sendMessage(connectionId, {
        id: 'welcome',
        method: 'server/info',
        result: {
          name: 'MCP Ecosystem Server',
          version: '1.0.0',
          capabilities: {
            resources: true,
            tools: true,
            prompts: true,
            sampling: false,
          },
        },
      });

      this.emit('connection:established', { connectionId, request });
    });
  }

  private async handleMessage(
    connectionId: string,
    message: MCPMessage
  ): Promise<void> {
    const startTime = Date.now();

    try {
      logger.debug(`Handling message: ${message.method}`, {
        connectionId,
        messageId: message.id,
      });

      let response: MCPMessage;

      switch (message.method) {
        case 'resources/list':
          response = await this.handleResourcesList(message);
          break;

        case 'resources/read':
          response = await this.handleResourceRead(message);
          break;

        case 'tools/list':
          response = await this.handleToolsList(message);
          break;

        case 'tools/call':
          response = await this.handleToolCall(message);
          break;

        case 'ping':
          response = {
            id: message.id,
            method: 'pong',
            result: { timestamp: Date.now() },
          };
          break;

        default:
          throw new Error(`Unknown method: ${message.method}`);
      }

      await this.sendMessage(connectionId, response);

      // Emit metrics
      if (this.config.enableMetrics) {
        this.emit('metrics:message_handled', {
          method: message.method,
          duration: Date.now() - startTime,
          connectionId,
        });
      }
    } catch (error) {
      logger.error(`Error handling message: ${message.method}`, error);
      this.sendError(
        connectionId,
        'INTERNAL_ERROR',
        (error as Error).message,
        message.id
      );
    }
  }

  /**
   * A.3 - Resource Management System
   */
  registerResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource);
    logger.info(`Resource registered: ${resource.uri}`, { name: resource.name });
    this.emit('resource:registered', resource);
  }

  unregisterResource(uri: string): void {
    if (this.resources.delete(uri)) {
      logger.info(`Resource unregistered: ${uri}`);
      this.emit('resource:unregistered', { uri });
    }
  }

  private async handleResourcesList(message: MCPMessage): Promise<MCPMessage> {
    const resources = Array.from(this.resources.values());

    return {
      id: message.id,
      method: 'resources/list',
      result: { resources },
    };
  }

  private async handleResourceRead(message: MCPMessage): Promise<MCPMessage> {
    const { uri } = message.params || {};

    if (!uri) {
      throw new Error('Resource URI is required');
    }

    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // Here you would implement actual resource reading logic
    // For now, return the resource metadata
    return {
      id: message.id,
      method: 'resources/read',
      result: {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType || 'text/plain',
            text: `Resource content for ${resource.name}`,
          },
        ],
      },
    };
  }

  /**
   * A.4 - Tool Execution Engine
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    logger.info(`Tool registered: ${tool.name}`, { description: tool.description });
    this.emit('tool:registered', tool);
  }

  unregisterTool(name: string): void {
    if (this.tools.delete(name)) {
      logger.info(`Tool unregistered: ${name}`);
      this.emit('tool:unregistered', { name });
    }
  }

  private async handleToolsList(message: MCPMessage): Promise<MCPMessage> {
    const tools = Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    return {
      id: message.id,
      method: 'tools/list',
      result: { tools },
    };
  }

  private async handleToolCall(message: MCPMessage): Promise<MCPMessage> {
    const { name, arguments: args } = message.params || {};

    if (!name) {
      throw new Error('Tool name is required');
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      const result = await tool.handler(args || {});

      return {
        id: message.id,
        method: 'tools/call',
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      logger.error(`Tool execution error: ${name}`, error);
      throw new Error(`Tool execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Utility Methods
   */
  private async sendMessage(connectionId: string, message: MCPMessage): Promise<void> {
    const ws = this.connections.get(connectionId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Connection not available: ${connectionId}`);
    }

    const data = JSON.stringify(message);

    return new Promise((resolve, reject) => {
      ws.send(data, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private sendError(
    connectionId: string,
    code: string,
    message: string,
    messageId?: string
  ): void {
    const errorMessage: MCPMessage = {
      id: messageId || 'error',
      method: 'error',
      error: {
        code: this.getErrorCode(code),
        message,
        data: { code },
      },
    };

    this.sendMessage(connectionId, errorMessage).catch(error => {
      logger.error('Failed to send error message', error);
    });
  }

  private getErrorCode(code: string): number {
    const codes: Record<string, number> = {
      PARSE_ERROR: -32700,
      INVALID_REQUEST: -32600,
      METHOD_NOT_FOUND: -32601,
      INVALID_PARAMS: -32602,
      INTERNAL_ERROR: -32603,
    };
    return codes[code] || -32603;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupHealthEndpoint(): void {
    this.httpServer.on('request', (req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'healthy',
            uptime: process.uptime(),
            connections: this.connections.size,
            resources: this.resources.size,
            tools: this.tools.size,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  }

  // Getters for monitoring
  get connectionCount(): number {
    return this.connections.size;
  }

  get resourceCount(): number {
    return this.resources.size;
  }

  get toolCount(): number {
    return this.tools.size;
  }

  get running(): boolean {
    return this.isRunning;
  }
}
