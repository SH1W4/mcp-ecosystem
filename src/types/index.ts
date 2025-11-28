export interface BackupOptions {
  files?: string[];
  tags?: string[];
  compress?: boolean;
}

export interface SyncProvider {
  name: string;
  type: 'network' | 'cloud' | 'p2p' | 'git';
  config: Record<string, unknown>;
}

export interface SyncOptions {
  type: SyncProvider['type'];
  config?: Record<string, unknown>;
}

export interface UniversalBackup {
  createBackup(options: BackupOptions): Promise<string>;
  listBackups(filter?: { tags?: string[] }): Promise<string[]>;
  restoreBackup(id: string): Promise<void>;
}

export interface UniversalSync {
  addProvider(provider: SyncProvider): Promise<void>;
  listProviders(): SyncProvider[];
  connect(name: string): Promise<void>;
  sync(): Promise<void>;
  isConnected(): boolean;
}

export interface MCPEcosystem {
  getBackupModule(): UniversalBackup;
  getSyncModule(): UniversalSync;
}

// Tipos adicionais necessários para VIREON
export interface CognitiveMetrics {
  consciousness_level: number;
  awareness_depth: number;
  learning_efficiency: number;
  adaptation_rate: number;
  evolution_progress: number;
}

export interface AdaptiveSystemConfig {
  learningRate: number;
  adaptationThreshold: number;
  evolutionTargets: EvolutionTargets;
}

export interface EvolutionConfig {
  enableEvolution: boolean;
  evolutionRate: number;
  targetLevel: number;
  adaptationThreshold: number;
}

export interface EvolutionTargets {
  consciousness_level: number;
  symbiotic_level: number;
  system_coherence: number;
}

export interface SystemState {
  consciousness_level: number;
  symbiotic_level: number;
  system_coherence: number;
  evolution_progress: number;
  timestamp: number;
}

export interface EvolutionStep {
  type: string;
  intensity: number;
  duration: number;
  validation_criteria: any;
}

export interface AdaptationEntry {
  timestamp: number;
  state: SystemState;
  patterns: any;
  adjustments: any;
  previous_level: number;
}

export interface EvolutionState {
  current_level: number;
  target_level: number;
  evolution_rate: number;
  stability: number;
}

export interface IntegratedContext {
  current: any;
  environmental: any;
  system: any;
}

export interface ConsciousnessTargets {
  awareness_depth: number;
  learning_efficiency: number;
  adaptation_rate: number;
}

export interface PatternRecognitionSystem {
  recognizePatterns(data: any): any;
  updatePatterns(patterns: any): void;
}

export interface ContextAwarenessSystem {
  getContext(): any;
  updateContext(context: any): void;
}

export interface AdaptiveLearningSystem {
  learn(data: any): void;
  adapt(strategy: any): void;
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