/**
 * Módulo principal de regras do MCP_ECOSYSTEM
 *
 * Este módulo fornece um sistema completo de regras para o MCP_ECOSYSTEM,
 * incluindo motor de execução, construtor de regras e API de gerenciamento.
 */

// Exporta tipos
export * from './types/RuleDefinition.js';
export * from './types/RuleContext.js';

// Exporta motor de regras
export { RulesEngine } from './engine/RulesEngine.js';

// Exporta construtor de regras
export { RuleBuilder, createRule, RuleTemplates } from './engine/RuleBuilder.js';

// Exporta API
export { RulesAPI, type RulesAPIConfig } from './api/RulesAPI.js';

// Re-exporta tudo como namespace para facilitar uso
import { RulesEngine } from './engine/RulesEngine.js';
import { RuleBuilder, createRule, RuleTemplates } from './engine/RuleBuilder.js';
import { RulesAPI } from './api/RulesAPI.js';
import * as RuleTypes from './types/RuleDefinition.js';
import * as ContextTypes from './types/RuleContext.js';

export const Rules = {
  // Classes principais
  Engine: RulesEngine,
  Builder: RuleBuilder,
  API: RulesAPI,
  Templates: RuleTemplates,

  // Factories
  createRule,

  // Tipos
  Types: {
    ...RuleTypes,
    ...ContextTypes,
  },
};

/**
 * Cria uma instância configurada da API de regras
 */
export function createRulesAPI(config?: {
  enableCaching?: boolean;
  maxCacheSize?: number;
  enableStats?: boolean;
  enableLogging?: boolean;
}): RulesAPI {
  return new RulesAPI(config);
}

/**
 * Cria um novo motor de regras
 */
export function createRulesEngine(): RulesEngine {
  return new RulesEngine();
}

// Versão do módulo
export const VERSION = '1.0.0';
