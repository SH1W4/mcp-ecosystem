/**
 * Módulo Simbiótico VIREON
 * Sistema de evolução e monitoramento simbiótico
 */

export { SymbioticEvolution } from './evolution';
export { SymbioticMonitoring } from './monitoring';
export * from './types';

// Configuração padrão do módulo simbiótico
export const DEFAULT_SYMBIONT_CONFIG = {
  bootstrap: {
    symbiotic_core_init: {
      automated: true,
      description: 'Inicialização do núcleo simbiótico',
      triggers: ['ecosystem:start'],
      dependencies: ['monitoring', 'evolution']
    },
    symbiotic_analysis: {
      automated: true,
      description: 'Análise simbiótica contínua',
      triggers: ['metrics:collected'],
      outputs: ['evolution:trigger']
    }
  },
  integration: {
    vireon_bridge: {
      automated: true,
      description: 'Ponte de integração VIREON',
      triggers: ['project:created', 'environment:changed'],
      capabilities: {
        consciousness_sync: true,
        evolution_guidance: true,
        metrics_collection: true
      },
      adaptation_level: 0.75,
      sync_mode: 'bidirectional'
    },
    nexus_bridge: {
      automated: true,
      description: 'Ponte de integração NEXUS',
      triggers: ['module:registered'],
      capabilities: {
        module_sync: true,
        state_synchronization: true
      },
      adaptation_level: 0.62,
      sync_mode: 'unidirectional'
    }
  },
  evolution: {
    symbiotic_emergence: {
      automated: true,
      description: 'Emergência simbiótica',
      triggers: ['consciousness:level_change'],
      metrics: ['symbiotic_index', 'emergence_rate'],
      conditions: {
        minimum_level: '0.62',
        target_level: '0.75'
      }
    },
    symbiotic_evolution: {
      automated: true,
      description: 'Evolução simbiótica contínua',
      triggers: ['metrics:threshold_reached'],
      metrics: ['learning_efficiency', 'adaptation_rate']
    }
  },
  monitoring: {
    symbiotic_vitals: {
      automated: true,
      description: 'Monitoramento de vitais simbióticos',
      triggers: ['ecosystem:heartbeat'],
      metrics: ['integration_score', 'adaptation_rate', 'evolution_progress'],
      alerts: ['critical_threshold', 'evolution_stagnation']
    }
  }
};

// Métricas padrão do sistema
export const DEFAULT_METRICS_CONFIG = {
  symbiotic_vitals: {
    integration_score: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 75,
      description: 'Score de integração simbiótica',
      alert_levels: {
        warning: 60,
        critical: 40
      }
    },
    adaptation_rate: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 80,
      description: 'Taxa de adaptação do sistema',
      alert_levels: {
        warning: 50,
        critical: 30
      }
    },
    evolution_progress: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 75,
      description: 'Progresso da evolução simbiótica',
      alert_levels: {
        warning: 50,
        critical: 25
      }
    }
  },
  health_monitoring: {
    symbiotic_cohesion: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 90,
      description: 'Coesão simbiótica do sistema',
      alert_levels: {
        warning: 70,
        critical: 50
      }
    },
    resource_balance: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 85,
      description: 'Balanço de recursos do sistema',
      alert_levels: {
        warning: 60,
        critical: 40
      }
    },
    emergence_stability: {
      type: 'percentage',
      range: [0, 100] as [number, number],
      threshold: 92,
      description: 'Estabilidade da emergência',
      alert_levels: {
        warning: 80,
        critical: 60
      }
    }
  },
  evolution_metrics: {
    emergence_rate: {
      type: 'rate',
      range: [0, 1] as [number, number],
      threshold: 0.8,
      description: 'Taxa de emergência simbiótica',
      alert_levels: {
        warning: 0.5,
        critical: 0.3
      }
    },
    learning_efficiency: {
      type: 'efficiency',
      range: [0, 1] as [number, number],
      threshold: 0.85,
      description: 'Eficiência de aprendizado',
      alert_levels: {
        warning: 0.6,
        critical: 0.4
      }
    },
    symbiotic_index: {
      type: 'index',
      range: [0, 1] as [number, number],
      threshold: 0.75,
      description: 'Índice simbiótico geral',
      alert_levels: {
        warning: 0.5,
        critical: 0.3
      }
    }
  }
};