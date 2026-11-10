# Imágenes de Comercial para la presentación

Las 13 hojas de esta carpeta reemplazan las 13 imágenes originales de `imagenes/mobile`. Cada hoja conserva cuatro vistas completas. Inserta cada PNG completo en una diapositiva y recorre sus vistas de izquierda a derecha; no hace falta recortar.

Los archivos locales conservan exactamente los nombres originales. En el ZIP llevan un prefijo 01–13 para abrirlos en el orden de la tabla. Los originales y el frontend no fueron modificados.

## Orden y reemplazos

| Orden en el ZIP | Tema | Archivo original que reemplaza | Vistas de izquierda a derecha |
|---|---|---|---|
| 01 | Acceso e inicio de jornada | Aquamundo_ clientes, cotizaciones y pedidos-3.png | Ingresar → jornada sin iniciar → jornada en curso → Inicio |
| 02 | Agenda y check-in | Agenda móvil y visitas comerciales-2.png | Agenda → detalle de visita → alternativa fuera de zona → visita en curso |
| 03 | Nueva cotización: cliente, productos y cantidades | Actividad y cotizaciones de Pet Market-5.png | Cotizaciones antes de crear → cliente → productos → cantidad aceptada |
| 04 | Cotización: resumen, envío y detalle | Cuatro pantallas de cotización móvil-6.png | Resumen → compartir → cotización Enviada → productos cotizados |
| 05 | Pedido: revisión y registro | Aquamundo_ pedidos y pagos móviles-9.png | Pedidos anteriores → revisar pedido → pedido antes del pago → productos |
| 06 | Pago del pedido: reporte y consulta | Hoja móvil de historial, POP y navegación-10.png | Reportar S/1,440 → reporte enviado → Pago y reserva → historial |
| 07 | Consulta de cotización aprobada | Cuatro pantallas móviles de ventas-8.png | Listado → resumen Aprobada → productos → historial |
| 08 | Solicitudes: visita extraordinaria y POP | Solicitudes y gastos en Aquamundo-11.png | Rama A: solicitar visita → pendiente; Rama B: solicitar POP → detalle |
| 09 | Gastos: registro, comprobante y consulta | Registro de gastos y resultados comerciales-12.png | Registrar gasto → fotografiar comprobante → detalle → listado actualizado |
| 10 | Auditoría, evidencia y cierre de visita | Auditoría, evidencia y cierre de visitas-3.png | Auditoría → capturar evidencia → cerrar con pedido → visita completada |
| 11 | Cartera y consulta del cliente | Cartera, compras y crédito en Aquamundo-4.png | Mi cartera → Resumen → Compras → Crédito y deuda |
| 12 | Cierre anticipado de jornada | Aquamundo_ sincronización, jornada y permisos-13.png | Jornada en curso → cierre anticipado → jornada interrumpida → navegación |
| 13 | Pago de facturas — rama alternativa | Cobranza y solicitudes_ cuatro pantallas móviles-7.png | Facturas → selección → reporte de S/1,600 → confirmación del mismo reporte |

## Guion breve

- Hojas 01–02: Ana inicia su jornada con dos visitas. Muestra el check-in dentro de zona; la tercera vista de la hoja 02 es un caso alternativo de ubicación fuera del radio.
- Hojas 03–06: crear la cotización y el pedido, y reportar el pago. Las vistas previas a crear todavía no muestran COT-1042/PED-1042; las posteriores sí. El pago queda **Esperando archivo**.
- Hoja 07: consultar la cotización ya **Aprobada** y vinculada al pedido.
- Hoja 08: explicar dos ramas de solicitudes. Las vistas 1–2 son visita extraordinaria; las vistas 3–4 son POP. No son cuatro pasos consecutivos de una única solicitud.
- Hoja 09: registrar el gasto de peaje y consultar el listado personal actualizado.
- Hoja 10: auditoría y evidencia de VIS-018, cierre **Con pedido** a las 09:45 y consulta de su resultado.
- Hoja 11: consulta posterior del cliente, sus compras y su crédito. Refleja el estado final precargado en el mockup web.
- Hoja 12: ejemplo alternativo de cierre anticipado a las 12:15. Una visita completada y una pendiente; el pendiente requiere revisión.
- Hoja 13: rama alternativa de pago de facturas. No es una continuación ni una segunda confirmación del pago del pedido.

## Datos que deben mantenerse al explicar

| Concepto | Ejemplo |
|---|---|
| Usuario | Ana Torres · Comercial |
| Día simulado | 16 de octubre de 2026; no representa la fecha real de la presentación |
| Cartera y agenda de Ana | Pet Market San Borja CL-001; Clínica Vet. San Miguel CL-005 |
| Cliente principal | Pet Market San Borja · RUC 20123456789 · Av. San Borja Norte 1234 |
| Producto y precio | Bravery Adulto 7 kg · BRA-AD-7 · S/180 |
| Cantidades | 10 solicitadas; 8 aceptadas; 2 no atendidas |
| Cotización | COT-1042: 09:15 creada, 09:17 enviada; vigencia 23 oct., siete días |
| Pedido | PED-1042: 09:25 · S/1,440 · pendiente de validación |
| Pago del pedido | BCP 845219 · S/1,440 · 09:35 · Esperando archivo |
| Pago de factura, rama alternativa | F00100871 · BCP 845220 · S/1,600 · Esperando archivo |
| Crédito SAP | Límite 5,000; usado 2,600; disponible 2,400; vencido 0 |
| Gasto | GAS-021 · Peaje S/15 · 16 oct., 09:42 · proveedor RUC 20100566871 · Por revisar |
| Cierre de visita | VIS-018 · 09:10–09:45 · 35 minutos · Con pedido · dos evidencias |

**Reportar un pago no equivale a conciliarlo, liberar crédito ni confirmar reserva.** La reserva sigue pendiente de SAP, con seis horas provisionales. Las dos unidades no atendidas son demanda registrada y no comprometen entrega futura.

## Alcance de estas imágenes

Son mockups estáticos de Comercial. Las etapas de creación y captura ilustran la propuesta móvil; la web actual no implementa esas acciones de campo completas. Los radios, cámara y capturas de GPS conservados son ilustrativos, no validaciones demostradas por la web.

Se retiraron de este recorrido las metas personales sin respaldo, la cola de sincronización, los conflictos offline y los permisos. No se incluyeron funciones de Mercaderista ni controles para aprobar, conciliar, reasignar o gestionar Finanzas.

Algunas vistas fueron reagrupadas para mantener las tareas juntas; por eso el contenido actualizado puede diferir del tema sugerido por un nombre antiguo. Usa la columna **Tema** y la numeración del ZIP para presentar.

Edición realizada con la herramienta integrada image_gen. Especificaciones y prompts de edición: `odd/tasks/mobile-commercial-presentation-prompts.json` en el proyecto.

