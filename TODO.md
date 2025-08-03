# TODO - Salsahacks

## Problemas Pendientes

### 🔴 Descarga de Videos desde Firebase Storage
- **Problema**: La descarga de videos muestra "preparando" y luego da error
- **Ubicación**: `src/components/video/VideoPlayer.jsx` - función `downloadVideo`
- **Estado**: Pendiente de resolver
- **Notas**: 
  - Las reglas de Firebase Storage están configuradas correctamente
  - La función de descarga ha sido simplificada pero aún falla
  - Posible problema con CORS o permisos específicos
  - Considerar usar `getDownloadURL` de Firebase Storage en lugar de fetch directo

### ✅ Completado Recientemente
- ✅ Sistema de 5 estrellas en video cards (sin hover, solo click)
- ✅ Botón de favoritos clickeable en video cards
- ✅ Fix eventos de teclado en campos de entrada
- ✅ Auto-hide controles después de 4 segundos
- ✅ Detección automática de orientación de video
- ✅ Botón de velocidad tipo YouTube
- ✅ Resolución dinámica en thumbnails y cards

## Próximas Mejoras Sugeridas
- [ ] Investigar y arreglar descarga de videos
- [ ] Optimizar rendimiento de carga de videos
- [ ] Agregar más opciones de velocidad de reproducción
- [ ] Implementar cache de videos
- [ ] Mejorar UI/UX del reproductor 