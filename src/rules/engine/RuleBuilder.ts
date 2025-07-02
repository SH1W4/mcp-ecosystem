/**
 * Construtor de regras com fluent API para o MCP_ECOSYSTEM
 */

import {
  Rule,
  RuleCondition,
  RuleAction,
  RuleType,
  RulePriority,
  RuleStatus,
  RuleMetadata,
} from '../types/RuleDefinition.js';

export class RuleBuilder {
  private rule: Partial<Rule> = {
    conditions: [],
    actions: [],
    scope: [],
    environment: [],
  };

  /**
   * Define metadados da regra
   */
  public withMetadata(
    id: string,
    name: string,
    description: string,
    version: string = '1.0.0',
    author: string = 'system'
  ): RuleBuilder {
    this.rule.metadata = {
      id,
      name,
      description,
      version,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
    return this;
  }

  /**
   * Define o tipo da regra
   */
  public ofType(type: RuleType): RuleBuilder {
    this.rule.type = type;
    return this;
  }

  /**
   * Define a prioridade da regra
   */
  public withPriority(priority: RulePriority): RuleBuilder {
    this.rule.priority = priority;
    return this;
  }

  /**
   * Define o status da regra
   */
  public withStatus(status: RuleStatus): RuleBuilder {
    this.rule.status = status;
    return this;
  }

  /**
   * Adiciona tags à regra
   */
  public withTags(...tags: string[]): RuleBuilder {
    if (this.rule.metadata) {
      this.rule.metadata.tags = [...(this.rule.metadata.tags || []), ...tags];
    }
    return this;
  }

  /**
   * Define escopos onde a regra se aplica
   */
  public inScopes(...scopes: string[]): RuleBuilder {
    this.rule.scope = [...(this.rule.scope || []), ...scopes];
    return this;
  }

  /**
   * Define ambientes onde a regra se aplica
   */
  public inEnvironments(...environments: string[]): RuleBuilder {
    this.rule.environment = [...(this.rule.environment || []), ...environments];
    return this;
  }

  /**
   * Adiciona condição de igualdade
   */
  public whenEquals(field: string, value: any, negate: boolean = false): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'equals',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de contenção
   */
  public whenContains(
    field: string,
    value: string,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'contains',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de início
   */
  public whenStartsWith(
    field: string,
    value: string,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'startsWith',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de final
   */
  public whenEndsWith(
    field: string,
    value: string,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'endsWith',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição regex
   */
  public whenMatches(
    field: string,
    pattern: string,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'regex',
      value: pattern,
      negate,
    });
  }

  /**
   * Adiciona condição de maior que
   */
  public whenGreaterThan(
    field: string,
    value: number,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'gt',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de menor que
   */
  public whenLessThan(
    field: string,
    value: number,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'lt',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de maior ou igual
   */
  public whenGreaterOrEqual(
    field: string,
    value: number,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'gte',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição de menor ou igual
   */
  public whenLessOrEqual(
    field: string,
    value: number,
    negate: boolean = false
  ): RuleBuilder {
    return this.addCondition({
      field,
      operator: 'lte',
      value,
      negate,
    });
  }

  /**
   * Adiciona condição customizada
   */
  public whenCondition(condition: RuleCondition): RuleBuilder {
    return this.addCondition(condition);
  }

  /**
   * Adiciona ação de bloqueio
   */
  public thenBlock(message?: string): RuleBuilder {
    return this.addAction({
      type: 'block',
      message,
    });
  }

  /**
   * Adiciona ação de permissão
   */
  public thenAllow(message?: string): RuleBuilder {
    return this.addAction({
      type: 'allow',
      message,
    });
  }

  /**
   * Adiciona ação de log
   */
  public thenLog(message?: string, parameters?: Record<string, any>): RuleBuilder {
    return this.addAction({
      type: 'log',
      message,
      parameters,
    });
  }

  /**
   * Adiciona ação de transformação
   */
  public thenTransform(parameters: Record<string, any>, message?: string): RuleBuilder {
    return this.addAction({
      type: 'transform',
      parameters,
      message,
    });
  }

  /**
   * Adiciona ação de redirecionamento
   */
  public thenRedirect(url: string, message?: string): RuleBuilder {
    return this.addAction({
      type: 'redirect',
      parameters: { url },
      message,
    });
  }

  /**
   * Adiciona ação customizada
   */
  public thenCustom(parameters: Record<string, any>, message?: string): RuleBuilder {
    return this.addAction({
      type: 'custom',
      parameters,
      message,
    });
  }

  /**
   * Adiciona ação
   */
  public thenAction(action: RuleAction): RuleBuilder {
    return this.addAction(action);
  }

  /**
   * Constrói a regra final
   */
  public build(): Rule {
    this.validateRule();
    return this.rule as Rule;
  }

  /**
   * Adiciona condição à regra
   */
  private addCondition(condition: RuleCondition): RuleBuilder {
    this.rule.conditions = [...(this.rule.conditions || []), condition];
    return this;
  }

  /**
   * Adiciona ação à regra
   */
  private addAction(action: RuleAction): RuleBuilder {
    this.rule.actions = [...(this.rule.actions || []), action];
    return this;
  }

  /**
   * Valida a regra antes de construir
   */
  private validateRule(): void {
    if (!this.rule.metadata) {
      throw new Error('Metadata é obrigatório');
    }

    if (!this.rule.metadata.id || !this.rule.metadata.name) {
      throw new Error('ID e nome são obrigatórios nos metadados');
    }

    if (!this.rule.type) {
      throw new Error('Tipo da regra é obrigatório');
    }

    if (this.rule.priority === undefined) {
      this.rule.priority = RulePriority.MEDIUM;
    }

    if (!this.rule.status) {
      this.rule.status = RuleStatus.ACTIVE;
    }

    if (!this.rule.scope || this.rule.scope.length === 0) {
      throw new Error('Pelo menos um escopo deve ser definido');
    }

    if (!this.rule.actions || this.rule.actions.length === 0) {
      throw new Error('Pelo menos uma ação deve ser definida');
    }
  }
}

/**
 * Factory para criar um novo builder
 */
export function createRule(): RuleBuilder {
  return new RuleBuilder();
}

/**
 * Templates predefinidos de regras
 */
export class RuleTemplates {
  /**
   * Template para regra de segurança básica
   */
  static securityRule(
    id: string,
    name: string,
    description: string,
    blockedPatterns: string[]
  ): RuleBuilder {
    const builder = createRule()
      .withMetadata(id, name, description)
      .ofType(RuleType.SECURITY)
      .withPriority(RulePriority.HIGH)
      .withStatus(RuleStatus.ACTIVE)
      .inScopes('mcp', 'tools', 'resources');

    // Adiciona condições para cada padrão bloqueado
    blockedPatterns.forEach(pattern => {
      builder.whenMatches('mcpRequest.params.input', pattern);
    });

    return builder.thenBlock('Solicitação bloqueada por regra de segurança');
  }

  /**
   * Template para regra de validação
   */
  static validationRule(
    id: string,
    name: string,
    description: string,
    requiredFields: string[]
  ): RuleBuilder {
    const builder = createRule()
      .withMetadata(id, name, description)
      .ofType(RuleType.VALIDATION)
      .withPriority(RulePriority.MEDIUM)
      .withStatus(RuleStatus.ACTIVE)
      .inScopes('mcp');

    // Adiciona condições para campos obrigatórios
    requiredFields.forEach(field => {
      builder.whenEquals(`mcpRequest.params.${field}`, undefined, true);
    });

    return builder.thenBlock('Campos obrigatórios não fornecidos');
  }

  /**
   * Template para regra de performance
   */
  static performanceRule(
    id: string,
    name: string,
    description: string,
    maxExecutionTime: number
  ): RuleBuilder {
    return createRule()
      .withMetadata(id, name, description)
      .ofType(RuleType.PERFORMANCE)
      .withPriority(RulePriority.LOW)
      .withStatus(RuleStatus.ACTIVE)
      .inScopes('tools')
      .whenGreaterThan('executionTime', maxExecutionTime)
      .thenLog(`Execução demorou mais que ${maxExecutionTime}ms`);
  }
}
