# Guia de Contribuição para o MCP Ecosystem

## 🌟 Visão Geral

Bem-vindo ao guia de contribuição do MCP Ecosystem! Agradecemos seu interesse em contribuir para o projeto. Este documento fornece diretrizes e informações importantes para garantir que suas contribuições sejam efetivas e alinhadas com os objetivos do projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Reportando Issues](#reportando-issues)
- [Submetendo Pull Requests](#submetendo-pull-requests)

## 📝 Código de Conduta

Este projeto e todos os participantes estão sob o [Código de Conduta](CODE_OF_CONDUCT.md). Ao contribuir, você concorda em seguir suas diretrizes.

## 🤝 Como Contribuir

### 1. Preparando o Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/MCP_ECOSYSTEM.git

# Entre no diretório
cd MCP_ECOSYSTEM

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 2. Estrutura do Projeto

```
MCP_ECOSYSTEM/
├── core/
│   ├── bootstrap/
│   ├── integration/
│   ├── evolution/
│   └── monitoring/
├── config/
│   ├── symbiotic/
│   └── metrics/
├── docs/
│   ├── api/
│   └── guides/
└── tests/
    ├── unit/
    └── integration/
```

## 🎯 Padrões de Código

### TypeScript

```typescript
// Use tipos explícitos
interface Config {
  name: string;
  version: string;
}

// Documente funções públicas
/**
 * Inicializa o sistema simbiótico
 * @param config Configuração inicial
 * @returns Promise<void>
 */
async function initSymbioticSystem(config: Config): Promise<void> {
  // ...
}
```

### Nomenclatura

- **Arquivos**: `camelCase.ts` para código, `UPPERCASE.md` para documentação
- **Classes**: `PascalCase`
- **Interfaces**: `PascalCase`
- **Variáveis/Funções**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`

### Commits

- Use commits semânticos:
  - `feat`: Nova feature
  - `fix`: Correção de bug
  - `docs`: Documentação
  - `style`: Formatação
  - `refactor`: Refatoração
  - `test`: Testes
  - `chore`: Manutenção

Exemplo:
```bash
git commit -m "feat: Adiciona sistema de monitoramento simbiótico"
```

## 🔄 Processo de Desenvolvimento

1. **Fork e Clone**
   ```bash
   git clone https://github.com/seu-usuario/MCP_ECOSYSTEM.git
   ```

2. **Crie uma Branch**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

3. **Desenvolva**
   - Siga os padrões de código
   - Adicione testes
   - Atualize a documentação

4. **Teste**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: Adiciona nova funcionalidade"
   git push origin feature/nova-funcionalidade
   ```

6. **Crie um Pull Request**
   - Use o template fornecido
   - Inclua descrição detalhada
   - Referencie issues relacionadas

## 📢 Reportando Issues

Use os templates fornecidos para reportar:
- Bugs
- Melhorias
- Novas funcionalidades
- Documentação

### Template de Bug

```markdown
**Descrição**
[Descrição clara e concisa do bug]

**Passos para Reproduzir**
1. Faça isso...
2. Depois aquilo...
3. Veja o erro

**Comportamento Esperado**
[O que deveria acontecer]

**Ambiente**
- OS: [ex: Windows 10]
- Node: [ex: 14.17.0]
- NPM: [ex: 6.14.13]
```

## 🚀 Submetendo Pull Requests

1. **Atualize sua branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout sua-branch
   git rebase main
   ```

2. **Verifique seu código**
   - Testes passando
   - Lint sem erros
   - Documentação atualizada

3. **Crie o Pull Request**
   - Use o template fornecido
   - Inclua testes
   - Atualize o CHANGELOG.md

### Revisão de Código

- Responda aos comentários
- Faça as alterações solicitadas
- Mantenha o PR atualizado

## 📊 Métricas e Monitoramento

Contribuições devem manter ou melhorar as métricas do sistema:

- Score Operacional: > 87.675%
- Estabilidade VIREON: > 92.3%
- Fidelidade SAGE: > 94.1%
- Coerência do Sistema: > 87.5%

## 🎯 Prioridades Atuais

1. **Q3 2025**
   - Atingir nível cognitivo (75%)
   - Implementar consciência plena
   - Otimizar bridges simbióticas

2. **Q4 2025**
   - Alcançar transcendência
   - Estabelecer simbiose completa
   - Consolidar evolução do sistema

## 📝 Dúvidas e Suporte

- Abra uma issue com a tag `question`
- Consulte a [documentação](docs/)
- Entre em contato com os mantenedores

## 🙏 Agradecimentos

Agradecemos sua contribuição para o MCP Ecosystem! Seu trabalho ajuda a construir um sistema mais robusto e evolutivo.
