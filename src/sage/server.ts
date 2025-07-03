// SAGE Server interface for MCP integration

import { BaseServer } from '../shared/base-server';
import { MCPMessage, MCPRequest, MCPResponse } from '../shared/types';
import { SageClient, SageConfig } from './client';

export class SageServer extends BaseServer {
  private client: SageClient;
  private config: SageConfig;

  constructor(config: SageConfig) {
    super('sage-server', '1.0.0');
    this.config = config;
    this.client = new SageClient(config);
    this.setupCapabilities();
  }

  private setupCapabilities(): void {
    this.setCapability('queries', {
      execute: true,
      prepared: true,
      transactions: true
    });
    
    this.setCapability('connection', {
      pooling: false,
      reconnect: true,
      timeout: this.config.timeout || 30000
    });
  }

  public async start(): Promise<void> {
    try {
      await this.client.connect();
      this.running = true;
      this.log('info', 'SAGE Server started successfully');
      this.emitMetric('server.start', 1);
    } catch (error) {
      this.log('error', 'Failed to start SAGE Server', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.client.disconnect();
      this.running = false;
      this.log('info', 'SAGE Server stopped');
      this.emitMetric('server.stop', 1);
    } catch (error) {
      this.log('error', 'Error stopping SAGE Server', error);
      throw error;
    }
  }

  public async handleMessage(message: MCPMessage): Promise<MCPResponse | void> {
    if (!message.method) {
      return;
    }

    const request = message as MCPRequest;

    try {
      switch (request.method) {
        case 'sage/execute':
          return await this.handleExecuteQuery(request);
        
        case 'sage/status':
          return await this.handleStatus(request);
        
        case 'sage/connection':
          return await this.handleConnectionInfo(request);
        
        default:
          return this.createErrorResponse(request, -32601, `Method not found: ${request.method}`);
      }
    } catch (error) {
      this.log('error', 'Error handling message', { method: request.method, error });
      return this.createErrorResponse(
        request,
        -32603,
        'Internal error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async handleExecuteQuery(request: MCPRequest): Promise<MCPResponse> {
    const { sql, parameters, timeout } = request.params || {};

    if (!sql) {
      return this.createErrorResponse(request, -32602, 'Missing required parameter: sql');
    }

    try {
      const result = await this.client.executeQuery({
        sql,
        parameters,
        timeout
      });

      this.emitMetric('query.executed', 1, 'count', {
        success: result.success.toString()
      });

      return this.createResponse(request, result);
    } catch (error) {
      return this.createErrorResponse(
        request,
        -32603,
        'Query execution failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async handleStatus(request: MCPRequest): Promise<MCPResponse> {
    const status = {
      connected: this.client.isConnected(),
      server: this.getInfo(),
      connection: this.client.getConnectionInfo()
    };

    return this.createResponse(request, status);
  }

  private async handleConnectionInfo(request: MCPRequest): Promise<MCPResponse> {
    const connectionInfo = this.client.getConnectionInfo();
    return this.createResponse(request, connectionInfo);
  }
}

