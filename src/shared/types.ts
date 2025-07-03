// Shared types for MCP Ecosystem

export interface MCPMessage {
  jsonrpc: string;
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export interface MCPRequest extends MCPMessage {
  method: string;
  params?: any;
}

export interface MCPResponse extends MCPMessage {
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPNotification extends MCPMessage {
  method: string;
  params?: any;
}

export interface CapabilityMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  schema?: any;
}

export interface ServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: Record<string, any>;
}

export interface ClientInfo {
  name: string;
  version: string;
  protocolVersion: string;
}

export interface ConnectionState {
  connected: boolean;
  lastSeen?: Date;
  error?: string;
}

export interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: any;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface ConfigValue {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
}

export type EventType = 'connection' | 'disconnection' | 'error' | 'message' | 'metric';

export interface Event {
  type: EventType;
  timestamp: Date;
  data: any;
  source?: string;
}

