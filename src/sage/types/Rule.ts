// SAGE Integration - Rule Type Definitions
// Based on WARP_SAGE_INTEGRATION Rule model

export interface Rule {
  id: string;
  name: string;
  type: RuleType;
  content: string;
  description?: string;
  priority: number;
  enabled: boolean;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
  metadata: {
    created_at: string;
    updated_at: string;
    version: string;
    author?: string;
    tags?: string[];
  };
}

export enum RuleType {
  STRUCTURAL = 'structural',
  COMMUNICATION = 'communication',
  PREFERENCE = 'preference',
  INFORMATIVE = 'informative',
  BEHAVIORAL = 'behavioral',
  SECURITY = 'security',
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'set_property' | 'modify_behavior' | 'send_notification' | 'log_event';
  target: string;
  value: any;
  parameters?: Record<string, any>;
}

export interface RuleResult {
  rule_id: string;
  agent_id: string;
  status: 'applied' | 'skipped' | 'failed';
  result: any;
  error_message?: string;
  applied_at: string;
  context_snapshot?: Record<string, any>;
}

export interface RuleSet {
  rules: Rule[];
  count: number;
  version: string;
  last_updated: string;
}

// Rule parsing and evaluation interfaces
export interface RuleEvaluationContext {
  agent_id: string;
  session_id?: string;
  environment: 'development' | 'staging' | 'production';
  current_time: string;
  user_data?: Record<string, any>;
  system_state?: Record<string, any>;
}

export interface RuleApplicationResult {
  applied_rules: RuleResult[];
  skipped_rules: string[];
  failed_rules: RuleResult[];
  context_changes: Record<string, any>;
  execution_time_ms: number;
}
