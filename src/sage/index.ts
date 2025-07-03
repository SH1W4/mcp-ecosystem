// SAGE Integration Module - Main Entry Point
// Based on WARP_SAGE_INTEGRATION blueprint

import { WarpRulesClient } from './client/WarpRulesClient';
import { RuleEngine } from './engine/RuleEngine';
import { SageIntegrationManager } from './manager/SageIntegrationManager';
import { AgentContext } from './types/AgentContext';
import { RuleApplicationResult } from './types/Rule';
import { WarpConfig } from './types/Config';

export { WarpRulesClient } from './client/WarpRulesClient';
export { RuleEngine } from './engine/RuleEngine';
export { SageIntegrationManager } from './manager/SageIntegrationManager';
export { AgentContext } from './types/AgentContext';
export {
  Rule,
  RuleResult,
  RuleApplicationResult,
  RuleEvaluationContext,
} from './types/Rule';
export { WarpConfig } from './types/Config';

// Re-export utilities
export * from './utils';

// Version and metadata
export const SAGE_VERSION = '1.0.0';
export const SAGE_PROTOCOL_VERSION = 'v1';

// Main SAGE Integration class for easy setup
export class SageIntegration {
  private client: WarpRulesClient;
  private engine: RuleEngine;
  private manager: SageIntegrationManager;

  constructor(config: WarpConfig) {
    this.client = new WarpRulesClient(config);
    this.engine = new RuleEngine();
    this.manager = new SageIntegrationManager({
      client: this.client,
      engine: this.engine,
      config: config,
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
    await this.client.startMonitoring();
  }

  async applyRules(context: AgentContext): Promise<RuleApplicationResult> {
    return this.manager.applyRules(context);
  }

  getClient(): WarpRulesClient {
    return this.client;
  }

  getEngine(): RuleEngine {
    return this.engine;
  }

  getManager(): SageIntegrationManager {
    return this.manager;
  }

  dispose(): void {
    this.client.dispose();
    this.manager.dispose();
  }
}
