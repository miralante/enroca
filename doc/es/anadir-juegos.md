# Añadir un juego a Ludia

Ludia usa un registro de juegos independientes. Tetris, Sudoku, Dominó y Damas
ofrecen ejemplos completos. No hay paso de compilación.

1. Crea `games/<id>.js`. Registra un identificador único y estable con
   `LudiaGames.register`. Exporta el mismo objeto para las pruebas de Node.
2. Implementa las funciones puras `init(options, seed)`, `move(state, action)`,
   `actions(state)`, `status(state)` y `hint(state)`. `move` devuelve un estado
   nuevo o `null` si la acción es ilegal. Nunca modifica la entrada. Usa el
   generador aleatorio con semilla: las partidas se reconstruyen al repetir acciones.
3. `status` devuelve `{ ended, winner }`. El ganador vale 1 o 2; cero representa
   empate. Un juego individual puede añadir `solved` u `over` y su propio texto
   de estado. Los juegos por turnos usan `turn: 1|2`. El segundo lado es Ludia
   salvo que la configuración indique `partner: 'local'`.
4. Crea `<id>-content.js`. Incluye `title`, `description`, `tag`, `color` y una
   lista `lessons`. Cada entrada tiene `id` estable y parejas `[es, en]` para
   título, explicación, pregunta y pista. Las entradas `choice` tienen opciones
   e índice de respuesta. Las entradas `board` tienen un estado completo de
   ejemplo, una acción legal y una función de aceptación. Acepta soluciones
   equivalentes cuando proceda. Explica todas las reglas necesarias para acabar
   una partida, incluidos bloqueos y finales. La interfaz genera Reglas,
   Ejercicios y Jugar a partir del contenido.
5. Crea `<id>-view.js`. Añade la vista a `LudiaViews[id]` y, según necesites,
   funciones en `LudiaOptions`, `LudiaPanels`, `LudiaStatus`, `LudiaCell`,
   `LudiaAction` y `LudiaHint`. `api.commit(action)` gestiona la partida;
   `api.tryExercise(action)` comprueba ejercicios. `api.grid` incluye nombres
   de casillas y navegación con flechas. Usa `api.button`, `t`, `esc` y `tr`.
   Añade el texto común a `LudiaCopy` con ambas traducciones.
6. Carga los archivos en `index.html`: motores antes de contenido, contenido
   base antes del específico, vistas base antes de las específicas y todo antes
   de `ludia.js`. Añade una ilustración al catálogo en `illustration` de
   `ludia.js`. Las fases, progreso, ajustes y hueco de guardado aparecen automáticamente.
7. Incluye cada archivo en `sw.js` e incrementa su versión `enroca-vN`.
   Este prefijo conserva deliberadamente la actualización de la app original.
8. Amplía `scripts/test-ludia.js` y `scripts/test-ludia-browser.cjs`. Prueba
   acciones legales e ilegales, finales completos, recuperación determinista,
   teclado, táctil, ES/EN y pantallas estrechas. Ejecuta `node scripts/check.js`
   y la comprobación de versión.

Los motores no usan DOM, temporizadores, guardado, sonido ni azar sin semilla.
Los temporizadores viven en la interfaz y se cancelan al salir, pausar, ocultar
la pestaña o borrar datos. Todos los juegos funcionan sin servicios de red.

El adaptador de ajedrez conserva sus rutas y su historial validado. Para ampliarlo
está la [guía original de elementos](guia-crear-elementos.md).
