@echo off
echo 🔄 Reiniciando Cursor para ativar MCP...
echo.

REM Finalizar processos do Cursor
echo 🛑 Finalizando processos do Cursor...
taskkill /f /im Cursor.exe >nul 2>&1

REM Aguardar um pouco
timeout /t 3 /nobreak >nul

REM Iniciar Cursor novamente
echo 🚀 Iniciando Cursor...
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\cursor\Cursor.exe"

echo.
echo ✅ Cursor reiniciado! 
echo 📋 Verifique se o MCP está ativo digitando: @test-connection
echo.
pause
