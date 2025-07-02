// SAGE Integration - Agent Context Type Definitions
// Based on WARP_SAGE_INTEGRATION AgentContext model

export interface AgentContext {
  agent_id: string;
  session_id?: string;
  environment: 'development' | 'staging' | 'production';
  capabilities: AgentCapabilities;
  state: AgentState;
  preferences: AgentPreferences;
  communication: CommunicationSettings;
  integrations: IntegrationSettings;
  metadata: {
    created_at: string;
    last_updated: string;
    version: string;
    rules_version?: string;
    context_hash?: string;
  };
}

export interface AgentCapabilities {
  supported_protocols: string[];
  max_concurrent_tasks: number;
  supported_formats: string[];
  available_tools: string[];
  language_models?: string[];
  custom_capabilities?: Record<string, any>;
}

export interface AgentState {
  status: 'idle' | 'busy' | 'error' | 'maintenance';
  current_task_id?: string;
  last_activity: string;
  resource_usage: {
    memory_mb?: number;
    cpu_percent?: number;
    active_connections?: number;
  };
  error_state?: {
    last_error: string;
    error_count: number;
    recovery_attempts: number;
  };
}

export interface AgentPreferences {
  response_format: 'json' | 'xml' | 'plain_text';
  language: string;
  timezone: string;
  logging_level: 'debug' | 'info' | 'warn' | 'error';
  auto_recovery: boolean;
  notification_settings: {
    email_alerts: boolean;
    webhook_notifications: boolean;
    slack_integration?: boolean;
  };
  custom_preferences?: Record<string, any>;
}

export interface CommunicationSettings {
  default_endpoint: string;
  timeout_ms: number;
  retry_policy: {
    max_retries: number;
    backoff_strategy: 'linear' | 'exponential';
    base_delay_ms: number;
  };
  authentication: {
    method: 'jwt' | 'api_key' | 'oauth2';
    token?: string;
    refresh_token?: string;
    expires_at?: string;
  };
  headers?: Record<string, string>;
}

export interface IntegrationSettings {
  warp_rules: {
    api_url: string;
    enabled: boolean;
    auto_sync: boolean;
    sync_interval_ms: number;
    last_sync?: string;
  };
  eon_framework?: {
    api_url: string;
    enabled: boolean;
    task_delegation: boolean;
  };
  external_services?: Record<
    string,
    {
      url: string;
      enabled: boolean;
      config: Record<string, any>;
    }
  >;
}

// Context manipulation interfaces
export interface ContextUpdate {
  field_path: string;
  value: any;
  operation: 'set' | 'merge' | 'delete' | 'append';
  timestamp: string;
}

export interface ContextSnapshot {
  context: AgentContext;
  timestamp: string;
  version: string;
  checksum: string;
}

// Helper type for context field access
export type ContextPath =
  | 'agent_id'
  | 'capabilities.supported_protocols'
  | 'state.status'
  | 'preferences.response_format'
  | 'communication.default_endpoint'
  | 'integrations.warp_rules.enabled'
  | string; // Allow any string for dynamic paths
