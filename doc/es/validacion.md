# Validación de Enroca

Revisión local realizada el 12 de septiembre de 2026.

## Completado

- `node scripts/check.js`: estructura, sintaxis, traducciones, marcadores, contenido,
  archivos de caché, metadatos y 19 grupos de regresión de ajedrez correctos.
- Árboles de referencia: inicio hasta profundidad 4 (197281 posiciones finales),
  Kiwipete hasta profundidad 3 (97862), final de torres/peones (2812).
- Navegador Chromium: catálogo de 14 lecciones, recorrido de aprendizaje y los 28 ejercicios; pistas, corrección,
  retorno a la lección y repetición con mejora del estado de ayuda.
- Partida entre dos personas y con Enroca, movimientos inválidos, pistas, deshacer,
  reanudación, cancelación de turno pendiente y elección/cancelación de coronación.
- Teclado, enlace de salto y alternativa al tablero por controles grandes.
- Español e inglés con texto grande, contraste alto y nombres de piezas; sin
  desbordamiento a 320, 375, 768 y 1280 píxeles en las pantallas comprobadas.
- Sin conexión: lecciones y partida, después de precargar el sitio.
- Sin peticiones a servicios externos durante las pruebas. Sin errores de ejecución.
- Borrado confirmado que conserva datos ajenos a Enroca; almacenamiento bloqueado
  o corrupto sin impedir el juego; apertura directa de index.html.
- Generadores propios de metadatos y llms.txt: salida actualizada y repetible.
- Portal Apptonomia: `node scripts/check.js` correcto (134 comprobaciones).
- Registro en catálogo, documentos, fuentes canónicas y meta-grafo (8 proyectos).
- Copia local del skill graphify sincronizada mediante la herramienta de la suite.

## Limitaciones y tareas posteriores

- El escáner independiente de términos públicos de Apptonomia sigue señalando siete
  coincidencias anteriores a este trabajo. Se verificaron en HEAD: seis categorías
  de términos en strings.es.js/strings.en.js y «children» en un comentario de
  js/script.js. No las introduce Enroca. Su resolución pertenece al portal existente.
- La comprobación de salto de versión no tiene una revisión anterior que comparar
  en el repositorio nuevo. La versión inicial es enroca-v1.
- Falta revisión con personas usuarias y de apoyo, lectores de pantalla reales y
  voces instaladas en sus dispositivos. No se afirma certificación ni eficacia.
- GitHub y Cloudflare publicados el 2026-09-12:
  https://github.com/miralante/enroca y https://enroca.apptonomia.uk/.
  GitHub Actions correcto; versión de Cloudflare `1631bbd8-8eb8-400f-986d-17805a36a1f9`.
  Se repitió correctamente la batería de navegador en producción, incluido el modo
  sin conexión y los cuatro tamaños de pantalla. Cabeceras HTTP y tipos de archivos
  correctos; código de herramientas y archivos de Git no publicados (404).
  El despliegue es manual con Wrangler; GitHub Actions valida, pero no despliega.

Para repetir QA del navegador, consultar [la guía técnica](tecnico.md).
