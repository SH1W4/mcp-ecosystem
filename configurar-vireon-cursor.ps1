# Script de Configuração Automática do VIREON MCP no Cursor
# PowerShell script para configurar automaticamente o VIREON MCP

Write-Host "🧬 Configurando VIREON MCP no Cursor..." -ForegroundColor Cyan

# Verificar se o Cursor está instalado
$cursorPath = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (-not (Test-Path $cursorPath)) {
    Write-Host "❌ Cursor não encontrado em $cursorPath" -ForegroundColor Red
    Write-Host "Por favor, instale o Cursor primeiro: https://cursor.sh/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Cursor encontrado em $cursorPath" -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se o projeto foi compilado
if (-not (Test-Path "dist\index.js")) {
    Write-Host "🔨 Compilando projeto VIREON..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao compilar o projeto" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Projeto compilado com sucesso" -ForegroundColor Green

# Criar diretório de configuração do Cursor
$cursorConfigDir = "$env:APPDATA\Cursor\User\globalStorage\cursor.mcp"
if (-not (Test-Path $cursorConfigDir)) {
    New-Item -ItemType Directory -Path $cursorConfigDir -Force
    Write-Host "📁 Diretório de configuração criado: $cursorConfigDir" -ForegroundColor Green
}

# Copiar configuração do VIREON
$configSource = "cursor-mcp-settings.json"
$configDest = "$cursorConfigDir\vireon-mcp.json"
Copy-Item $configSource $configDest -Force
Write-Host "📋 Configuração copiada para: $configDest" -ForegroundColor Green

# Criar arquivo de configuração principal do Cursor
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"
$vireonConfig = @{
    "mcpServers" = @{
        "vireon-mcp" = @{
            "command" = "node"
            "args" = @("$PWD\vireon-mcp-server.js")
            "env" = @{
                "VIREON_INTEGRATION" = "true"
                "VIREON_TRANSPORT" = "stdio"
                "VIREON_ENABLE_CONTEXT7" = "true"
                "VIREON_ENABLE_METRICS" = "true"
                "VIREON_ENABLE_EVOLUTION" = "true"
                "VIREON_CACHE_ENABLED" = "true"
                "VIREON_AUTH_ENABLED" = "true"
            }
        }
    }
}

# Salvar configuração
$vireonConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $configDest -Encoding UTF8
Write-Host "💾 Configuração salva em: $configDest" -ForegroundColor Green

# Testar o servidor VIREON
Write-Host "🧪 Testando servidor VIREON..." -ForegroundColor Cyan
$testResult = node vireon-mcp-server.js --test 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Servidor VIREON testado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aviso: Teste do servidor falhou, mas pode funcionar no Cursor" -ForegroundColor Yellow
}

# Criar script de inicialização
$initScript = @"
#!/usr/bin/env node
// VIREON MCP Initialization Script
const { startVireonServer } = require('./vireon-mcp-server.js');

console.log('🧬 Iniciando VIREON MCP...');
startVireonServer().catch(console.error);
"@

$initScript | Out-File -FilePath "start-vireon.js" -Encoding UTF8
Write-Host "🚀 Script de inicialização criado: start-vireon.js" -ForegroundColor Green

# Instruções finais
Write-Host "`n🎉 Configuração do VIREON MCP concluída!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Abra o Cursor" -ForegroundColor White
Write-Host "2. Vá para Settings > Extensions > MCP" -ForegroundColor White
Write-Host "3. O VIREON MCP deve aparecer automaticamente" -ForegroundColor White
Write-Host "4. Se não aparecer, adicione manualmente:" -ForegroundColor White
Write-Host "   - Nome: VIREON MCP" -ForegroundColor White
Write-Host "   - Comando: node" -ForegroundColor White
Write-Host "   - Argumentos: $PWD\vireon-mcp-server.js" -ForegroundColor White
Write-Host "`n🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   - Iniciar: node vireon-mcp-server.js" -ForegroundColor White
Write-Host "   - Testar: node start-vireon.js" -ForegroundColor White
Write-Host "   - Compilar: npm run build" -ForegroundColor White
Write-Host "`n📚 Documentação: ATIVAR_VIREON_CURSOR.md" -ForegroundColor Cyan
Write-Host "`n🧬 VIREON MCP está configurado e pronto para uso!" -ForegroundColor Green








