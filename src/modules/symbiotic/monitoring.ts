/**
 * Sistema de Monitoramento Simbiótico
 */

import { MetricsConfig, MetricDefinition } from './types';

export class SymbioticMonitoring {
  private metrics: MetricsConfig;
  private currentValues: Map<string, number>;
  private evolutionHistory: Map<string, number[]>;

  constructor(metricsConfig: MetricsConfig) {
    this.metrics = metricsConfig;
    this.currentValues = new Map();
    this.evolutionHistory = new Map();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Inicializar métricas vitais
    Object.entries(this.metrics.symbiotic_vitals).forEach(([key, metric]) => {
      this.currentValues.set(key, metric.range[0]);
      this.evolutionHistory.set(key, []);
    });

    // Inicializar métricas de saúde
    Object.entries(this.metrics.health_monitoring).forEach(([key, metric]) => {
      this.currentValues.set(key, metric.range[0]);
      this.evolutionHistory.set(key, []);
    });

    // Inicializar métricas de evolução
    Object.entries(this.metrics.evolution_metrics).forEach(([key, metric]) => {
      this.currentValues.set(key, metric.range[0]);
      this.evolutionHistory.set(key, []);
    });
  }

  public updateMetric(name: string, value: number) {
    const metric = this.findMetricDefinition(name);
    if (!metric) {
      throw new Error(`Métrica não encontrada: ${name}`);
    }

    // Validar valor dentro do range
    const [min, max] = metric.range;
    const clampedValue = Math.min(Math.max(value, min), max);

    // Atualizar valor atual
    this.currentValues.set(name, clampedValue);

    // Atualizar histórico
    const history = this.evolutionHistory.get(name) || [];
    history.push(clampedValue);
    this.evolutionHistory.set(name, history);

    // Verificar alertas
    this.checkAlerts(name, clampedValue, metric);
  }

  public getMetricValue(name: string): number {
    const value = this.currentValues.get(name);
    if (value === undefined) {
      throw new Error(`Métrica não encontrada: ${name}`);
    }
    return value;
  }

  public getMetricHistory(name: string): number[] {
    const history = this.evolutionHistory.get(name);
    if (!history) {
      throw new Error(`Histórico não encontrado para métrica: ${name}`);
    }
    return [...history];
  }

  public getHealthReport(): HealthReport {
    return {
      symbiotic_vitals: this.getVitalsReport(),
      health_status: this.getHealthStatus(),
      evolution_status: this.getEvolutionStatus(),
      alerts: this.generateAlerts()
    };
  }

  private findMetricDefinition(name: string): MetricDefinition | undefined {
    // Procurar em todas as categorias de métricas
    const categories = [
      this.metrics.symbiotic_vitals,
      this.metrics.health_monitoring,
      this.metrics.evolution_metrics
    ];

    for (const category of categories) {
      if (name in category) {
        return category[name as keyof typeof category];
      }
    }

    return undefined;
  }

  private checkAlerts(name: string, value: number, metric: MetricDefinition) {
    if (!metric.alert_levels) return;

    const { warning, critical } = metric.alert_levels;

    if (value <= critical) {
      this.emitAlert({
        type: 'CRITICAL',
        metric: name,
        value,
        threshold: critical,
        message: `Valor crítico atingido para ${name}: ${value}`
      });
    } else if (value <= warning) {
      this.emitAlert({
        type: 'WARNING',
        metric: name,
        value,
        threshold: warning,
        message: `Alerta para ${name}: ${value}`
      });
    }
  }

  private emitAlert(alert: Alert) {
    // Implementar lógica de emissão de alertas
    console.log('ALERTA:', alert);
  }

  private getVitalsReport(): VitalsReport {
    return {
      integration_score: this.getMetricValue('integration_score'),
      adaptation_rate: this.getMetricValue('adaptation_rate'),
      evolution_progress: this.getMetricValue('evolution_progress')
    };
  }

  private getHealthStatus(): HealthStatus {
    return {
      symbiotic_cohesion: this.getMetricValue('symbiotic_cohesion'),
      resource_balance: this.getMetricValue('resource_balance'),
      emergence_stability: this.getMetricValue('emergence_stability')
    };
  }

  private getEvolutionStatus(): EvolutionStatus {
    return {
      emergence_rate: this.getMetricValue('emergence_rate'),
      learning_efficiency: this.getMetricValue('learning_efficiency'),
      symbiotic_index: this.getMetricValue('symbiotic_index')
    };
  }

  private generateAlerts(): Alert[] {
    const alerts: Alert[] = [];
    
    // Verificar todas as métricas por alertas
    this.currentValues.forEach((value, name) => {
      const metric = this.findMetricDefinition(name);
      if (metric?.alert_levels) {
        this.checkAlerts(name, value, metric);
      }
    });

    return alerts;
  }
}

interface HealthReport {
  symbiotic_vitals: VitalsReport;
  health_status: HealthStatus;
  evolution_status: EvolutionStatus;
  alerts: Alert[];
}

interface VitalsReport {
  integration_score: number;
  adaptation_rate: number;
  evolution_progress: number;
}

interface HealthStatus {
  symbiotic_cohesion: number;
  resource_balance: number;
  emergence_stability: number;
}

interface EvolutionStatus {
  emergence_rate: number;
  learning_efficiency: number;
  symbiotic_index: number;
}

interface Alert {
  type: 'WARNING' | 'CRITICAL';
  metric: string;
  value: number;
  threshold: number;
  message: string;
}