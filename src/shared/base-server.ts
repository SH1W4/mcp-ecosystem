// Base server class for MCP Ecosystem

import { EventEmitter } from 'events';
import { MCPMessage, MCPRequest, MCPResponse, ServerInfo } from './types';

export abstract class BaseServer extends EventEmitter {
  protected name: string;
  protected version: string;
  protected protocolVersion: string;
  protected capabilities: Record<string, any>;
  protected running: boolean = false;

  constructor(name: string, version: string, protocolVersion: string = '2024-11-05') {
    super();
    this.name = name;
    this.version = version;
    this.protocolVersion = protocolVersion;
    this.capabilities = {};
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract handleMessage(message: MCPMessage): Promise<MCPResponse | void>;

  public getInfo(): ServerInfo {
    return {
      name: this.name,
      version: this.version,
      protocolVersion: this.protocolVersion,
      capabilities: this.capabilities
    };
  }

  public isRunning(): boolean {
    return this.running;
  }

  protected setCapability(name: string, value: any): void {
    this.capabilities[name] = value;
  }

  protected removeCapability(name: string): void {
    delete this.capabilities[name];
  }

  protected createResponse(request: MCPRequest, result?: any, error?: any): MCPResponse {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result,
      error
    };
  }

  protected createErrorResponse(request: MCPRequest, code: number, message: string, data?: any): MCPResponse {
    return this.createResponse(request, undefined, {
      code,
      message,
      data
    });
  }

  protected log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: any): void {
    this.emit('log', {
      timestamp: new Date(),
      level,
      message,
      context,
      source: this.name
    });
  }

  protected emitMetric(name: string, value: number, unit?: string, tags?: Record<string, string>): void {
    this.emit('metric', {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags: { ...tags, server: this.name }
    });
  }
}

