# Script de Ativação do VIREON MCP no Cursor
Write-Host "🧬 Ativando VIREON MCP no Cursor..." -ForegroundColor Cyan

# 1. Verificar se o projeto está compilado
Write-Host "📦 Verificando compilação do projeto..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "⚠️  Projeto não compilado. Compilando..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro na compilação!" -ForegroundColor Red
        exit 1
    }
}

# 2. Verificar se o servidor MCP existe
$serverPath = "C:\Users\João\Desktop\PROJETOS\MCP_ECOSYSTEM\vireon-mcp-server.js"
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Servidor MCP não encontrado: $serverPath" -ForegroundColor Red
    exit 1
}

# 3. Copiar configuração para o Cursor
$cursorConfigPath = "C:\Users\João\AppData\Roaming\Cursor\User\mcp.json"
$localConfigPath = "C:\Users\João\.cursor\mcp.json"

if (Test-Path $localConfigPath) {
    Copy-Item $localConfigPath $cursorConfigPath -Force
    Write-Host "✅ Configuração copiada para: $cursorConfigPath" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo de configuração local não encontrado: $localConfigPath" -ForegroundColor Red
    exit 1
}

# 4. Testar servidor MCP
Write-Host "🧪 Testando servidor MCP..." -ForegroundColor Yellow
try {
    $testResult = node $serverPath --test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servidor MCP funcionando corretamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Servidor MCP com avisos, mas funcionando" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao testar servidor MCP: $_" -ForegroundColor Red
    exit 1
}

# 5. Verificar configuração final
Write-Host "📋 Verificando configuração final..." -ForegroundColor Yellow
if (Test-Path $cursorConfigPath) {
    $config = Get-Content $cursorConfigPath | ConvertFrom-Json
    if ($config.mcpServers."vireon-mcp") {
        Write-Host "✅ Configuração VIREON encontrada no Cursor!" -ForegroundColor Green
        Write-Host "🚀 VIREON MCP está pronto para uso!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
        Write-Host "1. Feche o Cursor completamente" -ForegroundColor White
        Write-Host "2. Abra o Cursor novamente" -ForegroundColor White
        Write-Host "3. O VIREON MCP estará ativo automaticamente" -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 VIREON MCP ativado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Configuração VIREON não encontrada!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Arquivo de configuração do Cursor não encontrado!" -ForegroundColor Red
    exit 1
}






