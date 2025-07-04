# MCP Ecosystem - Guia Completo

## 🎯 Visão Geral

O MCP Ecosystem é uma plataforma unificada para desenvolvimento e gerenciamento de servidores Model Context Protocol (MCP). Este documento serve como guia definitivo para instalação, navegação e domínio completo do ecossistema.

## 📁 Estrutura do Projeto

```
MCP_ECOSYSTEM/
├── servers/                  # Servidores MCP
│   └── ecosystem-mcp/       # Servidor MCP principal
├── AIDEN_MCP/               # Integração com IA
├── clients/                 # Clientes MCP
├── config/                  # Configurações
├── core/                    # Componentes principais
│   ├── python/             # Implementações Python
│   └── rust/               # Implementações Rust
├── docs/                    # Documentação
├── examples/               # Exemplos de uso
├── tests/                  # Testes
└── toolkit/                # Ferramentas auxiliares
```

## 🚀 Início Rápido

### Pré-requisitos

```powershell
# Verificar versões
node --version    # Deve ser ≥ 18
python --version  # Deve ser ≥ 3.10
git --version     # Deve ser ≥ 2.40
```

### Instalação

1. **Clone o repositório:**
   ```powershell
   git clone https://github.com/seu-usuario/MCP_ECOSYSTEM.git
   cd MCP_ECOSYSTEM
   ```

2. **Instale as dependências:**
   ```powershell
   # Node.js
   npm install

   # Python
   pip install -r requirements.txt
   ```

3. **Configure o ambiente:**
   ```powershell
   # Copiar arquivo de exemplo
   Copy-Item .env.example .env
   ```

4. **Instale o servidor MCP principal:**
   ```powershell
   cd servers/ecosystem-mcp
   npm install
   ```

## 🔧 Configuração do Warp

1. **Configure o arquivo MCP servers:**
   ```json
   {
     "mcpServers": {
       "ecosystem-mcp": {
         "command": "node",
         "args": [
           "C:\\Users\\[SEU_USUARIO]\\Desktop\\PROJETOS\\MCP_ECOSYSTEM\\servers\\ecosystem-mcp\\src\\index.js"
         ],
         "env": {
           "NODE_ENV": "production",
           "LOG_LEVEL": "info"
         },
         "working_directory": "C:\\Users\\[SEU_USUARIO]\\Desktop\\PROJETOS\\MCP_ECOSYSTEM\\servers\\ecosystem-mcp",
         "start_on_launch": true
       }
     }
   }
   ```

2. **Local do arquivo:**
   ```
   %APPDATA%\Warp\mcp_servers.json
   ```

## 📚 Componentes Principais

### 1. Ecosystem MCP Server
- **Localização**: `/servers/ecosystem-mcp`
- **Propósito**: Servidor MCP principal com ferramentas essenciais
- **Comandos**:
  ```powershell
  cd servers/ecosystem-mcp
  npm start           # Iniciar servidor
  npm run dev        # Modo desenvolvimento
  npm test          # Executar testes
  ```

### 2. AIDEN MCP
- **Localização**: `/AIDEN_MCP`
- **Propósito**: Integração com IA e análise avançada
- **Arquivos principais**:
  - `analyze_with_mcp.py`: Análise com MCP
  - `enhanced_server.py`: Servidor aprimorado
  - `MCP_ANALYSIS_REPORT.md`: Relatórios de análise

### 3. Core
- **Localização**: `/core`
- **Componentes**:
  - **Python**: Gerenciamento de sessão
  - **Rust**: Motor de regras de negócio

## 🛠 Desenvolvimento

### Adicionar Nova Ferramenta MCP

1. **Criar arquivo de ferramenta:**
   ```javascript
   // servers/ecosystem-mcp/src/tools/my-tool.js
   export const myTool = {
     name: 'my_tool',
     description: 'Descrição da ferramenta',
     inputSchema: {
       type: 'object',
       properties: {
         // Definir propriedades
       }
     },
     handler: async (args) => {
       // Implementar lógica
     }
   };
   ```

2. **Registrar no servidor:**
   ```javascript
   // Em tools/index.js
   import { myTool } from './my-tool.js';
   export const tools = [myTool, ...outrasFerramentas];
   ```

### Testes

```powershell
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Cobertura
npm run test:coverage
```

## 📊 Monitoramento

### Logs
- **Desenvolvimento**: Console colorido
- **Produção**: Arquivos JSON em `/logs`
- **Níveis**: error, warn, info, debug

### Métricas
- CPU e memória
- Tempo de resposta
- Requisições por segundo

## 🔍 Troubleshooting

### Problemas Comuns

1. **Servidor não conecta:**
   ```powershell
   # Verificar processo
   Get-Process | Where-Object {$_.ProcessName -like "*node*"}
   
   # Verificar logs
   Get-Content ./logs/ecosystem-mcp.log
   ```

2. **Erros de dependência:**
   ```powershell
   # Limpar e reinstalar
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

## 📈 Próximos Passos

1. **Básico**
   - [x] Instalação
   - [x] Configuração Warp
   - [ ] Primeira ferramenta

2. **Intermediário**
   - [ ] Criar servidor personalizado
   - [ ] Integrar com AIDEN
   - [ ] Implementar logs

3. **Avançado**
   - [ ] Desenvolver plugins
   - [ ] Criar ferramentas complexas
   - [ ] Contribuir com o core

## 🔗 Links Úteis

- [Documentação MCP](docs/README.md)
- [Exemplos](examples/README.md)
- [Guia de Contribuição](CONTRIBUTING.md)

## 📝 Notas de Desenvolvimento

- Use `npm run dev` para desenvolvimento
- Sempre teste localmente antes de commit
- Siga o padrão de commits convencional
- Mantenha logs informativos

## 🤝 Suporte

Para suporte e dúvidas:
1. Consulte a documentação
2. Verifique issues existentes
3. Abra uma nova issue

## 📜 Licença

MIT - veja [LICENSE](LICENSE) para detalhes

