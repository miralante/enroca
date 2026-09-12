# Producto: Enroca

## 1. Decisiones

Enroca enseña ajedrez a personas con discapacidad intelectual mediante comprensión,
práctica y juego acompañado. Nombre ES/EN: Enroca. Slug: enroca. Dominio previsto:
enroca.apptonomia.uk. App de propósito único, PWA estática independiente.
HTML/CSS/JavaScript sin build. Fuente de contenido: español; espejo completo: inglés.

## 2. Recorrido

Inicio presenta 14 temas agrupados por contenido. Cada tema muestra una idea y
continúa con una acción en el mismo recorrido, título y tablero. «Conoce el tablero»
presenta las casillas y pide localizar a1, c3 y h1. Hay 29 actividades de localización,
elección o movimiento. Retos y Partida están disponibles desde el inicio.
La separación entre explicación, comprobación y juego es interna; no se presenta
como fases ni como etiquetas de ayuda. El texto indica la siguiente acción.
La respuesta correcta queda visible hasta pulsar Siguiente. No hay avance automático.

Se guardan temas completados y actividades resueltas. El uso de pistas, repaso o
corrección se distingue internamente; la interfaz muestra solo una marca de resolución.
Un intento corregido, una pista o consultar la lección cuentan como ayuda. No se
almacenan errores, tiempos, intentos, rachas ni comparaciones. Ver una lección no
equivale a dominarla. Resolver un ejercicio no demuestra transferencia a situaciones nuevas.

Pocas piezas usa reyes, tres peones por lado y una torre blanca adicional: una
posición inicial reducida. Todas las piezas ofrece la posición inicial normal.
En ambos modos rigen los movimientos legales. Rival local sencillo o dos personas
en el mismo dispositivo; sin juego remoto ni reloj. Deshacer siempre está disponible.

## 3. Principios

Lectura fácil según las pautas de UNE 153101:2018 EX e Inclusion Europe. Frases cortas,
un concepto cada vez y términos de ajedrez explicados antes de usarse.
**WCAG AA mínimo, AAA siempre que sea posible**: contraste de texto de objetivo 7:1,
foco visible, información que no depende solo del color, teclado, alternativas al
tablero con controles grandes, diseño responsive y ausencia de animaciones obligatorias.
Las piezas claras/oscuras tienen formas equivalentes y nombres accesibles.

No infantilizar, clasificar ni etiquetar a la persona en la interfaz. No presión,
penalización, puntuaciones públicas, límites de tiempo ni recompensas variables.
No promesas terapéuticas. Validar comprensión y autonomía con personas antes de
atribuir cumplimiento de lectura fácil o eficacia a la aplicación.

## 4. Límites

Motor local de apoyo de búsqueda muy superficial. No pretende ser un entrenador
competitivo. Incluye reglas especiales, jaque mate, ahogado, tablas materiales
habituales, repetición y reglas de 50/75 movimientos. La reclamación previa a una
jugada anunciada de torneo no se implementa; se pide tablas en una posición ya
alcanzada. No hay árbitro, reloj, acuerdo de tablas ni detección general de todas
las posiciones muertas. Ver referencia técnica. Lecciones sobre reglas especiales
se pueden repetir sin condicionar el acceso a los primeros pasos.

La guía de acompañamiento propone comprobación cualitativa, no un diagnóstico.

## 5. Minijuegos (v2)

Doce retos opcionales en Retos, accesibles también desde Inicio.
Cuatro metas de movimiento en 4 × 4, cuatro caminos/capturas en 6 × 6 y cuatro
situaciones de protección del rey en 8 × 8 con pocas piezas. Ver [minijuegos](minijuegos.md).
Las reglas se simplifican explícitamente en los ocho primeros retos: una pieza móvil,
piezas restantes quietas, sin turnos, jaque ni rival. Se conserva la geometría de
movimiento y captura de cada pieza. Los cuatro retos finales respetan el jaque.

La progresión propone ayudas visibles en el primer grupo y opcionales después.
La persona puede mostrar destinos o pedir una pista en cualquier momento. No hay
bloqueos por nivel ni ajuste automático basado en supuesta capacidad. Las pistas
buscan un camino desde la posición actual; se aceptan todos los caminos válidos.
Solo se añade el logro por reto al progreso local existente, con uso de pistas interno.
No se guardan errores, intentos ni trayectorias de minijuegos.

## Sonido

No hay narración ni síntesis de voz. Los sonidos breves de juego son opcionales,
desactivados por defecto, y nunca sustituyen la confirmación visual.
