/**
 * Definições de tipos para o sistema de regras do MCP_ECOSYSTEM
 */

export enum RuleType {
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CUSTOM = 'custom',
}

export enum RulePriority {
  LOW = 1,
  MEDIUM = 5,
  HIGH = 10,
  CRITICAL = 20,
}

export enum RuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  TESTING = 'testing',
}

export interface RuleCondition {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'regex'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
  value: any;
  negate?: boolean;
}

export interface RuleAction {
  type: 'block' | 'allow' | 'transform' | 'redirect' | 'log' | 'custom';
  parameters?: Record<string, any>;
  message?: string;
}

export interface RuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Rule {
  metadata: RuleMetadata;
  type: RuleType;
  priority: RulePriority;
  status: RuleStatus;
  conditions: RuleCondition[];
  actions: RuleAction[];
  scope: string[]; // Scopes where rule applies (e.g., ['mcp', 'tools', 'resources'])
  environment?: string[]; // Environments where rule applies (e.g., ['dev', 'prod'])
}

export interface RuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  rules: Rule[];
  dependencies?: string[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
  };
}

export interface RuleExecutionResult {
  ruleId: string;
  matched: boolean;
  actions: RuleAction[];
  executionTime: number;
  metadata?: Record<string, any>;
}

export interface RuleEngineResult {
  success: boolean;
  results: RuleExecutionResult[];
  totalExecutionTime: number;
  errors?: string[];
}
