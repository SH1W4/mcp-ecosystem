# API do Framework Simbiótico MCP

## 🔍 Overview

O Framework Simbiótico MCP expõe uma API robusta para integração e controle do sistema simbiótico. Esta documentação detalha os endpoints, tipos e funcionalidades disponíveis.

## 📚 Módulos Principais

### SymbioticModule

O módulo principal que coordena todo o sistema simbiótico.

```typescript
class SymbioticModule {
  constructor(ecosystem: MCPEcosystem);
  
  // Inicialização
  async initialize(): Promise<void>;
  
  // Monitoramento
  getHealthReport(): HealthReport;
  getEvolutionHistory(): EvolutionRecord[];
  
  // Controle
  async forceSyncBridges(): Promise<void>;
}
```

### SymbioticMonitoring

Responsável pelo monitoramento contínuo do sistema.

```typescript
class SymbioticMonitoring {
  constructor(metricsConfig: MetricsConfig);
  
  // Métricas
  updateMetric(name: string, value: number): void;
  getMetricValue(name: string): number;
  getMetricHistory(name: string): number[];
  
  // Relatórios
  getHealthReport(): HealthReport;
}
```

### SymbioticEvolution

Gerencia a evolução adaptativa do sistema.

```typescript
class SymbioticEvolution {
  constructor(evolutionConfig: any, monitoring: SymbioticMonitoring);
  
  // Evolução
  async evolve(): Promise<void>;
  getEvolutionHistory(): EvolutionRecord[];
}
```

## 📊 Tipos e Interfaces

### Configuração

```typescript
interface SymbioticConfig {
  bootstrap: {
    symbiotic_core_init: BootstrapConfig;
    symbiotic_analysis: BootstrapConfig;
  };
  integration: {
    arquimax_bridge: BridgeConfig;
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

interface BootstrapConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  params?: any;
  dependencies?: string[];
  outputs?: string[];
}

interface BridgeConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  capabilities: {
    [key: string]: boolean;
  };
  adaptation_level?: number;
  sync_mode?: string;
}

interface EvolutionConfig {
  automated: boolean;
  description: string;
  triggers: string[];
  metrics?: string[];
  conditions?: {
    [key: string]: string;
  };
}
```

### Monitoramento

```typescript
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
```

### Evolução

```typescript
interface EvolutionMetrics {
  symbiotic_index: number;
  emergence_rate: number;
  learning_efficiency: number;
  stability_score: number;
}

interface EvolutionArea {
  type: 'LEARNING' | 'EMERGENCE';
  currentValue: number;
  targetValue: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface EvolutionRecord {
  timestamp: number;
  metrics?: EvolutionMetrics;
  areas?: EvolutionArea[];
  error?: string;
  success: boolean;
}
```

## 🔄 Fluxos Principais

### Inicialização do Sistema

```typescript
// Criar e inicializar módulo simbiótico
const symbioticModule = new SymbioticModule(ecosystem);
await symbioticModule.initialize();

// O módulo automaticamente:
// 1. Carrega configurações
// 2. Inicializa sistema simbiótico
// 3. Configura bridges
// 4. Inicia monitoramento
// 5. Inicia ciclo evolutivo
```

### Monitoramento de Saúde

```typescript
// Obter relatório completo
const healthReport = symbioticModule.getHealthReport();

// Acessar métricas específicas
const integrationScore = healthReport.symbiotic_vitals.integration_score;
const systemStability = healthReport.health_status.symbiotic_cohesion;

// Verificar alertas
const alerts = healthReport.alerts;
```

### Controle Evolutivo

```typescript
// Forçar ciclo evolutivo
await symbioticModule.evolution.evolve();

// Verificar histórico de evolução
const evolutionHistory = symbioticModule.getEvolutionHistory();

// Analisar progresso
const lastEvolution = evolutionHistory[evolutionHistory.length - 1];
```

## 🛠 Extensão do Sistema

### Adicionar Nova Bridge

```typescript
// 1. Definir configuração
const newBridgeConfig: BridgeConfig = {
  automated: true,
  description: "Nova bridge de integração",
  triggers: ["on_demand"],
  capabilities: {
    custom_feature: true
  }
};

// 2. Implementar classe da bridge
class CustomBridge {
  constructor(config: BridgeConfig) {
    // Inicialização
  }

  async initialize() {
    // Setup da bridge
  }
}

// 3. Registrar no sistema
symbioticModule.registerBridge("custom", new CustomBridge(newBridgeConfig));
```

### Adicionar Nova Métrica

```typescript
// 1. Definir configuração da métrica
const newMetricConfig: MetricDefinition = {
  type: "float",
  range: [0.0, 1.0],
  threshold: 0.7,
  alert_levels: {
    warning: 0.6,
    critical: 0.5
  }
};

// 2. Registrar no monitoramento
symbioticModule.monitoring.registerMetric("custom_metric", newMetricConfig);

// 3. Atualizar valores
symbioticModule.monitoring.updateMetric("custom_metric", 0.8);
```

## ⚠️ Tratamento de Erros

O sistema utiliza um esquema padronizado de erros:

```typescript
class SymbioticError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
  }
}

// Exemplos de uso
throw new SymbioticError(
  "Falha na sincronização",
  "SYNC_ERROR",
  { bridge: "arquimax", lastSync: Date.now() }
);
```

## 🔒 Segurança

### Validação de Input

```typescript
// Exemplo de validação de métrica
function validateMetricValue(name: string, value: number) {
  const metric = this.findMetricDefinition(name);
  if (!metric) {
    throw new SymbioticError(
      `Métrica não encontrada: ${name}`,
      "INVALID_METRIC"
    );
  }

  const [min, max] = metric.range;
  if (value < min || value > max) {
    throw new SymbioticError(
      `Valor fora do range permitido: ${value}`,
      "INVALID_VALUE",
      { range: [min, max] }
    );
  }
}
```

### Controle de Acesso

```typescript
// Exemplo de decorator para controle de acesso
function requirePermission(permission: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      if (!this.hasPermission(permission)) {
        throw new SymbioticError(
          `Acesso negado: ${permission} requerido`,
          "ACCESS_DENIED"
        );
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
```

## 📝 Logs e Auditoria

O sistema mantém logs detalhados de todas as operações:

```typescript
// Exemplo de estrutura de log
interface SymbioticLog {
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR';
  component: string;
  action: string;
  details: any;
  context?: any;
}

// Exemplo de registro
function logOperation(operation: string, details: any) {
  const log: SymbioticLog = {
    timestamp: Date.now(),
    level: 'INFO',
    component: this.constructor.name,
    action: operation,
    details,
    context: this.getCurrentContext()
  };
  
  this.logger.record(log);
}
