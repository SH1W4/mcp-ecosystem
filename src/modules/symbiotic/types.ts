/**
 * Tipos para o módulo simbiótico VIREON
 */

export interface SymbioticConfig {
  bootstrap: {
    symbiotic_core_init: BootstrapConfig;
    symbiotic_analysis: BootstrapConfig;
  };
  integration: {
    vireon_bridge: BridgeConfig;
    nexus_bridge: BridgeConfig;
  };
  evolution: {
    symbiotic_emergence: EvolutionConfig;
    symbiotic_evolution: EvolutionConfig;
  };
  monitoring: {
    symbiotic_vitals: MonitoringConfig;
  };
}

export interface BootstrapConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  params?: any;
  dependencies?: string[];
  outputs?: string[];
}

export interface BridgeConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  capabilities: {
    [key: string]: boolean;
  };
  adaptation_level?: number;
  sync_mode?: string;
}

export interface EvolutionConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  metrics?: string[];
  conditions?: {
    [key: string]: string;
  };
}

export interface MonitoringConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  metrics: string[];
  alerts: string[];
}

export interface MetricsConfig {
  symbiotic_vitals: {
    integration_score: MetricDefinition;
    adaptation_rate: MetricDefinition;
    evolution_progress: MetricDefinition;
  };
  health_monitoring: {
    symbiotic_cohesion: MetricDefinition;
    resource_balance: MetricDefinition;
    emergence_stability: MetricDefinition;
  };
  evolution_metrics: {
    emergence_rate: MetricDefinition;
    learning_efficiency: MetricDefinition;
    symbiotic_index: MetricDefinition;
  };
}

export interface MetricDefinition {
  type: string;
  range: [number, number];
  threshold: number;
  description?: string;
  alert_levels?: {
    warning: number;
    critical: number;
  };
}
