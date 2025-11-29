/**
 * Enhanced MCP Ecosystem Demo
 * Demonstra as capacidades aprimoradas baseadas nos padrões do Context7
 */

import { 
  createVIREONQuick,
  VIREONMCPEcosystem,
  FlexibleTransportManager,
  SmartCache,
  RobustAuthSystem,
  ContextualDocumentationSystem
} from '../src/index.js';

/**
 * Demonstração do ecossistema aprimorado
 */
async function demonstrateEnhancedEcosystem() {
  console.log('🚀 Iniciando demonstração do MCP Ecosystem Enhanced...\n');

  try {
    // 1. Criar VIREON
    console.log('📦 Criando VIREON MCP Ecosystem...');
    const ecosystem = await createVIREONQuick({
      transport: 'stdio',
      enableContext7: true
    });

    // 2. Demonstrar capacidades de documentação contextual
    console.log('\n📚 Testando documentação contextual...');
    await demonstrateContextualDocumentation(ecosystem);

    // 3. Demonstrar sistema de cache inteligente
    console.log('\n💾 Testando cache inteligente...');
    await demonstrateSmartCache();

    // 4. Demonstrar sistema de autenticação robusto
    console.log('\n🔐 Testando autenticação robusta...');
    await demonstrateRobustAuth();

    // 5. Demonstrar evolução adaptativa
    console.log('\n🧬 Testando evolução adaptativa...');
    await demonstrateAdaptiveEvolution(ecosystem);

    // 6. Mostrar métricas do sistema
    console.log('\n📊 Métricas do sistema:');
    await showSystemMetrics(ecosystem);

    // 7. Parar ecossistema
    console.log('\n🛑 Parando ecossistema...');
    await ecosystem.stop();

    console.log('\n✅ Demonstração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
  }
}

/**
 * Demonstra capacidades de documentação contextual
 */
async function demonstrateContextualDocumentation(ecosystem: VIREONMCPEcosystem) {
  try {
    // Buscar documentação para Next.js
    console.log('  🔍 Buscando documentação para Next.js...');
    const nextjsDocs = await ecosystem.searchDocumentation(
      'Next.js middleware authentication',
      'Estou criando um middleware de autenticação para Next.js'
    );
    
    console.log(`  📄 Encontradas ${nextjsDocs.length} referências de documentação`);

    // Buscar sugestões contextuais
    console.log('  💡 Obtendo sugestões contextuais...');
    const codeContext = `
      import { NextRequest, NextResponse } from 'next/server';
      
      export function middleware(request: NextRequest) {
        // Verificar autenticação aqui
        const token = request.cookies.get('auth-token');
        if (!token) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    `;
    
    const suggestions = await ecosystem.getContextualSuggestions(
      codeContext,
      200, // Posição do cursor
      'typescript'
    );
    
    console.log(`  🎯 ${suggestions.length} sugestões contextuais geradas`);

  } catch (error) {
    console.error('  ❌ Erro na documentação contextual:', error.message);
  }
}

/**
 * Demonstra sistema de cache inteligente
 */
async function demonstrateSmartCache() {
  try {
    const cache = new SmartCache({
      maxSize: 10 * 1024 * 1024, // 10MB
      maxEntries: 100,
      defaultTtl: 60000 // 1 minuto
    });

    // Armazenar dados
    console.log('  💾 Armazenando dados no cache...');
    cache.set('user:123', { name: 'João', email: 'joao@example.com' }, {
      ttl: 30000,
      tags: ['user', 'profile']
    });

    cache.set('project:456', { name: 'MCP Ecosystem', status: 'active' }, {
      ttl: 60000,
      tags: ['project', 'development']
    });

    // Recuperar dados
    console.log('  🔍 Recuperando dados do cache...');
    const user = cache.get('user:123');
    const project = cache.get('project:456');

    console.log(`  ✅ Usuário: ${user?.name} (${user?.email})`);
    console.log(`  ✅ Projeto: ${project?.name} (${project?.status})`);

    // Buscar por tags
    console.log('  🏷️ Buscando por tags...');
    const userData = cache.getByTags(['user']);
    console.log(`  📊 ${userData.length} entradas encontradas com tag 'user'`);

    // Mostrar métricas
    const metrics = cache.getMetrics();
    console.log(`  📈 Taxa de acerto: ${(metrics.hitRate * 100).toFixed(1)}%`);
    console.log(`  📊 Entradas: ${metrics.entryCount}`);

    cache.destroy();

  } catch (error) {
    console.error('  ❌ Erro no cache:', error.message);
  }
}

/**
 * Demonstra sistema de autenticação robusto
 */
async function demonstrateRobustAuth() {
  try {
    const authSystem = new RobustAuthSystem({
      enableRateLimit: true,
      maxRequestsPerMinute: 10
    });

    // Testar chave API válida
    console.log('  🔑 Testando autenticação...');
    const validApiKey = 'sk-1234567890abcdef1234567890abcdef';
    const authResult = authSystem.validateApiKey(validApiKey);
    
    if (authResult.success) {
      console.log(`  ✅ Autenticação bem-sucedida para usuário: ${authResult.userId}`);
      console.log(`  🔐 Permissões: ${authResult.permissions?.join(', ')}`);
    } else {
      console.log(`  ❌ Falha na autenticação: ${authResult.error}`);
    }

    // Testar rate limiting
    console.log('  ⏱️ Testando rate limiting...');
    for (let i = 0; i < 12; i++) {
      const rateLimitResult = authSystem.checkRateLimit('test-user');
      if (!rateLimitResult.success) {
        console.log(`  🚫 Rate limit atingido após ${i + 1} requisições`);
        break;
      }
    }

    // Mostrar estatísticas
    const stats = authSystem.getAuthStats();
    console.log(`  📊 Sessões ativas: ${stats.activeSessions}`);
    console.log(`  📈 Entradas de rate limit: ${stats.rateLimitEntries}`);

    authSystem.destroy();

  } catch (error) {
    console.error('  ❌ Erro na autenticação:', error.message);
  }
}

/**
 * Demonstra evolução adaptativa
 */
async function demonstrateAdaptiveEvolution(ecosystem: VIREONMCPEcosystem) {
  try {
    console.log('  🧬 Iniciando evolução adaptativa...');
    
    // Evoluir consciência
    await ecosystem.triggerEvolution('consciousness', 'medium');
    console.log('  🧠 Evolução de consciência concluída');

    // Evoluir performance
    await ecosystem.triggerEvolution('performance', 'high');
    console.log('  ⚡ Evolução de performance concluída');

    // Evoluir integração
    await ecosystem.triggerEvolution('integration', 'low');
    console.log('  🔗 Evolução de integração concluída');

  } catch (error) {
    console.error('  ❌ Erro na evolução:', error.message);
  }
}

/**
 * Mostra métricas do sistema
 */
async function showSystemMetrics(ecosystem: VIREONMCPEcosystem) {
  try {
    const metrics = ecosystem.getMetrics();
    const stats = ecosystem.getDetailedStats();

    console.log('  📊 Métricas do Ecossistema:');
    console.log(`    🧬 Nível Simbiótico: ${metrics.symbioticLevel}%`);
    console.log(`    🔗 Coerência Sistêmica: ${metrics.systemCoherence}%`);
    console.log(`    🧠 Fidelidade SAGE: ${metrics.sageFidelity}%`);
    console.log(`    ⚡ Score Operacional: ${metrics.operationalScore}%`);
    console.log(`    🎯 Precisão de Contexto: ${metrics.contextAccuracy}%`);
    console.log(`    📚 Cobertura de Documentação: ${metrics.documentationCoverage}%`);
    console.log(`    💾 Taxa de Acerto do Cache: ${metrics.cacheHitRate}%`);

    console.log('\n  📈 Estatísticas Detalhadas:');
    console.log(`    🔌 Provedores de Documentação: ${stats.documentation.providers}`);
    console.log(`    📄 Documentos em Cache: ${stats.documentation.cachedDocs}`);
    console.log(`    🔍 Buscas em Cache: ${stats.documentation.cachedSearches}`);
    console.log(`    📚 Índice de Bibliotecas: ${stats.documentation.libraryIndex}`);

  } catch (error) {
    console.error('  ❌ Erro ao obter métricas:', error.message);
  }
}

/**
 * Demonstração de transporte flexível
 */
async function demonstrateFlexibleTransport() {
  console.log('\n🚀 Testando transporte flexível...');
  
  try {
    const transportManager = new FlexibleTransportManager();
    
    // Configurar transporte HTTP
    const httpConfig = {
      type: 'http' as const,
      port: 3001
    };
    
    console.log('  🌐 Iniciando transporte HTTP...');
    await transportManager.startTransport(httpConfig);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parar transporte
    console.log('  🛑 Parando transporte...');
    await transportManager.stop();
    
    console.log('  ✅ Teste de transporte concluído');

  } catch (error) {
    console.error('  ❌ Erro no transporte:', error.message);
  }
}

// Executar demonstração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnhancedEcosystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

export {
  demonstrateEnhancedEcosystem,
  demonstrateContextualDocumentation,
  demonstrateSmartCache,
  demonstrateRobustAuth,
  demonstrateAdaptiveEvolution,
  demonstrateFlexibleTransport
};
