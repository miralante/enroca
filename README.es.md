# Enroca

**Ajedrez, paso a paso.** Una app de la suite [Apptonomia](https://apptonomia.uk/).

Conoce las piezas. Practica lo aprendido. Juega a tu ritmo.

- **Aprende:** 14 lecciones cortas, con ejemplos de movimientos y lectura opcional.
- **Practica:** 28 ejercicios ligados a las lecciones. Pistas y repaso disponibles.
- **Juega:** pocas piezas o tablero completo. Con Enroca o con otra persona.
- Sin reloj, cuentas, anuncios, telemetría ni dependencias de ejecución.
- Español e inglés. Teclado, texto grande, contraste alto y nombres de piezas.
- Guardado local, deshacer, reanudar partida y borrado de datos con confirmación.
- PWA instalable y uso sin conexión después de la primera visita servida.

## Abrir

Abre [index.html](index.html) en tu navegador. Para instalar y probar el modo sin
conexión, ejecuta `python scripts/serve.py` y abre
http://127.0.0.1:8099/. No necesitas instalar paquetes ni compilar.

**[Abrir Enroca](https://enroca.apptonomia.uk/)** ·
[Código en GitHub](https://github.com/miralante/enroca).

## Guías

[Primeros pasos](doc/es/readme.md) · [Acompañamiento](doc/es/equipo.md) ·
[Producto](doc/es/spec.md) · [Técnica](doc/es/tecnico.md) · [English](README.md).

## Comprobar

`node scripts/check.js` valida estructura, idiomas, contenido, caché y reglas.
`node scripts/check-version-bump.js` comprueba cambios de versión.

La adaptación de la lectura fácil y accesibilidad requiere validación con personas
usuarias y de apoyo. No se presenta como certificación ni como prueba de aprendizaje.

MIT. Tipografías locales de la suite: Atkinson Hyperlegible y Nunito.
