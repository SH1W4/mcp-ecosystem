// SAGE Integration - Configuration Type Definitions
// Based on WARP_SAGE_INTEGRATION ClientConfig

export interface WarpConfig {
  api_url: string;
  credentials?: ClientCredentials;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
  cache_settings?: CacheSettings;
  monitoring?: MonitoringConfig;
  security?: SecurityConfig;
}

export interface ClientCredentials {
  client_id: string;
  client_secret: string;
  username?: string;
  password?: string;
}

export interface RetryPolicy {
  max_retries: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  base_delay_ms: number;
  max_delay_ms?: number;
  retry_on_status?: number[];
}

export interface CacheSettings {
  enabled: boolean;
  ttl_ms: number;
  max_entries?: number;
  storage_type: 'memory' | 'filesystem' | 'redis';
  storage_path?: string;
  compression?: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  stream_type: 'sse' | 'websocket' | 'polling';
  poll_interval_ms?: number;
  heartbeat_interval_ms?: number;
  auto_reconnect: boolean;
  max_reconnect_attempts?: number;
}

export interface SecurityConfig {
  tls_verify: boolean;
  token_refresh_threshold_ms?: number;
  request_signing?: boolean;
  rate_limiting?: {
    requests_per_minute: number;
    burst_size: number;
  };
}

// Environment-specific configurations
export interface EnvironmentConfig {
  development: WarpConfig;
  staging: WarpConfig;
  production: WarpConfig;
}

// Integration configuration with other services
export interface IntegrationConfig {
  eon_framework?: {
    api_url: string;
    enabled: boolean;
    delegation_settings: {
      auto_delegate: boolean;
      task_types: string[];
      max_concurrent: number;
    };
  };
  external_apis?: Record<
    string,
    {
      url: string;
      auth: ClientCredentials;
      enabled: boolean;
    }
  >;
}

// Complete SAGE system configuration
export interface SageSystemConfig {
  agent_id: string;
  environment: 'development' | 'staging' | 'production';
  warp_rules: WarpConfig;
  integrations?: IntegrationConfig;
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'plain';
    output: 'console' | 'file' | 'both';
    file_path?: string;
  };
  features?: {
    auto_context_backup: boolean;
    rule_validation: boolean;
    performance_monitoring: boolean;
    telemetry_collection: boolean;
  };
}

// Configuration validation
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Default configurations
export const DEFAULT_WARP_CONFIG: Partial<WarpConfig> = {
  timeout_ms: 30000,
  retry_policy: {
    max_retries: 3,
    backoff_strategy: 'exponential',
    base_delay_ms: 1000,
    max_delay_ms: 10000,
    retry_on_status: [500, 502, 503, 504],
  },
  cache_settings: {
    enabled: true,
    ttl_ms: 300000, // 5 minutes
    max_entries: 1000,
    storage_type: 'memory',
    compression: false,
  },
  monitoring: {
    enabled: true,
    stream_type: 'sse',
    poll_interval_ms: 30000,
    heartbeat_interval_ms: 60000,
    auto_reconnect: true,
    max_reconnect_attempts: 5,
  },
  security: {
    tls_verify: true,
    token_refresh_threshold_ms: 300000, // 5 minutes before expiry
    request_signing: false,
  },
};
