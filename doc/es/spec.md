# Producto: Ludia

## 1. Decisiones

Ludia convierte Enroca en una plataforma de ocho juegos adaptados. El objetivo
interno sigue siendo apoyar la participación de personas con discapacidad
intelectual mediante reglas visuales, acciones sencillas y juego acompañado.
Nombre ES/EN: Ludia. El proyecto y el alojamiento conservan los identificadores
de Enroca para mantener la continuidad. PWA estática, independiente, sin build
ni dependencias externas. Español como fuente editorial y espejo inglés completo.

## 2. Recorrido

Inicio presenta Tres en raya, Cuatro en raya, Guerra de barcos, Sudoku visual,
Tetris, Dominó, Damas y Ajedrez. Cada juego tiene Reglas, Ejercicios y Jugar,
accesibles desde el primer momento, sin bloqueos ni requisitos de progreso.
Esta separación visible responde a la petición explícita para Ludia.
Los siete juegos nuevos tienen 58 reglas y 58 ejercicios con ejemplos,
comprobación, pistas y respuesta visible hasta pulsar Siguiente.
Ajedrez conserva 14 temas, 29 ejercicios, 12 retos y todas sus partidas.

La partida y el progreso se guardan por juego. No se guardan errores, tiempos,
rachas ni comparaciones. Ver reglas no demuestra dominio ni resolver un ejercicio
demuestra transferencia. Las pistas son opcionales. Se puede repetir y deshacer.
Las partidas por turnos permiten rival local o dos personas, salvo Barcos que usa
rival local. Sudoku y Tetris son individuales. El rival tiene dos niveles cuando
el juego permite elegirlo. El ajedrez conserva su rival original.

Tetris empieza paso a paso. La caída automática es opcional, tiene dos velocidades
y pausa. Ocultar la pestaña o salir del juego la detiene. Las metas de 5 o 10 filas
son opcionales. Los sonidos empiezan apagados. No hay narración.

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
