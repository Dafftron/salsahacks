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
echo 📝 Actualizando notas de commits...
echo # Actualizar NOTAS_COMMITS.md con el nuevo commit
echo # Commit: $(git log -1 --pretty=format:"%%H")
echo # Fecha: $(date /t)
echo # Mensaje: $(git log -1 --pretty=format:"%%s")

echo.
echo ✅ ¡Leviosa completado! Los cambios han sido subidos a GitHub.
echo 📋 Recuerda actualizar NOTAS_COMMITS.md con los detalles del commit
pause 