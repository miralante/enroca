# Validación de Enroca v2

Revisión local: 12 de septiembre de 2026.

## Comprobado

- Estructura, sintaxis, paridad ES/EN, marcadores, metadatos y precaché correctos.
- 19 grupos de regresión de ajedrez, incluidos los árboles de referencia.
- 12 minijuegos y sus 178 posiciones alcanzables: todos conservan una solución.
- Navegador: 14 temas y 29 actividades completadas. «Conoce el tablero» pasa de
  presentación a localizar a1, c3 y h1; pistas, corrección y repaso conservan el recorrido.
- Copy sin fases ni etiquetas de ayuda. Sin síntesis de voz ni narración. Silencio
  inicial, sonidos opcionales y cancelación inmediata al silenciar.
- Retos con banderas, obstáculos, capturas, jaque, deshacer, pistas tras desvíos,
  vuelta desde el ejemplo y alternativa por listas que se abre solo a petición.
- Partidas locales y contra Enroca: movimientos legales, deshacer, reanudación,
  cancelación del turno pendiente, coronación y cancelación del diálogo.
- Teclado y foco; ES/EN, texto grande, contraste y nombres de piezas sin desbordamiento
  en 320, 375, 768 y 1280 px. Coordenadas grandes en la localización de casillas.
- Temas, retos y partidas sin conexión tras la primera visita. Sin peticiones externas
  ni errores de ejecución en las pruebas de navegador.
- Progreso anterior conservado para IDs vigentes; los dos ejercicios antiguos de
  tablero se sustituyen por tres localizaciones. Borrado exclusivo de `enroca:`.
- Almacenamiento bloqueado o corrupto y apertura directa de `index.html` comprobados.
- Generadores de metadatos y llms.txt actualizados. Caché preparada como `enroca-v2`.

## Límites

Pendiente revisión con personas usuarias y de apoyo y lectores de pantalla reales.
No se afirma certificación ni eficacia. El progreso indica actividad, no dominio.

Las pestañas abiertas conservan la versión anterior hasta cerrarse: la actualización
no reemplaza una partida en curso. GitHub Actions valida; Wrangler publica manualmente.

Consultar [la guía técnica](tecnico.md) para repetir las pruebas.

## Publicación verificada

GitHub: `a787bee`, validación correcta. Cloudflare:
`54c08d76-d01d-478c-b917-152f2d837081`, caché `enroca-v4`.
Las dos baterías de navegador pasaron también en https://ludia.apptonomia.uk/,
incluidos los 29 ejercicios, 12 retos, tamaños de pantalla y uso sin conexión.
24 archivos públicos; Git, configuración, pruebas y archivos temporales devuelven 404.

## Verificación de Ludia (local)

La conversión a Ludia se verifica en local, por separado de la publicación
histórica de Enroca descrita arriba. Pasan los 58 ejemplos/reglas y los 58
 ejercicios nuevos. Se prueban partidas completas, deshacer, retomar, pausa de
Tetris, cambio de manos en Dominó y teclado/listas de Damas. Tableros activos y
recorridos caben a 320, 375, 768 y 1365 píxeles en ambos idiomas con texto grande
y contraste alto. Los 29 ejercicios y 12 retos del ajedrez original siguen
pasando sus pruebas completas de navegador.

Los ocho juegos funcionan desde la caché completa. Se comprueban las partidas
por juego, progreso anterior, borrado limitado a esta app, historiales inválidos,
almacenamiento bloqueado y apertura directa. Se han inspeccionado los iconos y
las pantallas de escritorio y móvil. Las cuatro baterías de navegador están
listadas en el README principal. Esta tarea no publica ni cambia el dominio.
