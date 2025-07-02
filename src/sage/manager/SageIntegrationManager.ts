// SAGE Integration - Integration Manager
// Manages rule application and context updates

import { EventEmitter } from 'events';
import { WarpRulesClient } from '../client/WarpRulesClient';
import { RuleEngine } from '../engine/RuleEngine';
import { AgentContext } from '../types/AgentContext';
import { RuleApplicationResult } from '../types/Rule';
import { Logger } from '../utils/Logger';

export interface SageIntegrationOptions {
  client: WarpRulesClient;
  ruleEngine: RuleEngine;
}

/**
 * Manages the integration logic for applying rules and updating contexts
 */
export class SageIntegrationManager extends EventEmitter {
  private client: WarpRulesClient;
  private ruleEngine: RuleEngine;
  private logger: Logger;

  constructor(options: SageIntegrationOptions) {
    super();
    this.client = options.client;
    this.ruleEngine = options.ruleEngine;
    this.logger = new Logger('SageIntegrationManager');
  }

  /**
   * Apply rules to the given agent context
   */
  async applyRules(context: AgentContext): Promise<RuleApplicationResult> {
    try {
      this.logger.info('Fetching current rules for application');

      // Fetch current rules
      const rulesSet = await this.client.fetchRules();

      // Execute rule engine
      this.logger.info('Executing rule engine');
      const result = this.ruleEngine.execute(context, rulesSet.rules);

      // Send results back to WARP
      await this.client.sendResults(result.applied_rules, context);

      this.emit('rules:applied', result);
      return result;
    } catch (error) {
      this.logger.error('Failed to apply rules', error);
      throw error;
    }
  }

  /**
   * Dispose resources used by the manager
   */
  dispose(): void {
    this.removeAllListeners();
    this.logger.info('SageIntegrationManager disposed');
  }
}
