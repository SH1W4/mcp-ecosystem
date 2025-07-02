// MCP Server Extension - SAGE Integration
// Extends MCP Server with WARP Rules capabilities

import { MCPServer } from '../MCPServer';
import { WarpRulesClient } from '../sage/client/WarpRulesClient';
import { RuleEngine } from '../sage/engine/RuleEngine';
import { SageIntegrationManager } from '../sage/manager/SageIntegrationManager';
import { WarpConfig } from '../sage/types/Config';
import { AgentContext } from '../sage/types/AgentContext';
import { Rule, RuleApplicationResult } from '../sage/types/Rule';
import { Logger } from '../sage/utils/Logger';

export interface SageExtensionConfig {
  enabled: boolean;
  warp_config: WarpConfig;
  auto_apply_rules: boolean;
  rule_application_interval_ms?: number;
  context_backup_enabled?: boolean;
}

/**
 * SAGE Extension for MCP Server
 * Adds WARP Rules integration capabilities to any MCP Server instance
 */
export class SageExtension {
  private server: MCPServer;
  private config: SageExtensionConfig;
  private client: WarpRulesClient;
  private ruleEngine: RuleEngine;
  private integrationManager: SageIntegrationManager;
  private logger: Logger;
  private agentContext: AgentContext;
  private intervalId?: NodeJS.Timeout;

  constructor(server: MCPServer, config: SageExtensionConfig) {
    this.server = server;
    this.config = config;
    this.logger = new Logger('SageExtension');

    // Initialize SAGE components
    this.client = new WarpRulesClient(config.warp_config);
    this.ruleEngine = new RuleEngine();
    this.integrationManager = new SageIntegrationManager({
      client: this.client,
      ruleEngine: this.ruleEngine,
    });

    // Initialize agent context
    this.agentContext = this.createDefaultAgentContext();

    this.setupEventHandlers();
  }

