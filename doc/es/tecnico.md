# Arquitectura de Ludia

## Plataforma de juegos

Ludia transforma este proyecto de Enroca en un catálogo de ocho juegos.
`ludia.js` atiende `#home` y `#ludia/<id>[/rules|exercises|play|match][/paso]`.
`app.js` conserva ajustes, privacidad y las rutas originales del ajedrez.
El ajedrez mantiene sus 14 temas, 29 ejercicios, 12 retos y partidas.
Se conservan los cambios locales del encabezado compacto y sus notas inferiores.

`games/shared.js` registra motores y ofrece azar con semilla. Los siete motores
nuevos son puros, inmutables y utilizables desde Node. Cada juego aporta motor,
contenido bilingüe y adaptador de interfaz. Véase [añadir juegos](anadir-juegos.md).
Se añaden 58 reglas y 58 ejercicios al contenido del ajedrez.

Las claves nuevas son `enroca:ludia-progress` y `enroca:ludia-sessions`.
Guardan reglas vistas y ejercicios resueltos mediante identificadores estables.
Cada juego tiene una partida independiente: versión, opciones, semilla y acciones
legales. Al recuperar, el motor repite las acciones; no confía en un tablero
serializado. Los historiales corruptos o ilegales no se recuperan. Borrar datos
limpia las claves antiguas y nuevas de la app, respetando las de otras apps.
Contra Ludia, deshacer vuelve al turno humano anterior. Entre dos personas,
retrocede una acción. Recargar o deshacer Tetris detiene la caída automática.

Variantes: los barcos pueden tocarse, hay un disparo por turno incluso al acertar
y flotas 3/2/2 en 6 × 6 o 4/3/2/2 en 8 × 8. Sudoku genera soluciones únicas en
recuadros de 2 × 2 o 2 × 3. Tetris usa bolsas de siete piezas y ajustes limitados
al girar, sin afirmar conformidad con sistemas de torneos. Dominó usa doble seis,
siete fichas por persona, salida libre del jugador 1 y robo hasta poder jugar o
agotar el montón. Dos pases comparan los puntos restantes.

Damas usa avance y captura frontal de fichas normales, damas de paso corto,
captura obligatoria, elección libre de captura y saltos múltiples completos.
Coronar acaba el turno. El movimiento sigue las
[reglas inglesas WCDF](https://wcdf.net/rules/rules_of_checkers_english.pdf).
Ludia aplica empate automático por tres repeticiones o 80 medias jugadas sin
captura ni corona. Son reglas declaradas del producto, no arbitraje de torneos.

## Arquitectura del ajedrez conservado

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

## Cabecera compacta de la aplicación

La cabecera principal sigue el modelo de Memofun: icono de 44px (32px por
debajo de 650px), título Nunito de 28px (22px en móvil), atribución a la suite
y controles alineados. Usa un margen interior vertical de 8px y separa las
filas 6px. El texto secundario tiene peso normal y el contador de estrellas
es compacto. Los botones de idioma de la cabecera muestran nombres completos en escritorio
y ES/EN en móvil, con nombres accesibles completos. Teclatlon conserva sus
controles de teclado y ajustes; Enroca conserva navegación y ajustes. Estos
estilos de cabecera no cambian los controles de las actividades.
