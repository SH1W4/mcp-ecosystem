// MCP Server - Core Server Interface
// Basic interface for MCP Server that can be extended

import { EventEmitter } from 'events';

export interface MCPServerConfig {
  name: string;
  version: string;
  description?: string;
  author?: string;
  port?: number;
  host?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters?: any;
  handler: (params?: any) => Promise<any>;
}

/**
 * Base MCP Server class that can be extended with various capabilities
 */
export abstract class MCPServer extends EventEmitter {
  protected config: MCPServerConfig;
  protected tools: Map<string, MCPTool> = new Map();
  protected isRunning = false;

  constructor(config: MCPServerConfig) {
    super();
    this.config = config;
  }

  /**
   * Start the MCP server
   */
  abstract start(): Promise<void>;

  /**
   * Stop the MCP server
   */
  abstract stop(): Promise<void>;

  /**
   * Add a tool to the server
   */
  addTool(
    name: string,
    description: string,
    handler: (params?: any) => Promise<any>,
    parameters?: any
  ): void {
    this.tools.set(name, {
      name,
      description,
      parameters,
      handler,
    });
    this.emit('tool:added', { name, description });
  }

  /**
   * Remove a tool from the server
   */
  removeTool(name: string): boolean {
    const existed = this.tools.delete(name);
    if (existed) {
      this.emit('tool:removed', { name });
    }
    return existed;
  }

  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool information
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool
   */
  async executeTool(name: string, params?: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      const result = await tool.handler(params);
      this.emit('tool:executed', { name, params, result });
      return result;
    } catch (error) {
      this.emit('tool:error', { name, params, error });
      throw error;
    }
  }

  /**
   * Get server information
   */
  getServerInfo(): MCPServerConfig {
    return { ...this.config };
  }

  /**
   * Update server configuration
   */
  updateConfig(updates: Partial<MCPServerConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config:updated', updates);
  }

  /**
   * Update tool configuration (override in subclasses if needed)
   */
  updateToolConfig?(config: any): void;

  /**
   * Update server behavior (override in subclasses if needed)
   */
  updateBehavior?(behavior: any): void;

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      config: this.config,
      tools_count: this.tools.size,
      tools: this.getAvailableTools(),
    };
  }
}
