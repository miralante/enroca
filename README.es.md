# Ludia

> 🌐 **Other languages:** [English](README.md)

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

---

## 🚀 Pruébalo en vivo

Abre [index.html](index.html), o ejecuta `node scripts/serve.js` y visita
[la vista local](http://127.0.0.1:8099/). No hay instalación ni compilación.
La carpeta, la configuración de alojamiento existente y las claves de guardado
conservan sus identificadores de Enroca para mantener el progreso de ajedrez.
La publicación se realiza por separado.

---

## ✨ Características

- ♟️ **Ocho juegos con reglas, ejercicios interactivos y partidas
  completas** — cada juego tiene su propia sección de reglas,
  sus ejercicios paso a paso y una partida local contra el motor
  integrado o entre dos personas en el mismo dispositivo.
- 🪶 **Sin dependencias en tiempo de ejecución** — HTML/CSS/JS
  puros, sin paso de build, sin frameworks.
- 🌐 **Bilingüe** — español (por defecto) e inglés.
- 🔒 **Privacidad por defecto** — sin cuentas, sin cookies, sin
  analítica: el progreso y la partida guardada de cada juego
  viven en `localStorage` en el dispositivo del usuario, bajo
  el prefijo `enroca:` (mantenido por compatibilidad con Enroca,
  ver `CLAUDE.md`).
- 📦 **PWA instalable** — se puede instalar en la pantalla de
  inicio y seguir jugando sin conexión después de la primera
  visita servida.
- 🖐️ **Línea base de accesibilidad de la suite** — texto
  grande, contraste alto, controles por teclado, pistas
  opcionales, deshacer y partidas guardadas; sonidos
  desactivados por defecto.
- ♻️ **Identificadores heredados de Enroca a propósito** — la
  carpeta, la configuración de alojamiento y las claves de
  guardado conservan sus nombres de Enroca para mantener el
  progreso de ajedrez de las personas usuarias que ya jugaban.

---

## 📖 Acerca de

Ludia es un **catálogo de juegos adaptados**: ocho juegos (tres en
raya, cuatro en raya, guerra de barcos, sudoku visual, tetris,
dominó, damas y ajedrez), cada uno con su sección de reglas,
ejercicios interactivos que las ensayan paso a paso y una partida
local completa contra el motor integrado (o entre dos personas en
el mismo dispositivo). El currículo y el motor de ajedrez se
conservan del proyecto original Enroca; el nombre público es
**Ludia** para todo el catálogo.

Ludia se publica como web estática sin dependencias y como PWA
instalable. Es una de las **siete apps** de la suite
**Miralante** — la lista completa está en
[🌐 La suite Miralante](#-la-suite-miralante--proyectos-del-grupo)
al final. La especificación real del producto vive en
[`doc/es/spec.md`](doc/es/spec.md); este README rehúye
reformular decisiones de producto para que la descripción
pública y la especificación no se separen.

---

## 🎯 Objetivos

- ♟️ **Ocho juegos con reglas, ejercicios y partidas** — las
  reglas de cada juego se enseñan paso a paso con ejercicios
  interactivos antes de desbloquear la partida.
- 🎮 **Una persona usuaria nueva puede jugar en minutos** — sin
  tutorial, sin instalación más allá de la PWA.
- 🌐 **Paridad bilingüe** — español por defecto y fuente de
  verdad; inglés con paridad en cada cadena.
- 🔒 **Progreso solo en el dispositivo** — cada partida
  guardada vive en `localStorage` bajo el prefijo `enroca:`
  (mantenido por compatibilidad con Enroca, ver `CLAUDE.md`);
  nada se sube nunca.
- 📦 **Funciona sin conexión como PWA** — instalar, cerrar el
  portátil, seguir jugando.
- 🪶 **Sin dependencias** — HTML/CSS/JS puros, sin build.
- 🖐️ **Línea base de accesibilidad de la suite** — texto
  grande, contraste alto, controles por teclado, pistas
  opcionales, deshacer y partidas guardadas; sonidos
  desactivados por defecto.

Cada objetivo referencia una sección de
[`doc/es/spec.md`](doc/es/spec.md); si un objetivo no está allí,
añádelo a la especificación o sácalo de la lista.

---

## 👥 Audiencia y roles

Ludia está pensada para una **persona tipo** — quien quiera
aprender, practicar y jugar a juegos adaptados en su propio
dispositivo, sin cuenta ni presión. La especificación real del
producto vive en [`doc/es/spec.md`](doc/es/spec.md); este README
evita a propósito cualquier etiqueta clínica para que la
descripción pública se mantenga genérica.

| Rol | Quién es | Cómo participa | Dónde mira primero |
|---|---|---|---|
| 👤 **Persona usuaria** | Juega a los juegos | Abre la app en un navegador; no lee ni escribe código | La app |
| ❤️ **Apoyo** | Familia, terapeuta, docente | Acompaña, supervisa, ajusta la dificultad | [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) |
| 💻 **Construcción** | Desarrollador/a | Implementa, mantiene, revisa PRs, despliega | [`tecnico.md`](doc/es/tecnico.md) |

Ver [`doc/es/roles.md`](doc/es/roles.md) para la descripción
completa de los roles.

---

## 📚 Documentación del proyecto (bilingüe)

Toda la documentación del proyecto vive en la carpeta `doc/`:

| Idioma | Punto de entrada |
|---|---|
| 🇪🇸 Español (este archivo) | [`doc/es/indice.md`](doc/es/indice.md) |
| 🇬🇧 English | [`doc/en/index.md`](doc/en/index.md) |

Por rol y perfil, lo que más interesa es:

| Soy… | Empieza por… |
|---|---|
| 👤 Persona usuaria o familiar | [`doc/es/readme.md`](doc/es/readme.md) |
| ❤️ Terapeuta, familiar o profesional de apoyo | [`doc/es/equipo.md`](doc/es/equipo.md) |
| 🤔 Quiero entender qué es Ludia y por qué | [`doc/es/spec.md`](doc/es/spec.md) |
| 💻 Desarrollador/a | [`doc/es/tecnico.md`](doc/es/tecnico.md) |

### 📄 Otros documentos del repo

| Documento | Para quién |
|---|---|
| [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) | Familias, terapeutas y desarrolladores que quieran contribuir |
| [`CODE_OF_CONDUCT.es.md`](CODE_OF_CONDUCT.es.md) | Pacto del colaborador (Contributor Covenant 2.1) |
| `CLAUDE.md` | Agentes IA: reglas obligatorias y estado del proyecto |
| [`CLOUDFLARE.md`](CLOUDFLARE.md) | Guía canónica de despliegue en Cloudflare Workers para Ludia |
| Historial del proyecto | En `git log`; no se mantiene una hoja de ruta externa |
| `doc/es/i18n.md` / `doc/en/i18n.md` | Detalles del sistema multiidioma ES/EN |

---

## 🛠️ Añadir un juego

Ludia crece añadiendo **juegos** bajo `games/<slug>/`. Cada juego
publica los archivos canónicos del juego; cada cambio debe
respetar la cerradura de paridad del catálogo (el mismo conjunto
de slugs debe aparecer en `games/` en disco, en las tarjetas de
`index.html` y en `ARCHIVOS` de `sw.js`).

Para añadir un juego nuevo:

1. Crea `games/<slug>/` con los archivos canónicos del juego
   (usa uno existente como plantilla).
2. Registra el juego: añade su tarjeta a `index.html`, sus rutas
   al enrutador, y sus assets estáticos a `ARCHIVOS` en `sw.js`.
3. Bumpea `VERSION` en `sw.js` (p. ej. `enroca-vN` →
   `enroca-vN+1`).
4. Lee primero [`doc/es/anadir-juegos.md`](doc/es/anadir-juegos.md)
   — reglas de diseño, tono y requisitos de accesibilidad para
   nuestra audiencia.

Para ampliar los **datos** de un juego existente, edita sus
ficheros de datos dentro de `games/<slug>/`. Antes de añadir un
juego nuevo, lee [`doc/en/adding-games.md`](doc/en/adding-games.md)
para entender el contrato completo.

---

## ✅ Validar los cambios

```bash
node scripts/check.js
```

No hace falta `npm install` — el script solo usa la biblioteca
estándar de Node. Comprueba la sintaxis JS, la anatomía canónica
de los archivos, la paridad sw.js ↔ disco, la paridad es/en de
claves, y el lock de paridad del catálogo de juegos.

Ludia también envía un service worker, así que ejecuta también:

```bash
node scripts/check-version-bump.js
```

para confirmar que cualquier cambio en un archivo cacheado vino
acompañado de un bump de `VERSION` en `sw.js` (el gate del bump
de caché).

Con Playwright disponible, configura `PLAYWRIGHT_MODULE_PATH` y
ejecuta los `scripts/test-*-browser.cjs` y
`scripts/test-ludia-storage.cjs` contra la vista local.

---

## ☁️ Despliegue

Ludia es un sitio totalmente estático (HTML/CSS/JS, sin paso de
build), por lo que se envía directamente a
**[Cloudflare Workers (static assets)](https://developers.cloudflare.com/workers/static-assets/)**
mediante su integración nativa con GitHub. Las cabeceras de
seguridad HTTP viven en [`_headers`](_headers), y la metadata
del proyecto en [`wrangler.toml`](wrangler.toml). Ver
[`CLOUDFLARE.md`](CLOUDFLARE.md) con la guía completa (rebuild,
rollback, dominio personalizado, rotación de credenciales).

Las pull requests obtienen automáticamente una URL de
previsualización en `ludia-<branch>.<account-subdomain>.workers.dev`
— sin necesidad de un workflow extra.

---

## 🛡️ Seguridad

Ludia es un sitio estático puramente del lado del cliente: sin
backend, sin base de datos, sin telemetría, sin runtime de
terceros. El modelo de amenaza es esencialmente "lo que una
página maliciosa offline podría hacer sobre el mismo origen",
algo que el navegador ya aísla. Ver [`SECURITY.es.md`](SECURITY.es.md)
(o [`SECURITY.md`](SECURITY.md)) para cómo reportar una posible
vulnerabilidad de forma privada.

---

## 📄 Licencia

MIT — ver [`LICENSE`](LICENSE). Las fuentes Atkinson Hyperlegible
y Nunito incluidas son propiedad de sus respectivos autores y se
distribuyen bajo sus propias licencias.

---

## 🤝 Contribuir

Issues y pull requests son bienvenidos. Ver
[`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) para el flujo de
trabajo (y [`CONTRIBUTING.md`](CONTRIBUTING.md) para la versión
en inglés). Todas las personas participantes deben seguir
[`CODE_OF_CONDUCT.es.md`](CODE_OF_CONDUCT.es.md).

Las adaptaciones de lectura fácil y accesibilidad requieren
revisión con personas usuarias y de apoyo. Las pruebas
automáticas no certifican accesibilidad ni mejoras de
aprendizaje.

---

## 🧹 Mantenimiento

Helpers de calidad de vida modelados sobre el estándar de la
suite; se ejecutan de vez en cuando, no en cada cambio:

- `node scripts/check-version-bump.js` — confirma que cualquier
  cambio en un archivo cacheado vino con un bump de `VERSION`
  en `sw.js` (el gate del bump de caché).
- `node scripts/scan-secrets.js` — grep basado en patrones que
  atrapa claves de API, tokens o claves privadas accidentales.
  El mismo chequeo corre como el job `secrets-scan` en CI.
- `node scripts/smoke-prod.js` — golpea la URL en vivo de
  `*.workers.dev` y verifica el contrato básico de respuesta.
- `node scripts/limpiar-graphify-cache.js` — dry-run muestra
  qué se eliminaría de `graphify-out/`; pasa `--apply` para
  borrar de verdad (la siguiente ejecución de graphify lo
  reconstruye desde cero).

---

## 🌐 La suite Miralante — proyectos del grupo

Ludia es una de las **siete apps** de la suite **Miralante**, que
comparten autor, la misma filosofía de accesibilidad sin backend, y
la misma historia de despliegue en Cloudflare. Apptonomia, además de
ser una app en sí misma, actúa como **portal de la suite** que la
presenta al mundo. Ninguno de los siete repos es el "principal" —
son iguales; este es el producto original del que nació el grupo.

| Proyecto | Qué es | Repositorio |
|---|---|---|
| **Apptonomia** *(portal — landing only, no es app)* | Landing que presenta la suite Miralante (no es una app en tiempo de ejecución) | [github.com/miralante/apptonomia](https://github.com/miralante/apptonomia) |
| [Calculia](https://calculia.apptonomia.uk/) | Cálculo y razonamiento lógico | [github.com/miralante/calculia](https://github.com/miralante/calculia) |
| [Ludia](https://ludia.apptonomia.uk/) | Juegos adaptados con reglas, ejercicios y partidas | [github.com/miralante/ludia](https://github.com/miralante/ludia) |
| [Memofun](https://memofun.apptonomia.uk/) | Tarjetas de memoria con aprendizaje significativo | [github.com/miralante/memofun](https://github.com/miralante/memofun) |
| [Okeymoney](https://okeymoney.apptonomia.uk/) | Finanzas personales y autonomía cotidiana | [github.com/miralante/okeymoney](https://github.com/miralante/okeymoney) |
| [Routime](https://routime.apptonomia.uk/) | Actividades para rutinas y vida cotidiana | [github.com/miralante/routime](https://github.com/miralante/routime) |
| [Sinonimia](https://sinonimia.apptonomia.uk/) | Diccionario en lectura fácil | [github.com/miralante/sinonimia](https://github.com/miralante/sinonimia) |
| [Teclatlon](https://teclatlon.apptonomia.uk/) | Mecanografía con el teclado físico | [github.com/miralante/teclatlon](https://github.com/miralante/teclatlon) |
