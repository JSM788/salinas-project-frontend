# Guía para simular el flujo (demo web)

La app móvil no existe todavía, así que **lo que hace el comercial ya ocurrió en los datos de partida** (hoy es viernes 16 oct. 2026). La web es la vista de supervisión: tú juegas el papel de Gerencia, Operaciones y Finanzas.

## Antes de empezar
1. Ejecuta `npm run dev` y abre http://localhost:3000.
2. En el login elige un perfil (Gerencia, Operaciones o Finanzas) y pulsa **Ingresar al sistema**. Usa **Gerencia** para recorrer todo.
3. Todo lo que hagas se guarda en el navegador. Para volver al inicio: **Reiniciar demo** (pie de cualquier pantalla).

## Qué ya hizo el comercial (Ana Torres, app móvil)
| Hora | Hecho | Dónde lo ves en la web |
|---|---|---|
| 08:00 | Inició su jornada | Visitas y jornadas → Jornadas |
| 09:10 | Check-in en Pet Market San Borja | Visitas y jornadas → Registros → VIS-018 |
| 09:15 | Generó la cotización **COT-1042** (pidió 10, ofreció 8, 2 de demanda no atendida) | Ventas → Cotizaciones → COT-1042 |
| 09:17 | Compartió el PDF (cotización *Enviada*) | COT-1042 → Historial |
| 09:25 | El cliente aceptó 8 unidades → pedido **PED-1042** (S/ 1,440) | Ventas → Pedidos → PED-1042 |
| 09:35 | Reportó el pago: BCP, operación 845219, S/ 1,440 | Finanzas → Conciliación |
| 09:45 | Cerró la visita *Con pedido* | Registros → VIS-018 |

## Guion A — Gerencia: seguir la historia de un cliente
1. **Inicio**: indicadores del mes (ventas S/ 8,080, 8 pedidos, 3 pagos por conciliar). Todo sale de los mismos datos que las demás pantallas.
2. **Comercial → Clientes → Pet Market San Borja**: pestañas *Resumen*, *Compras* (3 pedidos de octubre = S/ 3,200), *Crédito y deuda* (límite S/ 5,000, usado S/ 2,600, 2 facturas) y *Actividad* (visita, cotización, pedido y pago en orden).
3. **Comercial → Ventas → Cotizaciones → COT-1042**: *Resumen* (con vista previa del PDF), *Productos* (10 solicitadas, 8 ofrecidas, 2 no atendidas) e *Historial*.
4. **Ventas → Pedidos → PED-1042**: *Resumen*, *Productos*, *Pago y reserva* e *Historial*.
5. Abre otro pedido (por ejemplo PED-1031): cada uno muestra **sus propios datos**.

## Guion B — Finanzas: conciliar con el extracto del banco
1. Entra a **Finanzas → Conciliación de pagos**. Hay 2 pagos *Esperando archivo*: PED-1042 (S/ 1,440) y PED-1041 (S/ 620).
2. Pulsa **Descargar extracto de ejemplo** (genera un Excel con las columnas Fecha, Banco, N° de operación, Descripción, Monto).
3. Pulsa **Importar extracto** y selecciona ese archivo. Resultado esperado:
   - **Coincide: 1** (PED-1042: misma operación y mismo monto).
   - **Monto distinto: 2** (PED-1041: S/ 620 contra S/ 600; PED-1035: S/ 1,100 contra S/ 1,050).
   - **Ya conciliado: 5**.
   - **2 movimientos sin pago reportado** (haz clic en el enlace para verlos).
4. Pulsa **Conciliar coincidencias (1)**. PED-1042 pasa a *Conciliado* y el indicador **Conciliados hoy** sube a S/ 1,440.
5. Abre **PED-1041 → Revisar**: el drawer muestra la diferencia de S/ 20. Pulsa **Observar**, escribe el motivo y confirma: el pedido queda *Observado*.
6. Ve a **Ventas → Pedidos → PED-1042 → Pago y reserva**. El pago figura *Conciliado* y la reserva sigue *Confirmación SAP pendiente*.
7. En la misma pestaña, pulsa **Simular confirmación de SAP** (solo disponible con el pago conciliado). La reserva pasa a *confirmada* y el pedido a *Validado*. En producción, esa respuesta llega por la integración con SAP.
8. En **Líneas de crédito**, bloquea o desbloquea una línea (por ejemplo la de Agrovet San Miguel).

## Guion C — Operaciones: asignar, reasignar, revisar
1. **Clientes → Asignaciones**: selecciona clientes y pulsa **Asignar vendedor**. El cambio se ve en la tabla y en la ficha.
2. **Visitas y jornadas → Agenda**: programa una visita (elige el cliente; el vendedor es el asignado a ese cliente).
3. **Visitas y jornadas → Jornadas**: la jornada de **Lucía Mendoza** figura *Interrumpida* con una visita pendiente. Ábrela → **Reasignar pendientes** → elige otro vendedor → confirma. Los avances de ambos vendedores se actualizan.
4. **Solicitudes**: aprueba o rechaza una visita extraordinaria o un material POP (rechazar exige un motivo).
5. **Gastos**: abre GAS-021 (peaje de hoy) y **Marcar como revisado**.

## Lo que está oculto a propósito
Todo lo que corresponde a la app del comercial queda comentado en la web como *Ocultado temporalmente: acción ejecutada en App Móvil / ERP*: crear cotizaciones y pedidos, reportar pagos, registrar gastos, solicitar visitas o material POP, finalizar jornada y refrigerio. No se borró; se reactiva descomentando.

## Límites que conviene explicar al cliente
- **No hay backend**: los cambios viven en el navegador y se pierden al reiniciar la demo o limpiar los datos del sitio.
- **El Excel del banco es de ejemplo**: las columnas reales se ajustan en `src/modules/finanzas/services/extracto.service.ts` (alias de cabeceras).
- **SAP está simulado**: la confirmación de reserva se dispara con un botón de demo.
- Un **cliente nuevo** creado desde la web aparece en las listas, pero su ficha estará disponible cuando exista la integración con el ERP.
- Los roles solo recortan el menú; no hay bloqueo de rutas por rol.
