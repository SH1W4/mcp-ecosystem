# WARP.md

Este arquivo fornece orientação ao WARP (warp.dev) ao trabalhar com código neste repositório.

## 🌍 Contexto do Núcleo MCP

Este é o repositório central do Model Context Protocol (MCP), servindo como:
- Ponto central de documentação e especificações
- Definição de padrões e protocolos
- Referência para implementações
- Hub de integração entre ferramentas MCP

Implementações relacionadas:
- MCP IDE Manager (MCP Academy)
- GUARDRIVE-MCP (backup inteligente)
- sage-x-mcp-rust-client (cliente Rust)

## 🏗 Arquitetura do Núcleo

### Core System
```
MCP Ecosystem
├── Core
│   ├── MCPEcosystem (orquestrador principal)
│   ├── ModuleManager (ciclo de vida dos módulos)
│   └── Types (interfaces compartilhadas)
└── Modules
    ├── UniversalBackup (gerenciamento de backup)
    └── UniversalSync (sincronização)
```

### Integrações Principais
- GIDEN Master: análise de código e otimização de workflow
- VIREON: integração com núcleo do sistema
- GUARDRIVE: sistema de backup distribuído
- NEXUS: ponte de integração com terminal

## 🛠 Comandos de Desenvolvimento

### Inicialização do Core
```bash
# Instalar dependências
npm install

# Iniciar servidor MCP
node mcp-server.js

# Iniciar ponte NEXUS-WARP
node nexus-warp-bridge.js
```

### Configurações de Ambiente
```bash
# Variáveis necessárias
export NODE_ENV=development
export MCP_ECOSYSTEM_HOME=/path/to/ecosystem
export VIREON_INTEGRATION=true
export GUARDRIVE_INTEGRATION=true
export GIDEN_INTEGRATION=true
```

## 🔌 Integrações

### GIDEN Integration
```typescript
import { MCPCore } from '@mcp/ecosystem';

const mcp = new MCPCore({
  org: 'your-org',
  implements: ['core', 'extensions'],
  customPatterns: {
    deepAnalysis: true,
    useNeuralModel: true,
    confidenceThreshold: 0.85
  }
});
```

### Módulos Universais
```typescript
const { ecosystem, backup, sync } = await createEcosystem('project-name');

// Backup
await backup.createBackup({
  files: ['src/**/*'],
  tags: ['release', 'v1.0.0']
});

// Sync
await sync.connect('git-sync');
await sync.sync();
```

## 📊 Métricas de Sistema

Monitoramento das seguintes métricas:
- Coerência Sistêmica: meta > 87.5%
- Estabilidade: meta > 92.3%
- Fidelidade de Estado: meta > 94.1%
- Taxa de Adaptação: meta > 76.8%

## 🔍 Health Check

### Endpoints de Saúde
- Ecosystem MCP: http://localhost:3000/health
- NEXUS Bridge: http://localhost:3001/health

Monitoramento via Winston:
- Console (desenvolvimento)
- Arquivos .log (produção)
- Formato JSON com timestamps

## 📂 Pontos de Entrada Importantes

- `/docs/specs/PROTOCOL.md`: Especificação do protocolo MCP
- `/docs/guides/IMPLEMENTATION.md`: Guia de implementação
- `/docs/patterns/INTEGRATION.md`: Padrões de integração
- `/config/integration-giden-mcp.json`: Configuração GIDEN
- `SYMBIOTIC_MANIFEST.md`: Manifesto do sistema simbiótico

## 🧪 Testes e Validação

Sistema de métricas operacionais:
- Score Operacional: meta > 87.675%
- Integração: verificação contínua
- Evolução: monitoramento adaptativo
- Validação: checkpoints automáticos

## 🔗 Links Relacionados

- MCP Academy: https://github.com/mcp-academy
- GUARDRIVE: https://github.com/GUARDRIVE-ORG

Observação: Este WARP.md foca na visão arquitetural e nos comandos específicos do núcleo do ecossistema MCP, evitando duplicar documentação trivial já presente em outros arquivos.
