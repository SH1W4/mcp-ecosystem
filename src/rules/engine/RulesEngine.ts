/**
 * Motor principal de execução de regras para o MCP_ECOSYSTEM
 */

import {
  Rule,
  RuleSet,
  RuleExecutionResult,
  RuleEngineResult,
  RuleStatus,
  RuleCondition,
  RuleAction,
} from '../types/RuleDefinition.js';
import { RuleExecutionContext } from '../types/RuleContext.js';

export class RulesEngine {
  private ruleSets: Map<string, RuleSet> = new Map();
  private ruleCache: Map<string, Rule[]> = new Map();
  private executionStats: Map<string, { count: number; totalTime: number }> = new Map();

  constructor() {
    this.clearCache();
  }

  /**
   * Registra um conjunto de regras
   */
  public registerRuleSet(ruleSet: RuleSet): void {
    this.validateRuleSet(ruleSet);
    this.ruleSets.set(ruleSet.id, ruleSet);
    this.clearCache(); // Limpa cache quando novas regras são adicionadas
  }

  /**
   * Remove um conjunto de regras
   */
  public unregisterRuleSet(ruleSetId: string): boolean {
    const removed = this.ruleSets.delete(ruleSetId);
    if (removed) {
      this.clearCache();
    }
    return removed;
  }

  /**
   * Lista todos os conjuntos de regras
   */
  public listRuleSets(): RuleSet[] {
    return Array.from(this.ruleSets.values());
  }

