# Configuración de URLs de Invitación

## Problema
Las URLs de invitación se estaban generando con `localhost:3000` en lugar de la URL de tu hosting de producción.

## Solución Implementada
Se ha creado un sistema de configuración que permite especificar la URL base para producción.

## Cómo Configurar

### Opción 1: Archivo de Configuración Local (RECOMENDADO)
1. Abre el archivo `src/config/local.js`
2. Cambia la línea:
   ```javascript
   PRODUCTION_URL: 'https://salsahacks.vercel.app',
   ```
3. Por tu URL real de hosting, por ejemplo:
   ```javascript
   PRODUCTION_URL: 'https://miapp.vercel.app',
   ```

### Opción 2: Variable de Entorno
1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega:
   ```
   VITE_APP_PRODUCTION_URL=https://miapp.vercel.app
   ```

## URLs Válidas de Ejemplo
- `https://miapp.vercel.app`
- `https://miapp.netlify.app`
- `https://miapp.com`
- `https://www.miapp.com`

## Cómo Funciona
- **En desarrollo**: Las URLs usan `localhost:3000`
- **En producción**: Las URLs usan la URL configurada en `PRODUCTION_URL`

## Verificación
Después de cambiar la configuración:
1. Reinicia el servidor de desarrollo
2. Crea una nueva invitación
3. Verifica que la URL generada use tu dominio de hosting

## Archivos Modificados
- `src/config/app.js` - Configuración principal
- `src/config/local.js` - Configuración local (EDITAR AQUÍ)
- `src/contexts/AuthContext.jsx` - Generación de URLs de invitación
