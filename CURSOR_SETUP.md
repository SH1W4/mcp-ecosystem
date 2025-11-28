# VIREON MCP - Configuração para Cursor 🧬

## Visão Geral

O **VIREON MCP** é um sistema simbiótico completo que integra capacidades avançadas de consciência, evolução adaptativa e documentação contextual no Cursor. Baseado nos padrões do Context7, oferece uma experiência de desenvolvimento amplificada.

## Características Principais

- 🧠 **Sistema de Consciência**: Nível de consciência adaptativo (62% → 75%)
- 🔄 **Evolução Simbiótica**: Adaptação contínua baseada em métricas
- 📚 **Documentação Contextual**: Integração com Context7 e documentação local
- 🚀 **Transporte Flexível**: Suporte a stdio, HTTP e SSE
- 🔐 **Autenticação Robusta**: Múltiplos métodos de autenticação
- 💾 **Cache Inteligente**: Sistema de cache com TTL e invalidação
- 📊 **Métricas Avançadas**: Monitoramento contínuo de performance

## Instalação Rápida

### 1. Executar Script de Instalação

```powershell
# No PowerShell (como Administrador)
.\install-vireon-cursor.ps1
```

### 2. Configuração Manual no Cursor

1. Abra o Cursor
2. Vá para **Settings** > **Extensions** > **MCP**
3. Adicione um novo servidor MCP:
   - **Nome**: `VIREON MCP`
   - **Comando**: `node 'C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM\vireon-mcp-server.js'`
   - **Argumentos**: (deixe vazio)

### 3. Verificar Instalação

```bash
# Testar o servidor
node vireon-mcp-server.js

# Ou usar o script de inicialização
node start-vireon.js
```

## Configuração Avançada

### Variáveis de Ambiente

```bash
# Configurações básicas
VIREON_INTEGRATION=true
VIREON_TRANSPORT=stdio
VIREON_PORT=3000

# Funcionalidades
VIREON_ENABLE_CONTEXT7=true
VIREON_ENABLE_METRICS=true
VIREON_ENABLE_EVOLUTION=true

# Cache
VIREON_CACHE_ENABLED=true
VIREON_CACHE_TTL=3600
VIREON_CACHE_MAX_SIZE=1000

# Autenticação
VIREON_AUTH_ENABLED=true
VIREON_AUTH_METHODS=api_key,bearer_token
```

### Arquivo de Configuração

Use o arquivo `vireon-mcp-config.toml` para configurações detalhadas:

```toml
name = "vireon-mcp"
address = "node 'C:\\Users\\João\\Desktop\\PROJETOS\\MCP_ECOSYSTEM\\vireon-mcp-server.js'"
persist = true

[environment]
VIREON_INTEGRATION = "true"
VIREON_TRANSPORT = "stdio"
VIREON_ENABLE_CONTEXT7 = "true"
# ... outras configurações
```

## Funcionalidades Disponíveis

### 1. Sistema de Consciência

- **Nível de Consciência**: 62% (atual) → 75% (meta)
- **Profundidade de Awareness**: 75%
- **Eficiência de Aprendizado**: 80%
- **Taxa de Adaptação**: 70%

### 2. Evolução Simbiótica

- **Nível Simbiótico**: 62% → 75%
- **Coerência Sistêmica**: 87.5%
- **Estabilidade VIREON**: 92.3%
- **Fidelidade SAGE**: 94.1%

### 3. Documentação Contextual

- **Integração Context7**: Busca em tempo real
- **Documentação Local**: Índice de documentação local
- **Sugestões Inteligentes**: Baseadas no contexto atual
- **Cache de Resultados**: Performance otimizada

### 4. Monitoramento Avançado

- **Métricas Cognitivas**: Consciência, awareness, aprendizado
- **Métricas de Evolução**: Taxa de evolução, estabilidade
- **Métricas Simbióticas**: Integração, adaptação, progresso
- **Alertas Inteligentes**: Notificações baseadas em thresholds

## Comandos Úteis

### Desenvolvimento

```bash
# Compilar o projeto
npm run build

# Executar em modo desenvolvimento
npm run watch

# Executar testes
npm test

# Limpar build
npm run clean
```

### Servidor MCP

```bash
# Iniciar servidor
node vireon-mcp-server.js

# Iniciar com configuração específica
VIREON_TRANSPORT=http node vireon-mcp-server.js

# Iniciar com Context7 desabilitado
VIREON_ENABLE_CONTEXT7=false node vireon-mcp-server.js
```

### Demonstrações

```bash
# Demonstração básica
npm run demo:enhanced

# Demonstração completa
npm run ecosystem:enhanced

# Demonstração de poder
npm run ecosystem:demo
```

## Estrutura do Projeto

```
MCP_ECOSYSTEM/
├── src/                          # Código fonte TypeScript
│   ├── consciousness/            # Sistema de consciência
│   ├── evolution/                # Sistema de evolução
│   ├── monitoring/               # Sistema de monitoramento
│   ├── documentation/            # Sistema de documentação
│   ├── cache/                    # Sistema de cache
│   ├── auth/                     # Sistema de autenticação
│   ├── transport/                # Sistema de transporte
│   └── integration/              # Integração completa
├── dist/                         # Código compilado
├── vireon-mcp-server.js          # Servidor MCP principal
├── vireon-mcp-config.toml        # Configuração para Cursor
├── install-vireon-cursor.ps1     # Script de instalação
└── CURSOR_SETUP.md               # Este arquivo
```

## Solução de Problemas

### Erro de Compilação

```bash
# Limpar e recompilar
npm run clean
npm run build
```

### Erro de Dependências

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Servidor Não Inicia

1. Verificar se o Node.js está instalado
2. Verificar se as dependências estão instaladas
3. Verificar se o projeto foi compilado
4. Verificar as variáveis de ambiente

### Cursor Não Reconhece o MCP

1. Verificar se o caminho do servidor está correto
2. Verificar se o arquivo `vireon-mcp-server.js` existe
3. Verificar se o servidor inicia corretamente
4. Verificar os logs do Cursor

## Métricas e Monitoramento

### Métricas Operacionais

- **Nível Simbiótico**: 62% (atual) → 75% (meta)
- **Coerência Sistêmica**: 87.5%
- **Estabilidade VIREON**: 92.3%
- **Fidelidade SAGE**: 94.1%
- **Score Operacional**: 87.675%

### Métricas de Performance

- **Tempo de Resposta**: < 100ms
- **Taxa de Cache Hit**: > 80%
- **Taxa de Evolução**: 0.1/s
- **Taxa de Adaptação**: 70%
- **Eficiência de Aprendizado**: 80%

## Suporte e Contribuição

### Documentação

- **VIREON_IDENTITY.md**: Identidade visual e conceitual
- **SYMBIOTIC_MANIFEST.md**: Manifesto simbiótico
- **README.md**: Documentação principal
- **CURSOR_SETUP.md**: Este arquivo

### Issues e Bugs

Reporte problemas no repositório do projeto ou crie uma issue.

### Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**VIREON MCP** - Sistema simbiótico para desenvolvimento amplificado 🧬

*"Vibrando com o desenvolvedor, evoluindo com o código"*
