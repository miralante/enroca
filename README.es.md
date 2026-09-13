# Ludia

**Juegos a tu manera.** Una app independiente de [Apptonomia](https://apptonomia.uk/), evolución de Enroca.

Ocho juegos con reglas, ejercicios interactivos y partidas completas:

| Juego | Reglas y ejercicios | Partida |
| --- | --- | --- |
| Tres en raya | 8 reglas y 8 ejercicios | Rival local o dos personas; victoria y empate |
| Cuatro en raya | 8 reglas y 8 ejercicios | Caída de fichas, todas las líneas ganadoras; rival local o dos personas |
| Guerra de barcos | 8 reglas y 8 ejercicios | Colocación manual o automática; mares de 6 × 6 y 8 × 8; rival local |
| Sudoku visual | 8 reglas y 8 ejercicios | Puzles únicos de 4 × 4 y 6 × 6; formas, notas, comprobación y pistas |
| Tetris | 8 reglas y 8 ejercicios | Siete piezas, giros, sombra, reserva y filas; paso a paso o caída automática opcional |
| Dominó | 8 reglas y 8 ejercicios | Doble seis completo, robar, pasar y partidas bloqueadas; rival local o dos personas |
| Damas | 10 reglas y 10 ejercicios | Movimiento inglés, capturas obligatorias, saltos encadenados, coronas y empates; pocas o todas las fichas |
| Ajedrez | 14 temas, 29 ejercicios y 12 retos | Motor original completo, movimientos especiales, promoción y empates; pocas o todas las piezas |

Todo en español e inglés. Teclado, texto grande, contraste alto, pistas opcionales,
deshacer y partidas guardadas. Los sonidos opcionales empiezan desactivados.
Tetris empieza sin caída automática; la caída automática se puede pausar.

El progreso y una partida de cada juego se guardan en este navegador. El borrado
con confirmación solo afecta a esta app. Sin cuentas, publicidad, telemetría ni
dependencias externas en ejecución. PWA instalable y uso sin conexión después de
la primera visita servida.

## Abrir

Abre [index.html](index.html), o ejecuta `node scripts/serve.js` y visita
[la vista local](http://127.0.0.1:8099/). No hay instalación ni compilación.
La carpeta, la configuración de alojamiento existente y las claves de guardado
conservan sus identificadores de Enroca para mantener el progreso de ajedrez.
La publicación se realiza por separado.

## Mantener y comprobar

`node scripts/check.js` comprueba estructura, idiomas, contenido, caché y los ocho
motores. `node scripts/check-version-bump.js` valida los cambios de caché.

Con Playwright disponible, configura `PLAYWRIGHT_MODULE_PATH` y ejecuta
`node scripts/test-ludia-browser.cjs`, `node scripts/test-browser.cjs` y
`node scripts/test-minigames-browser.cjs` y `node scripts/test-ludia-storage.cjs`
contra la vista local.

[Añadir un juego](doc/es/anadir-juegos.md) · [Arquitectura](doc/es/tecnico.md) ·
[Producto](doc/es/spec.md) · [Acompañamiento](doc/es/equipo.md) · [English](README.md).

Las adaptaciones de lectura fácil y accesibilidad requieren revisión con personas
usuarias y de apoyo. Las pruebas automáticas no certifican accesibilidad ni mejoras
de aprendizaje.

MIT. Fuentes Atkinson Hyperlegible y Nunito incluidas.
