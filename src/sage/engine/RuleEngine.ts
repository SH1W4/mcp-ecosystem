// SAGE Integration - Rule Engine
// Based on WARP_SAGE_INTEGRATION rule engine

import {
  Rule,
  RuleCondition,
  RuleAction,
  RuleApplicationResult,
  RuleResult,
  RuleEvaluationContext,
} from '../types/Rule';
import { AgentContext, ContextPath } from '../types/AgentContext';
import { Logger } from '../utils/Logger';

/**
 * Rule execution engine that evaluates conditions and applies actions
 */
export class RuleEngine {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RuleEngine');
  }

  /**
   * Execute rules against the given context
   */
  execute(context: AgentContext, rules: Rule[]): RuleApplicationResult {
    const startTime = Date.now();

    const appliedRules: RuleResult[] = [];
    const skippedRules: string[] = [];
    const failedRules: RuleResult[] = [];
    const contextChanges: Record<string, any> = {};

    // Sort rules by priority (higher priority first)
    const sortedRules = rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    this.logger.info(`Executing ${sortedRules.length} enabled rules`);

    for (const rule of sortedRules) {
      try {
        const result = this.executeRule(rule, context, contextChanges);

        if (result.status === 'applied') {
          appliedRules.push(result);
          this.logger.debug(`Rule ${rule.id} applied successfully`);
        } else if (result.status === 'skipped') {
          skippedRules.push(rule.id);
          this.logger.debug(`Rule ${rule.id} skipped`);
        }
      } catch (error: any) {
        const failedResult: RuleResult = {
          rule_id: rule.id,
          agent_id: context.agent_id,
          status: 'failed',
          result: null,
          error_message: error.message,
          applied_at: new Date().toISOString(),
          context_snapshot: this.createContextSnapshot(context),
        };

        failedRules.push(failedResult);
        this.logger.error(`Rule ${rule.id} failed`, error);
      }
    }

    const executionTime = Date.now() - startTime;

    this.logger.info(
      `Rule execution completed: ${appliedRules.length} applied, ${skippedRules.length} skipped, ${failedRules.length} failed in ${executionTime}ms`
    );

    return {
      applied_rules: appliedRules,
      skipped_rules: skippedRules,
      failed_rules: failedRules,
      context_changes: contextChanges,
      execution_time_ms: executionTime,
    };
  }

  /**
   * Execute a single rule
   */
  private executeRule(
    rule: Rule,
    context: AgentContext,
    contextChanges: Record<string, any>
  ): RuleResult {
    // Create evaluation context
    const evalContext: RuleEvaluationContext = {
      agent_id: context.agent_id,
      session_id: context.session_id,
      environment: context.environment,
      current_time: new Date().toISOString(),
      user_data: {},
      system_state: {
        capabilities: context.capabilities,
        state: context.state,
        preferences: context.preferences,
      },
    };

    // Evaluate conditions
    if (!this.evaluateConditions(rule.conditions || [], evalContext, context)) {
      return {
        rule_id: rule.id,
        agent_id: context.agent_id,
        status: 'skipped',
        result: 'Conditions not met',
        applied_at: new Date().toISOString(),
      };
    }

    // Apply actions
    const actionResults = this.applyActions(
      rule.actions || [],
      context,
      contextChanges
    );

    return {
      rule_id: rule.id,
      agent_id: context.agent_id,
      status: 'applied',
      result: actionResults,
      applied_at: new Date().toISOString(),
      context_snapshot: this.createContextSnapshot(context),
    };
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateConditions(
    conditions: RuleCondition[],
    evalContext: RuleEvaluationContext,
    agentContext: AgentContext
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogical = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(
        condition,
        evalContext,
        agentContext
      );

      if (currentLogical === 'AND') {
        result = result && conditionResult;
      } else if (currentLogical === 'OR') {
        result = result || conditionResult;
      }

      currentLogical = condition.logical_operator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: RuleCondition,
    evalContext: RuleEvaluationContext,
    agentContext: AgentContext
  ): boolean {
    const fieldValue = this.getContextValue(
      condition.field as ContextPath,
      agentContext,
      evalContext
    );

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;

      case 'matches':
        if (typeof fieldValue === 'string') {
          const regex = new RegExp(condition.value);
          return regex.test(fieldValue);
        }
        return false;

      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);

      case 'less_than':
        return Number(fieldValue) < Number(condition.value);

      default:
        this.logger.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Apply rule actions
   */
  private applyActions(
    actions: RuleAction[],
    context: AgentContext,
    contextChanges: Record<string, any>
  ): any[] {
    const results: any[] = [];

    for (const action of actions) {
      try {
        const result = this.applyAction(action, context, contextChanges);
        results.push(result);
      } catch (error: any) {
        this.logger.error(`Failed to apply action ${action.type}`, error);
        results.push({ error: error.message });
      }
    }

    return results;
  }

  /**
   * Apply a single action
   */
  private applyAction(
    action: RuleAction,
    context: AgentContext,
    contextChanges: Record<string, any>
  ): any {
    switch (action.type) {
      case 'set_property':
        this.setContextValue(action.target as ContextPath, action.value, context);
        contextChanges[action.target] = action.value;
        return { type: 'property_set', target: action.target, value: action.value };

      case 'modify_behavior':
        if (!contextChanges.behavior) contextChanges.behavior = {};
        contextChanges.behavior[action.target] = action.value;
        return {
          type: 'behavior_modified',
          target: action.target,
          value: action.value,
        };

      case 'send_notification':
        // Emit notification event
        return {
          type: 'notification_sent',
          target: action.target,
          message: action.value,
        };

      case 'log_event':
        this.logger.info(`Rule action log: ${action.value}`, action.parameters);
        return { type: 'event_logged', message: action.value };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Get value from context using dot notation path
   */
  private getContextValue(
    path: ContextPath,
    agentContext: AgentContext,
    evalContext: RuleEvaluationContext
  ): any {
    // Special context fields
    if (path === 'current_time') {
      return evalContext.current_time;
    }

    if (path === 'environment') {
      return evalContext.environment;
    }

    // Navigate through agent context
    const pathParts = path.split('.');
    let value: any = agentContext;

    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set value in context using dot notation path
   */
  private setContextValue(path: ContextPath, value: any, context: AgentContext): void {
    const pathParts = path.split('.');
    let target: any = context;

    // Navigate to parent object
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!(part in target) || typeof target[part] !== 'object') {
        target[part] = {};
      }
      target = target[part];
    }

    // Set the final value
    const finalKey = pathParts[pathParts.length - 1];
    target[finalKey] = value;

    // Update metadata
    context.metadata.last_updated = new Date().toISOString();
  }

  /**
   * Create a snapshot of the current context
   */
  private createContextSnapshot(context: AgentContext): Record<string, any> {
    return {
      agent_id: context.agent_id,
      status: context.state.status,
      capabilities_count: context.capabilities.available_tools.length,
      last_activity: context.state.last_activity,
      version: context.metadata.version,
    };
  }
}
