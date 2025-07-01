/**
 * API para gerenciamento e execução de regras no MCP_ECOSYSTEM
 */

import { RulesEngine } from '../engine/RulesEngine.js';
import { RuleBuilder, createRule, RuleTemplates } from '../engine/RuleBuilder.js';
import {
  Rule,
  RuleSet,
  RuleEngineResult,
  RuleType,
  RulePriority,
  RuleStatus,
} from '../types/RuleDefinition.js';
import { RuleExecutionContext, RuleContextBuilder } from '../types/RuleContext.js';

export interface RulesAPIConfig {
  enableCaching?: boolean;
  maxCacheSize?: number;
  enableStats?: boolean;
  enableLogging?: boolean;
}

export class RulesAPI {
  private engine: RulesEngine;
  private config: RulesAPIConfig;

  constructor(config: RulesAPIConfig = {}) {
    this.engine = new RulesEngine();
    this.config = {
      enableCaching: true,
      maxCacheSize: 1000,
      enableStats: true,
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Registra um conjunto de regras
   */
  public async registerRuleSet(
    ruleSet: RuleSet
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.engine.registerRuleSet(ruleSet);
      this.log(`RuleSet registrado: ${ruleSet.id}`);
      return { success: true };
    } catch (error) {
      const errorMsg = `Erro ao registrar RuleSet: ${error}`;
      this.log(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Remove um conjunto de regras
   */
  public async unregisterRuleSet(
    ruleSetId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const removed = this.engine.unregisterRuleSet(ruleSetId);
      if (removed) {
        this.log(`RuleSet removido: ${ruleSetId}`);
        return { success: true };
      } else {
        return { success: false, error: 'RuleSet não encontrado' };
      }
    } catch (error) {
      const errorMsg = `Erro ao remover RuleSet: ${error}`;
      this.log(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Lista todos os conjuntos de regras
   */
  public async listRuleSets(): Promise<RuleSet[]> {
    return this.engine.listRuleSets();
  }

  /**
   * Busca um conjunto de regras por ID
   */
  public async getRuleSet(ruleSetId: string): Promise<RuleSet | null> {
    const ruleSets = await this.listRuleSets();
    return ruleSets.find(rs => rs.id === ruleSetId) || null;
  }

  /**
   * Busca regras por critérios
   */
  public async searchRules(criteria: {
    type?: RuleType;
    status?: RuleStatus;
    tags?: string[];
    scope?: string[];
  }): Promise<Rule[]> {
    const ruleSets = await this.listRuleSets();
    const allRules: Rule[] = [];

    for (const ruleSet of ruleSets) {
      allRules.push(...ruleSet.rules);
    }

    return allRules.filter(rule => {
      if (criteria.type && rule.type !== criteria.type) return false;
      if (criteria.status && rule.status !== criteria.status) return false;
      if (criteria.scope && !criteria.scope.some(s => rule.scope.includes(s)))
        return false;
      if (criteria.tags && !criteria.tags.some(t => rule.metadata.tags.includes(t)))
        return false;
      return true;
    });
  }

  /**
   * Executa regras para um contexto
   */
  public async executeRules(
    context: RuleExecutionContext,
    scope?: string[]
  ): Promise<RuleEngineResult> {
    try {
      const result = await this.engine.executeRules(context, scope);

      if (this.config.enableLogging) {
        this.log(
          `Regras executadas - Sucesso: ${result.success}, Resultados: ${result.results.length}, Tempo: ${result.totalExecutionTime}ms`
        );
      }

      return result;
    } catch (error) {
      this.log(`Erro na execução de regras: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Cria um builder de contexto
   */
  public createContextBuilder(): RuleContextBuilderImpl {
    return new RuleContextBuilderImpl();
  }

  /**
   * Cria um builder de regras
   */
  public createRuleBuilder(): RuleBuilder {
    return createRule();
  }

  /**
   * Obtém templates de regras
   */
  public getTemplates(): typeof RuleTemplates {
    return RuleTemplates;
  }

  /**
   * Obtém estatísticas de execução
   */
  public async getExecutionStats(): Promise<
    Record<string, { count: number; averageTime: number; totalTime: number }>
  > {
    if (!this.config.enableStats) {
      return {};
    }
    return this.engine.getExecutionStats();
  }

  /**
   * Limpa estatísticas
   */
  public async clearStats(): Promise<void> {
    this.engine.clearStats();
    this.log('Estatísticas limpas');
  }

  /**
   * Valida uma regra
   */
  public async validateRule(rule: Rule): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validações básicas
      if (!rule.metadata?.id) errors.push('ID é obrigatório');
      if (!rule.metadata?.name) errors.push('Nome é obrigatório');
      if (!rule.type) errors.push('Tipo é obrigatório');
      if (!rule.scope || rule.scope.length === 0) errors.push('Escopo é obrigatório');
      if (!rule.actions || rule.actions.length === 0)
        errors.push('Ações são obrigatórias');

      // Validações específicas por tipo
      switch (rule.type) {
        case RuleType.SECURITY:
          if (rule.priority < RulePriority.MEDIUM) {
            errors.push('Regras de segurança devem ter prioridade média ou alta');
          }
          break;
        case RuleType.VALIDATION:
          if (rule.conditions.length === 0) {
            errors.push('Regras de validação devem ter pelo menos uma condição');
          }
          break;
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Erro na validação: ${error}`);
      return { valid: false, errors };
    }
  }

  /**
   * Cria um conjunto de regras a partir de um arquivo JSON
   */
  public async createRuleSetFromJSON(
    json: string
  ): Promise<{ ruleSet?: RuleSet; error?: string }> {
    try {
      const data = JSON.parse(json);

      // Converte datas do JSON
      if (data.metadata) {
        data.metadata.createdAt = new Date(data.metadata.createdAt);
        data.metadata.updatedAt = new Date(data.metadata.updatedAt);
      }

      if (data.rules) {
        data.rules.forEach((rule: any) => {
          if (rule.metadata) {
            rule.metadata.createdAt = new Date(rule.metadata.createdAt);
            rule.metadata.updatedAt = new Date(rule.metadata.updatedAt);
          }
        });
      }

      return { ruleSet: data as RuleSet };
    } catch (error) {
      return { error: `Erro ao processar JSON: ${error}` };
    }
  }

  /**
   * Exporta um conjunto de regras para JSON
   */
  public async exportRuleSetToJSON(
    ruleSetId: string
  ): Promise<{ json?: string; error?: string }> {
    try {
      const ruleSet = await this.getRuleSet(ruleSetId);
      if (!ruleSet) {
        return { error: 'RuleSet não encontrado' };
      }

      const json = JSON.stringify(ruleSet, null, 2);
      return { json };
    } catch (error) {
      return { error: `Erro ao exportar: ${error}` };
    }
  }

  /**
   * Cria regras de exemplo para teste
   */
  public async createSampleRules(): Promise<RuleSet> {
    const securityRule = RuleTemplates.securityRule(
      'security-01',
      'Bloqueio de Comandos Perigosos',
      'Bloqueia execução de comandos potencialmente perigosos',
      ['rm -rf', 'del /f', 'format', 'shutdown']
    ).build();

    const validationRule = RuleTemplates.validationRule(
      'validation-01',
      'Validação de Parâmetros MCP',
      'Valida se parâmetros obrigatórios estão presentes',
      ['toolName', 'arguments']
    ).build();

    const performanceRule = RuleTemplates.performanceRule(
      'performance-01',
      'Monitor de Performance',
      'Monitora tempos de execução de ferramentas',
      5000
    ).build();

    const ruleSet: RuleSet = {
      id: 'sample-rules',
      name: 'Regras de Exemplo',
      description: 'Conjunto de regras de exemplo para demonstração',
      version: '1.0.0',
      rules: [securityRule, validationRule, performanceRule],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'MCP_ECOSYSTEM',
      },
    };

    await this.registerRuleSet(ruleSet);
    return ruleSet;
  }

  /**
   * Log interno
   */
  private log(message: string, level: 'info' | 'error' = 'info'): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [RulesAPI] [${level.toUpperCase()}] ${message}`);
    }
  }
}

/**
 * Implementação do builder de contexto
 */
class RuleContextBuilderImpl implements RuleContextBuilder {
  private context: Partial<RuleExecutionContext> = {
    timestamp: new Date(),
    executionMeta: {
      traceId: this.generateTraceId(),
      depth: 0,
    },
  };

  setMCPRequest(request: any): RuleContextBuilder {
    this.context.mcpRequest = request;
    return this;
  }

  setMCPResponse(response: any): RuleContextBuilder {
    this.context.mcpResponse = response;
    return this;
  }

  setToolContext(context: any): RuleContextBuilder {
    this.context.toolContext = context;
    return this;
  }

  setResourceContext(context: any): RuleContextBuilder {
    this.context.resourceContext = context;
    return this;
  }

  setSession(sessionId: string, userId?: string, roles?: string[]): RuleContextBuilder {
    this.context.sessionId = sessionId;
    this.context.userId = userId;
    this.context.userRoles = roles;
    return this;
  }

  setEnvironment(env: string): RuleContextBuilder {
    this.context.environment = env;
    return this;
  }

  setCustomData(data: Record<string, any>): RuleContextBuilder {
    this.context.customData = { ...this.context.customData, ...data };
    return this;
  }

  build(): RuleExecutionContext {
    if (!this.context.environment) {
      this.context.environment = 'dev';
    }

    return this.context as RuleExecutionContext;
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
