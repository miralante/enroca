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