  /**
   * Initialize the SAGE extension
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('SAGE Extension disabled in configuration');
      return;
    }

    try {
      this.logger.info('Initializing SAGE Extension');

      // Initialize WARP client
      await this.client.initialize();

      // Start rule monitoring
      await this.client.startMonitoring();

      // Apply initial rules
      await this.applyRules();

      // Setup periodic rule application if configured
      if (this.config.auto_apply_rules && this.config.rule_application_interval_ms) {
        this.startPeriodicRuleApplication();
      }

      // Register MCP extension points
      this.registerMCPExtensions();

      this.logger.info('SAGE Extension initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SAGE Extension', error);
      throw error;
    }
  }

  /**
   * Create default agent context for MCP server
   */
  private createDefaultAgentContext(): AgentContext {
    return {
      agent_id: `mcp_server_${Date.now()}`,
      environment: 'development',
      capabilities: {
        supported_protocols: ['mcp'],
        max_concurrent_tasks: 10,
        supported_formats: ['json'],
        available_tools: this.server.getAvailableTools?.() || [],
      },
      state: {
        status: 'idle',
        last_activity: new Date().toISOString(),
        resource_usage: {},
      },
      preferences: {
        response_format: 'json',
        language: 'en',
        timezone: 'UTC',
        logging_level: 'info',
        auto_recovery: true,
        notification_settings: {
          email_alerts: false,
          webhook_notifications: true,
        },
      },
      communication: {
        default_endpoint: this.config.warp_config.api_url,
        timeout_ms: this.config.warp_config.timeout_ms || 30000,
        retry_policy: {
          max_retries: 3,
          backoff_strategy: 'exponential',
          base_delay_ms: 1000,
        },
        authentication: {
          method: 'jwt',
        },
      },
      integrations: {
        warp_rules: {
          api_url: this.config.warp_config.api_url,
          enabled: true,
          auto_sync: true,
          sync_interval_ms: 300000,
        },
      },
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  /**
   * Setup event handlers for SAGE components
   */
  private setupEventHandlers(): void {
    // Handle rule updates
    this.client.on('rules:updated', async () => {
      this.logger.info('Rules updated, applying new rules');
      await this.applyRules();
    });

    // Handle client errors
    this.client.on('monitoring:error', error => {
      this.logger.error('WARP client monitoring error', error);
      this.server.emit?.('sage:error', error);
    });

    // Handle rule application results
    this.integrationManager.on('rules:applied', (result: RuleApplicationResult) => {
      this.logger.info(
        `Applied ${result.applied_rules.length} rules in ${result.execution_time_ms}ms`
      );
      this.server.emit?.('sage:rules_applied', result);
    });
  }

  /**
   * Apply rules to current agent context
   */
  async applyRules(): Promise<RuleApplicationResult> {
    try {
      // Update agent context with current server state
      this.updateAgentContextFromServer();

      // Apply rules through integration manager
      const result = await this.integrationManager.applyRules(this.agentContext);

      // Apply context changes back to server
      this.applyContextChangesToServer(result.context_changes);

      return result;
    } catch (error) {
      this.logger.error('Failed to apply rules', error);
      throw error;
    }
  }

  /**
   * Update agent context with current server state
   */
  private updateAgentContextFromServer(): void {
    // Update capabilities from server
    const tools = this.server.getAvailableTools?.() || [];
    this.agentContext.capabilities.available_tools = tools;

    // Update state
    this.agentContext.state.last_activity = new Date().toISOString();
    this.agentContext.metadata.last_updated = new Date().toISOString();

    // Update any server-specific context
    if (this.server.getServerInfo) {
      const serverInfo = this.server.getServerInfo();
      this.agentContext.metadata.context_hash = this.generateContextHash(serverInfo);
    }
  }

  /**
   * Apply context changes back to the server
   */
  private applyContextChangesToServer(changes: Record<string, any>): void {
    // Apply configuration changes to server if supported
    if (changes.server_config && this.server.updateConfig) {
      this.server.updateConfig(changes.server_config);
    }

    // Apply tool configurations
    if (changes.tool_config && this.server.updateToolConfig) {
      this.server.updateToolConfig(changes.tool_config);
    }

    // Apply behavioral changes
    if (changes.behavior && this.server.updateBehavior) {
      this.server.updateBehavior(changes.behavior);
    }

    this.logger.debug('Applied context changes to server', Object.keys(changes));
  }

  /**
   * Register MCP-specific extensions
   */
  private registerMCPExtensions(): void {
    // Add SAGE-specific tools to the server
    const sageTools = [
      {
        name: 'sage_apply_rules',
        description: 'Apply WARP rules to current context',
        handler: async () => {
          const result = await this.applyRules();
          return {
            applied_rules: result.applied_rules.length,
            execution_time_ms: result.execution_time_ms,
            context_changes: Object.keys(result.context_changes),
          };
        },
      },
      {
        name: 'sage_get_rules',
        description: 'Get current rules from WARP API',
        handler: async () => {
          const rules = await this.client.fetchRules();
          return {
            count: rules.count,
            version: rules.version,
            rules: rules.rules.map(r => ({
              id: r.id,
              name: r.name,
              type: r.type,
              priority: r.priority,
              enabled: r.enabled,
            })),
          };
        },
      },
      {
        name: 'sage_get_status',
        description: 'Get SAGE extension status',
        handler: async () => {
          return {
            client_status: this.client.getStatus(),
            agent_context: {
              agent_id: this.agentContext.agent_id,
              status: this.agentContext.state.status,
              last_activity: this.agentContext.state.last_activity,
              rules_version: this.agentContext.metadata.rules_version,
            },
          };
        },
      },
    ];

    // Register tools with server
    sageTools.forEach(tool => {
      if (this.server.addTool) {
        this.server.addTool(tool.name, tool.description, tool.handler);
      }
    });
  }

  /**
   * Start periodic rule application
   */
  private startPeriodicRuleApplication(): void {
    const interval = this.config.rule_application_interval_ms!;

    this.intervalId = setInterval(async () => {
      try {
        await this.applyRules();
      } catch (error) {
        this.logger.error('Periodic rule application failed', error);
      }
    }, interval);

    this.logger.info(`Started periodic rule application (${interval}ms interval)`);
  }

  /**
   * Generate context hash for change detection
   */
  private generateContextHash(data: any): string {
    // Simple hash function for context change detection
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get extension status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      client_status: this.client.getStatus(),
      agent_context: this.agentContext,
      periodic_application: !!this.intervalId,
    };
  }

  /**
   * Update extension configuration
   */
  updateConfig(newConfig: Partial<SageExtensionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.auto_apply_rules !== undefined) {
      if (newConfig.auto_apply_rules && !this.intervalId) {
        this.startPeriodicRuleApplication();
      } else if (!newConfig.auto_apply_rules && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    }
  }

  /**
   * Dispose extension resources
   */
  dispose(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.client.dispose();
    this.integrationManager.dispose();

    this.logger.info('SAGE Extension disposed');
  }
}
