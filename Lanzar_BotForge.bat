@echo off
title BotForge Launcher
echo ==========================================
echo       BOTFORGE AI - MODO DE PRUEBA
echo ==========================================
echo.

:: Asegurarse de estar en el directorio correcto
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Entrar a la carpeta server
if exist server (
    cd server
) else (
    echo [!] No se encuentra la carpeta 'server'.
    pause
    exit
)

:: Usar un puerto diferente (3005) para evitar conflictos con procesos abiertos
set PORT=3005
echo [+] Iniciando servidor en el puerto %PORT%...
echo (Se abrira una nueva ventana para el servidor)

:: Iniciar el servidor con el puerto forzado
start "BotForge Server TEST" node index.js

:: Esperar un momento
echo [+] Esperando a que el sistema cargue...
timeout /t 5 /nobreak > nul

:: Abrir el navegador en el nuevo puerto
echo [+] Abriendo Panel en el navegador...
start http://localhost:%PORT%

echo.
echo ==========================================
echo          SISTEMA EN LINEA (PUERTO %PORT%)
echo ==========================================
echo Si la ventana del servidor se cierra sola, revisa si hay errores.
echo Acceso: http://localhost:%PORT%
echo Pass: admin123
echo.
pause
