@echo off
echo ========================================
echo    DESPLIEGUE AUTOMATICO SALSAHACKS
echo ========================================
echo.

echo 1. Construyendo la aplicacion...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: La construccion fallo
    pause
    exit /b 1
)

echo.
echo 2. Desplegando en Firebase Hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ERROR: El despliegue fallo
    pause
    exit /b 1
)

echo.
echo 3. Commit y push de los cambios...
call git add .
call git commit -m "Despliegue automatico: %date% %time%"
call git push

echo.
echo ========================================
echo    DESPLIEGUE COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Tu aplicacion esta disponible en:
echo https://salsahacks-a9cac.web.app
echo.
pause
