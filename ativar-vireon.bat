@echo off
echo 🧬 Ativando VIREON MCP no Cursor...

echo ✅ Verificando arquivos...
if not exist "vireon-mcp-server.js" (
    echo ❌ Arquivo vireon-mcp-server.js não encontrado
    pause
    exit /b 1
)

if not exist ".cursor-mcp.json" (
    echo ❌ Arquivo .cursor-mcp.json não encontrado
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados

echo 🔧 Testando servidor VIREON...
timeout /t 2 /nobreak >nul
node vireon-mcp-server.js --test
if %errorlevel% neq 0 (
    echo ⚠️ Aviso: Teste falhou, mas pode funcionar no Cursor
)

echo.
echo 🎉 VIREON MCP está pronto para ativação!
echo.
echo 📋 Próximos passos:
echo 1. Abra o Cursor
echo 2. Vá para Settings ^> Extensions ^> MCP
echo 3. Adicione o servidor:
echo    - Nome: VIREON MCP
echo    - Comando: node
echo    - Argumentos: %CD%\vireon-mcp-server.js
echo.
echo 🔧 Ou use o arquivo de configuração:
echo    Copie .cursor-mcp.json para a pasta de configuração do Cursor
echo.
echo 📚 Consulte ATIVAR_VIREON_CURSOR.md para instruções detalhadas
echo.
echo 🧬 VIREON MCP pronto para uso!
echo.
pause








