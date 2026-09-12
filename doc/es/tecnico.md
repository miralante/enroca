# Arquitectura de Enroca

Sitio estático sin dependencias, compilación ni llamadas a servicios externos.
Funciona abierto como archivo; el service worker necesita HTTPS o localhost.

| Archivo | Responsabilidad |
|---|---|
| index.html | Estructura, navegación, diálogo, región de anuncios y metadatos |
| app.js | Rutas hash, lecciones, práctica, ayudas y partida |
| data.js | Orden didáctico, diagramas y ejercicios sin texto |
| strings.es.js / strings.en.js | Todos los textos, incluidas lecciones y pistas |
| assets/js/core.js | Traducción, guardado con prefijo y sonidos de juego |
| chess.js | Funciones puras de reglas, sin DOM ni almacenamiento |
| sw.js | Precaché completo, versión y aislamiento de cachés |
| scripts/check.js | Validación estructural y regresiones de contenido/motor |

## Reglas y estado

Tablero: 64 entradas, a8=0 y h1=63. Mayúsculas=blancas. FEN incluye turno,
enroques, captura al paso, contador sin capturas/peones y número de jugada.
`legalMoves` filtra movimientos que dejan al rey en jaque. `play` valida
movimientos de interfaz y reanudación. `apply` es una transición interna sin validar.
No se permite capturar reyes. Promoción explícita a dama, torre, alfil o caballo.

Las tablas automáticas son ahogado, material básico insuficiente, cinco repeticiones
y 75 movimientos por lado sin peones/capturas. Mate tiene prioridad. Se puede pedir
tablas tras tres repeticiones o 50 movimientos. La clave de repetición incluye turno,
derechos de enroque y captura al paso solo si existe una captura legal. No hay
reclamación prospectiva ni análisis exhaustivo de posiciones muertas; ver spec.md.
Referencia: [FIDE, leyes del ajedrez](https://handbook.fide.com/chapter/e012023),
artículos 3, 5 y 9 (consultados 2026-09-11).

El rival local evalúa capturas, destinos amenazados y mate a una jugada. No usa IA
remota. El temporizador breve del rival se cancela al salir, abrir diálogo, ocultar
la pestaña o deshacer. Volver reanuda el turno pendiente.

## Datos y sonido

Claves: `enroca:settings`, `enroca:progress`, `enroca:game`. Guardado con try/catch;
contenido inválido se ignora. Progreso validado contra IDs del catálogo. Se conservan
solo éxitos, nunca número de errores ni duración. La partida se reanuda reproduciendo
jugadas legales desde la posición inicial, sin confiar en tableros serializados.
Deshacer elimina una jugada o el par persona/rival. Borrado con dos pasos y solo
bajo el prefijo de Enroca. Sin sincronización entre pestañas concurrentes: última
escritura gana; usar una pestaña por dispositivo para conservar un recorrido coherente.

Web Audio genera tonos breves tras movimientos y metas. `sounds` es falso por defecto.
El contexto de audio solo se crea al activarlo; se detiene al silenciar u ocultar la pestaña.

## Accesibilidad y pruebas

Tablero con filas, gridcells, nombre de pieza/casilla/estado y tabindex itinerante.
Flechas, Inicio/Fin, Intro/Espacio y Escape. Alternativa por listas con controles
≥48px para casillas pequeñas. Navegación visible, foco restituido en diálogos y
anuncios breves. Revisar lector de pantalla real con personas además de pruebas.

`node scripts/check.js` ejecuta sintaxis, estructura, paridad de texto y marcadores,
caché/disco, términos públicos, configuración y pruebas de reglas y lecciones.
`node scripts/test-browser.cjs` es QA opcional con Playwright previamente disponible
por `PLAYWRIGHT_MODULE_PATH`; no es dependencia del producto ni requiere instalar
paquetes en este repositorio. Servir el sitio en 127.0.0.1:8099 antes de ejecutarlo.

Cambios de metadatos: editar app.config.json y ejecutar scripts/build-head.js y
scripts/build-llms-txt.js. No es un build para ejecutar la app. Ver CLOUDFLARE.md.

## Minijuegos

`minigames.js` contiene el catálogo y funciones puras (`start`, `moves`, `play`,
`solution`). Los tableros recortan a las casillas visibles sin cambiar las
coordenadas del ajedrez. La búsqueda en anchura calcula pistas desde el estado
actual. Los retos de jaque delegan en `chess.js`; las tareas de movimiento no
requieren reyes. `app.js` conserva el estado transitorio y el historial para
deshacer en memoria. `enroca:progress.minigames` guarda solo metas resueltas.
La carga admite datos anteriores sin ese campo. El borrado elimina también esas
metas. `scripts/test-minigames.js` comprueba las 178 posiciones alcanzables y
que todas siguen siendo resolubles. `scripts/test-minigames-browser.cjs` prueba
los 12 retos, navegación, listas, idiomas, tamaños y uso sin conexión.