  /**
   * Executa regras para um contexto específico
   */
  public async executeRules(
    context: RuleExecutionContext,
    scope?: string[]
  ): Promise<RuleEngineResult> {
    const startTime = Date.now();
    const results: RuleExecutionResult[] = [];
    const errors: string[] = [];

    try {
      const applicableRules = this.getApplicableRules(context, scope);

      // Ordena regras por prioridade (maior prioridade primeiro)
      applicableRules.sort((a, b) => b.priority - a.priority);

      for (const rule of applicableRules) {
        try {
          const result = await this.executeRule(rule, context);
          results.push(result);

          // Atualiza estatísticas
          this.updateExecutionStats(rule.metadata.id, result.executionTime);

          // Se a regra bloqueou a execução, para aqui
          if (result.matched && this.hasBlockingAction(result.actions)) {
            break;
          }
        } catch (error) {
          const errorMsg = `Erro ao executar regra ${rule.metadata.id}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      const totalExecutionTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        results,
        totalExecutionTime,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        totalExecutionTime: Date.now() - startTime,
        errors: [`Erro geral na execução: ${error}`],
      };
    }
  }

  /**
   * Executa uma regra específica
   */
  private async executeRule(
    rule: Rule,
    context: RuleExecutionContext
  ): Promise<RuleExecutionResult> {
    const startTime = Date.now();

    // Verifica se a regra está ativa
    if (rule.status !== RuleStatus.ACTIVE) {
      return {
        ruleId: rule.metadata.id,
        matched: false,
        actions: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Verifica se o ambiente é aplicável
    if (rule.environment && !rule.environment.includes(context.environment)) {
      return {
        ruleId: rule.metadata.id,
        matched: false,
        actions: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Avalia condições
    const matched = await this.evaluateConditions(rule.conditions, context);

    return {
      ruleId: rule.metadata.id,
      matched,
      actions: matched ? rule.actions : [],
      executionTime: Date.now() - startTime,
      metadata: {
        ruleName: rule.metadata.name,
        ruleType: rule.type,
        priority: rule.priority,
      },
    };
  }

  /**
   * Avalia condições de uma regra
   */
  private async evaluateConditions(
    conditions: RuleCondition[],
    context: RuleExecutionContext
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) return false; // AND lógico - todas devem ser verdadeiras
    }

    return true;
  }

  /**
   * Avalia uma condição específica
   */
  private async evaluateCondition(
    condition: RuleCondition,
    context: RuleExecutionContext
  ): Promise<boolean> {
    const value = this.extractValueFromContext(condition.field, context);
    let result = false;

    switch (condition.operator) {
      case 'equals':
        result = value === condition.value;
        break;
      case 'contains':
        result = String(value).includes(String(condition.value));
        break;
      case 'startsWith':
        result = String(value).startsWith(String(condition.value));
        break;
      case 'endsWith':
        result = String(value).endsWith(String(condition.value));
        break;
      case 'regex':
        result = new RegExp(condition.value).test(String(value));
        break;
      case 'gt':
        result = Number(value) > Number(condition.value);
        break;
      case 'lt':
        result = Number(value) < Number(condition.value);
        break;
      case 'gte':
        result = Number(value) >= Number(condition.value);
        break;
      case 'lte':
        result = Number(value) <= Number(condition.value);
        break;
      default:
        throw new Error(`Operador não suportado: ${condition.operator}`);
    }

    return condition.negate ? !result : result;
  }

  /**
   * Extrai valor do contexto baseado no campo
   */
  private extractValueFromContext(field: string, context: RuleExecutionContext): any {
    const parts = field.split('.');
    let current: any = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Obtém regras aplicáveis para o contexto
   */
  private getApplicableRules(context: RuleExecutionContext, scope?: string[]): Rule[] {
    const cacheKey = this.generateCacheKey(context, scope);

    if (this.ruleCache.has(cacheKey)) {
      return this.ruleCache.get(cacheKey)!;
    }

    const applicableRules: Rule[] = [];

    for (const ruleSet of this.ruleSets.values()) {
      for (const rule of ruleSet.rules) {
        if (this.isRuleApplicable(rule, context, scope)) {
          applicableRules.push(rule);
        }
      }
    }

    this.ruleCache.set(cacheKey, applicableRules);
    return applicableRules;
  }

  /**
   * Verifica se uma regra é aplicável ao contexto
   */
  private isRuleApplicable(
    rule: Rule,
    context: RuleExecutionContext,
    scope?: string[]
  ): boolean {
    // Verifica status
    if (rule.status === RuleStatus.INACTIVE || rule.status === RuleStatus.DEPRECATED) {
      return false;
    }

    // Verifica escopo
    if (scope && scope.length > 0) {
      const hasMatchingScope = rule.scope.some(ruleScope => scope.includes(ruleScope));
      if (!hasMatchingScope) return false;
    }

    // Verifica ambiente
    if (rule.environment && rule.environment.length > 0) {
      if (!rule.environment.includes(context.environment)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se há ações que bloqueiam a execução
   */
  private hasBlockingAction(actions: RuleAction[]): boolean {
    return actions.some(action => action.type === 'block');
  }

  /**
   * Valida um conjunto de regras
   */
  private validateRuleSet(ruleSet: RuleSet): void {
    if (!ruleSet.id || !ruleSet.name || !ruleSet.version) {
      throw new Error('RuleSet deve ter id, name e version');
    }

    for (const rule of ruleSet.rules) {
      if (!rule.metadata.id || !rule.metadata.name) {
        throw new Error('Rule deve ter metadata com id e name');
      }
    }
  }

  /**
   * Gera chave de cache
   */
  private generateCacheKey(context: RuleExecutionContext, scope?: string[]): string {
    const scopeStr = scope ? scope.sort().join(',') : '';
    return `${context.environment}:${scopeStr}:${context.executionMeta.traceId}`;
  }

  /**
   * Limpa cache de regras
   */
  private clearCache(): void {
    this.ruleCache.clear();
  }

  /**
   * Atualiza estatísticas de execução
   */
  private updateExecutionStats(ruleId: string, executionTime: number): void {
    const stats = this.executionStats.get(ruleId) || { count: 0, totalTime: 0 };
    stats.count++;
    stats.totalTime += executionTime;
    this.executionStats.set(ruleId, stats);
  }

  /**
   * Obtém estatísticas de execução
   */
  public getExecutionStats(): Record<
    string,
    { count: number; averageTime: number; totalTime: number }
  > {
    const result: Record<
      string,
      { count: number; averageTime: number; totalTime: number }
    > = {};

    for (const [ruleId, stats] of this.executionStats.entries()) {
      result[ruleId] = {
        count: stats.count,
        totalTime: stats.totalTime,
        averageTime: stats.totalTime / stats.count,
      };
    }

    return result;
  }

  /**
   * Limpa estatísticas
   */
  public clearStats(): void {
    this.executionStats.clear();
  }
}
