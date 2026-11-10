# Coherencia MVP web (mock navegable, sin backend)
Objetivo: front web coherente con el flujo comercial/finanzas y los diseños móviles (`imagenes/mobile`). Rama: main (sin commits hasta que el usuario lo pida). Verificación: `npx tsc --noEmit`, `npm run check:px`, recorrido en navegador.
Referencia detallada: `docs/flujo-comercial-escenario.md` (escenario, línea de tiempo, resoluciones).

## Specs
S1. "el front tiene que ser coherente y los mockups tienen que ser coherentes" — un único maestro de datos; ninguna vista escribe a mano datos de negocio.
S2. "puedes usar incluso local storage. para simular el guardado y todas esas cosas, edición" — store persistido en `localStorage` con las acciones reales de la web (conciliar, observar, asignar, bloquear línea, revisar solicitudes/gastos).
S3. "no tiene que haber uno cosas que el comercial pueda hacer desde la web como si fuera en la app" — la web solo supervisa. Lo del comercial se OCULTA (comentado), NO se elimina (corrección del usuario, L4).
S4. "creemos un botón para importar su Excel" — Conciliación con "Importar extracto": cruce por N° de operación + monto, columnas asumidas y configurables; conciliar propaga al pedido.
S5. "botones que no sirven" / "no redirige nada" — sin botones muertos ni enlaces a 404.
S6. "vamos a simular el flujo comercial de cero" — guía paso a paso en `docs/`.

## Tasks
- T1 (S1) Modelos y mocks coherentes — inline/delegado — hecho (tsc, check:px, recorrido en navegador)
- T2 (S2) Store con localStorage — inline/delegado — hecho (tsc, check:px, recorrido en navegador)
- T3 (S1,S5) Vistas guiadas por datos (pedido, cotización, cliente, jornada, inicio) — inline/delegado — hecho (tsc, check:px, recorrido en navegador)
- T4 (S4) Conciliación con importar extracto — inline/delegado — hecho (tsc, check:px, recorrido en navegador)
- T5 (S3,S5) Ocultar (no quitar) lo móvil de la web, 404 y botones muertos — inline/delegado — hecho (tsc, check:px, recorrido en navegador)
- T6 (S6) Guía de simulación + verificación en navegador — inline/delegado — hecho (tsc, check:px, recorrido en navegador)

## Log
L1 (usuario): "haz toda la coordinación que tengas que hacer para que quede bien para el cliente, todo el flujo que no haya incoherencias, botones bueno, en caso haya botones que no sirven o cosas que no sirvan porque, en fin, el flujo no lo contempla o lo contempló y no se borró o tal vez este Falta en pantallas"
L2 (usuario): "no tiene mucho sentido [prototipo móvil]... va a ser algo que después voy a desechar" → no se maqueta el móvil.
L3 (usuario): "yo no he visto nada del flujo [de finanzas]. Yo esperaba que esté terminado" y "asume tú las columnas" del Excel.
L4 (usuario): "no dije quitar lo movil de la web, dije que lo comente xq por ahora no sera util pero no dije quitarlo solo ocultarlo" → no se borra código/rutas móviles; se mantienen comentados u ocultos. Se restauraron los bloques "Ocultado temporalmente" que una reescritura había eliminado (ventas/page, DetalleCotizacionView, DetallePedidoView).
L5 (cierre): verificado en navegador el flujo importar extracto → conciliar → pedido → simular SAP, la reasignación de pendientes y 0 enlaces rotos de 31. Sin commits todavía. Pendiente decisión del usuario sobre commits y revisión visual en su pantalla.
