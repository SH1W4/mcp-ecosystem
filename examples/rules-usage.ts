/**
 * Exemplo de uso do sistema de regras do MCP_ECOSYSTEM
 */

import {
  createRulesAPI,
  createRule,
  RuleType,
  RulePriority,
  RuleStatus,
  RuleTemplates,
} from '../src/rules/index.js';

async function demonstrateRulesSystem() {
  console.log('🔧 Inicializando sistema de regras...');

  // Cria uma instância da API com logs habilitados
  const rulesAPI = createRulesAPI({
    enableLogging: true,
    enableStats: true,
    enableCaching: true,
  });

  // 1. Criando regras usando o builder
  console.log('\n📝 Criando regras usando o builder...');

  const customSecurityRule = createRule()
    .withMetadata(
      'custom-security-01',
      'Bloqueio de Acesso Root',
      'Impede tentativas de acesso como usuário root',
      '1.0.0',
      'Security Team'
    )
    .ofType(RuleType.SECURITY)
    .withPriority(RulePriority.CRITICAL)
    .withStatus(RuleStatus.ACTIVE)
    .withTags('security', 'authentication', 'root')
    .inScopes('mcp', 'tools')
    .inEnvironments('prod', 'staging')
    .whenEquals('userId', 'root')
    .thenBlock('Acesso negado: usuário root não permitido')
    .thenLog('Tentativa de acesso como root detectada', { severity: 'critical' })
    .build();

  console.log('✅ Regra customizada criada:', customSecurityRule.metadata.name);

  // 2. Usando templates predefinidos
  console.log('\n🎨 Criando regras usando templates...');

  const performanceRule = RuleTemplates.performanceRule(
    'performance-monitor-01',
    'Monitor de Performance de API',
    'Monitora tempo de resposta das APIs',
    3000
  ).build();

  console.log('✅ Regra de performance criada:', performanceRule.metadata.name);

  // 3. Criando conjunto de regras
  console.log('\n📦 Criando conjunto de regras...');

  const customRuleSet = {
    id: 'demo-rules',
    name: 'Regras de Demonstração',
    description: 'Conjunto de regras para demonstração do sistema',
    version: '1.0.0',
    rules: [customSecurityRule, performanceRule],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Demo System',
    },
  };

  // 4. Registrando o conjunto de regras
  const result = await rulesAPI.registerRuleSet(customRuleSet);
  if (result.success) {
    console.log('✅ Conjunto de regras registrado com sucesso');
  } else {
    console.error('❌ Erro ao registrar conjunto de regras:', result.error);
    return;
  }

  // 5. Carregando regras padrão do sistema
  console.log('\n🔧 Carregando regras padrão do sistema...');

  try {
    const coreRulesContent = await import('../src/rules/config/rules.json', {
      assert: { type: 'json' },
    });
    const coreRulesResult = await rulesAPI.createRuleSetFromJSON(
      JSON.stringify(coreRulesContent.default)
    );

    if (coreRulesResult.ruleSet) {
      await rulesAPI.registerRuleSet(coreRulesResult.ruleSet);
      console.log('✅ Regras principais carregadas');
    }
  } catch (error) {
    console.log('⚠️  Carregando regras de exemplo alternativas...');
    await rulesAPI.createSampleRules();
  }

  // 6. Listando todas as regras registradas
  console.log('\n📋 Listando regras registradas...');

  const ruleSets = await rulesAPI.listRuleSets();
  console.log(`📊 Total de conjuntos de regras: ${ruleSets.length}`);

  for (const ruleSet of ruleSets) {
    console.log(`  - ${ruleSet.name} (${ruleSet.rules.length} regras)`);
  }

  // 7. Executando regras com contexto simulado
  console.log('\n🚀 Executando regras com contextos simulados...');

  // Contexto 1: Tentativa de acesso como root
  const rootAccessContext = rulesAPI
    .createContextBuilder()
    .setEnvironment('prod')
    .setSession('session-123', 'root', ['user'])
    .setMCPRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: 'run_command', arguments: { command: 'ls -la' } },
      id: 1,
    })
    .build();

  console.log('\n🔍 Testando acesso como root...');
  const rootResult = await rulesAPI.executeRules(rootAccessContext, ['mcp', 'tools']);
  console.log(`📊 Resultado: ${rootResult.success ? 'Permitido' : 'Bloqueado'}`);
  console.log(`⏱️  Tempo de execução: ${rootResult.totalExecutionTime}ms`);

  if (rootResult.results.length > 0) {
    for (const result of rootResult.results) {
      if (result.matched) {
        console.log(
          `  🚫 Regra ${result.ruleId} aplicada: ${result.actions.map(a => a.type).join(', ')}`
        );
      }
    }
  }

  // Contexto 2: Comando perigoso
  const dangerousCommandContext = rulesAPI
    .createContextBuilder()
    .setEnvironment('prod')
    .setSession('session-456', 'user1', ['user'])
    .setToolContext({
      toolName: 'run_command',
      parameters: { command: 'rm -rf /important-data' },
      timestamp: new Date(),
    })
    .build();

  console.log('\n🔍 Testando comando perigoso...');
  const dangerousResult = await rulesAPI.executeRules(dangerousCommandContext, [
    'tools',
  ]);
  console.log(`📊 Resultado: ${dangerousResult.success ? 'Permitido' : 'Bloqueado'}`);

  if (dangerousResult.results.length > 0) {
    for (const result of dangerousResult.results) {
      if (result.matched) {
        console.log(`  🚫 Regra ${result.ruleId} aplicada`);
        for (const action of result.actions) {
          console.log(`    - ${action.type}: ${action.message}`);
        }
      }
    }
  }

  // Contexto 3: Operação normal (deve ser permitida)
  const normalContext = rulesAPI
    .createContextBuilder()
    .setEnvironment('dev')
    .setSession('session-789', 'user2', ['user'])
    .setToolContext({
      toolName: 'file_read',
      parameters: { path: '/safe/document.txt' },
      timestamp: new Date(),
    })
    .build();

  console.log('\n🔍 Testando operação normal...');
  const normalResult = await rulesAPI.executeRules(normalContext, ['tools']);
  console.log(`📊 Resultado: ${normalResult.success ? 'Permitido' : 'Bloqueado'}`);
  console.log(`📝 Regras avaliadas: ${normalResult.results.length}`);

  // 8. Buscando regras por critérios
  console.log('\n🔍 Buscando regras por critérios...');

  const securityRules = await rulesAPI.searchRules({
    type: RuleType.SECURITY,
    status: RuleStatus.ACTIVE,
  });
  console.log(`🔒 Regras de segurança ativas: ${securityRules.length}`);

  const performanceRules = await rulesAPI.searchRules({
    type: RuleType.PERFORMANCE,
  });
  console.log(`⚡ Regras de performance: ${performanceRules.length}`);

  // 9. Estatísticas de execução
  console.log('\n📊 Estatísticas de execução...');

  const stats = await rulesAPI.getExecutionStats();
  console.log('📈 Estatísticas por regra:');

  for (const [ruleId, stat] of Object.entries(stats)) {
    console.log(
      `  - ${ruleId}: ${stat.count} execuções, tempo médio: ${stat.averageTime.toFixed(2)}ms`
    );
  }

  // 10. Exportando conjunto de regras
  console.log('\n💾 Exportando conjunto de regras...');

  const exportResult = await rulesAPI.exportRuleSetToJSON('demo-rules');
  if (exportResult.json) {
    console.log('✅ Regras exportadas com sucesso');
    console.log(`📄 Tamanho do JSON: ${exportResult.json.length} caracteres`);
  }

  console.log('\n✨ Demonstração concluída!');
}

// Executar a demonstração se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRulesSystem().catch(console.error);
}

export { demonstrateRulesSystem };
