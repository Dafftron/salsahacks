@echo off
echo 🪄 Ejecutando Leviosa...
echo.

echo 📦 Añadiendo archivos al staging...
git add .

echo.
echo 💾 Haciendo commit...
git commit -m "Update: $(date /t) $(time /t)"

echo.
echo 🚀 Subiendo a GitHub...
git push origin main

echo.
echo ✅ ¡Leviosa completado! Los cambios han sido subidos a GitHub.
pause 