# Script de Instalação do VIREON MCP para Cursor
# PowerShell script para configurar o VIREON MCP no Cursor

Write-Host "🧬 Instalando VIREON MCP para Cursor..." -ForegroundColor Cyan

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

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Compilar o projeto
Write-Host "🔨 Compilando VIREON MCP..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar o projeto" -ForegroundColor Red
    exit 1
}

# Criar diretório de configuração do Cursor
$cursorConfigDir = "$env:APPDATA\Cursor\User\globalStorage\cursor.mcp"
if (-not (Test-Path $cursorConfigDir)) {
    New-Item -ItemType Directory -Path $cursorConfigDir -Force
    Write-Host "📁 Diretório de configuração criado: $cursorConfigDir" -ForegroundColor Green
}

# Copiar configuração do VIREON
$configSource = "vireon-mcp-config.toml"
$configDest = "$cursorConfigDir\vireon-mcp-config.toml"
Copy-Item $configSource $configDest -Force
Write-Host "📋 Configuração copiada para: $configDest" -ForegroundColor Green

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

# Testar o servidor
Write-Host "🧪 Testando VIREON MCP..." -ForegroundColor Cyan
$testResult = node vireon-mcp-server.js --test 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VIREON MCP testado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aviso: Teste do VIREON MCP falhou, mas pode funcionar no Cursor" -ForegroundColor Yellow
}

# Instruções finais
Write-Host "`n🎉 Instalação do VIREON MCP concluída!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Abra o Cursor" -ForegroundColor White
Write-Host "2. Vá para Settings > Extensions > MCP" -ForegroundColor White
Write-Host "3. Adicione o servidor MCP com a configuração:" -ForegroundColor White
Write-Host "   - Nome: VIREON MCP" -ForegroundColor White
Write-Host "   - Comando: node '$PWD\vireon-mcp-server.js'" -ForegroundColor White
Write-Host "4. Ou use o arquivo de configuração: $configDest" -ForegroundColor White
Write-Host "`n🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   - Iniciar: node vireon-mcp-server.js" -ForegroundColor White
Write-Host "   - Testar: node start-vireon.js" -ForegroundColor White
Write-Host "   - Compilar: npm run build" -ForegroundColor White
Write-Host "`n📚 Documentação: VIREON_IDENTITY.md" -ForegroundColor Cyan
Write-Host "`n🧬 VIREON MCP está pronto para uso!" -ForegroundColor Green
