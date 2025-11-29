@echo off
echo 🧬 Ativando VIREON MCP no Cursor...

echo 📦 Verificando compilação do projeto...
if not exist "dist" (
    echo ⚠️  Projeto não compilado. Compilando...
    npm run build
    if errorlevel 1 (
        echo ❌ Erro na compilação!
        pause
        exit /b 1
    )
)

echo ✅ Projeto compilado!

echo 📋 Copiando configuração para o Cursor...
copy "C:\Users\João\.cursor\mcp.json" "C:\Users\João\AppData\Roaming\Cursor\User\mcp.json" /Y

if exist "C:\Users\João\AppData\Roaming\Cursor\User\mcp.json" (
    echo ✅ Configuração copiada com sucesso!
) else (
    echo ❌ Erro ao copiar configuração!
    pause
    exit /b 1
)

echo 🧪 Testando servidor MCP...
node vireon-mcp-server.js --test

echo.
echo 🎉 VIREON MCP ativado com sucesso!
echo.
echo 📝 PRÓXIMOS PASSOS:
echo 1. Feche o Cursor completamente
echo 2. Abra o Cursor novamente  
echo 3. O VIREON MCP estará ativo automaticamente
echo.
echo 🚀 VIREON MCP está pronto para amplificar suas capacidades!
pause






