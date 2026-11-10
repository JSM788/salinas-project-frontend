# Flujo comercial y escenario único (MVP)

Fuente de verdad para que **móvil (diseños `imagenes/mobile`) y web (lo construido)** cuenten la misma historia.
Alcance MVP: **App móvil = comercial** · **Web = supervisión (Gerencia, Operaciones) y Finanzas**.
Regla: el comercial no opera desde la web. Mercaderista: sin diseños todavía (fuera del MVP).

---

## 1. Quién hace qué

| Paso | Actor | Dónde | La web muestra |
|---|---|---|---|
| Asignar cartera y programar agenda | Operaciones | **Web** | — (es acción web) |
| Iniciar jornada, check-in, visita | Comercial | App | Jornada y registro de visita |
| Auditoría de exhibición + fotos | Comercial | App | Detalle de la visita (evidencia) |
| Cotizar (con demanda no atendida) | Comercial | App | Cotizaciones |
| Convertir a pedido | Comercial | App | Pedidos |
| Reportar pago + comprobante | Comercial | App | Pago reportado en Finanzas |
| **Conciliar** con el extracto del banco | Finanzas | **Web** | Pago *Conciliado / Observado* |
| Confirmar reserva y aplicar pago | SAP / ERP | ERP | Estado de reserva y crédito (solo lectura) |
| Cerrar visita / jornada | Comercial | App | Resultado, métricas, cierre anticipado |
| Reasignar visitas pendientes | Operaciones | **Web** | — (es acción web) |
| Revisar solicitudes (visita extra, POP) y gastos | Jefatura / Operaciones | **Web** | — (es acción web) |
| Solicitar visita / POP, registrar gasto | Comercial | App | Aparecen en la bandeja web para revisión |

Acciones **reales de la web** en el MVP: asignar cartera, programar agenda, reasignar pendientes, revisar solicitudes, revisar gastos, conciliar pagos, bloquear/desbloquear líneas de crédito.

---

## 2. Escenario canónico (única fuente de verdad)

**Hoy = viernes 16 oct. 2026.** Vendedor: **Ana Torres** (ana.torres@aquamundo.com).

| Dato | Valor |
|---|---|
| Cliente | **Pet Market San Borja · CL-001** · RUC 20123456789 |
| Dirección | Av. San Borja Norte 1234, San Borja, Lima |
| Contacto | Carlos Pérez · 987 654 321 · carlos@petmarket.com |
| Lista de precios | Minorista Lima |
| Crédito SAP | Límite S/ 5,000 · Usado S/ 2,600 · Disponible S/ 2,400 · Vencido S/ 0 · 52% |
| Facturas pendientes | F00100871 (vence 31 oct.) S/ 1,600 · F00100902 (vence 9 nov.) S/ 1,000 |
| Producto | Bravery Adulto 7 kg · BRA-AD-7 · S/ 180 |
| Cantidades | Solicitadas **10** · Ofrecidas/aceptadas **8** · Demanda no atendida **2** |
| Cotización | **COT-1042** · S/ 1,440 · vigencia hasta 23 oct. 2026 (**7 días calendario**) |
| Pedido | **PED-1042** · S/ 1,440 · 8 uds · Contado |
| Pago | BCP · operación **845219** · S/ 1,440 |
| Visita | **VIS-018** · agenda 09:00–10:00 · resultado **Con pedido** |
| Reserva SAP | Provisional **6 horas**, pendiente de validación |

### Línea de tiempo coherente (16 oct. 2026)

| Hora | Evento | Dónde se ve |
|---|---|---|
| 08:00 | Inicio de jornada (5 visitas) | App · web Jornadas |
| 09:10 | Check-in en Pet Market (24 m, dentro de zona) | App · web Registros |
| 09:15 | Cotización COT-1042 generada (8 × S/ 180) | App · web Cotizaciones |
| 09:17 | PDF compartido por WhatsApp → cotización **Enviada** | App · web Cotización / Historial |
| 09:25 | Cliente acepta 8 uds → **PED-1042** registrado | App · web Pedidos |
| 09:35 | **Pago reportado** BCP 845219 S/ 1,440 → *Esperando archivo* | App · web Finanzas |
| 09:40 | Auditoría de exhibición + foto | App · web Registros |
| 09:42 | Gasto GAS-021 (peaje S/ 15) | App · web Gastos |
| 09:45 | Cierre de visita **Con pedido** / check-out | App · web Registros |
| Después | Finanzas importa extracto → pago **Conciliado** → SAP confirma reserva | Web Finanzas / Pedido |

Archivo de Finanzas (extracto): última actualización **08:00** del mismo día, anterior al pago, por eso queda "Esperando archivo".

### Cartera de Ana Torres y otros registros (valores fijos)
- Pedidos de Pet Market en octubre: PED-1042 (S/ 1,440, pendiente) · PED-1031 (10 oct., Conciliado) · PED-1018 (2 oct., Conciliado). Suman **S/ 3,200** = "compras del mes".
- COT-1038 · **Mundo Animal** · 14 oct. · S/ 730 · Borrador.
- Solicitudes: SOL-018 (Pendiente, 20 oct.) · SOL-017 (Aprobada, 15 oct.). POP: POP-012 (Pendiente) · POP-011 (Aprobada).
- Gastos: GAS-019 S/ 45 · GAS-020 S/ 25 · GAS-021 S/ 15 → total **S/ 85**.
- Resultados: meta S/ 20,000 · actual S/ 12,800 (64%) · visitas 18/25 (72%) · hit rate 55.6%.

---

## 3. Incoherencias de los diseños móviles y resolución adoptada

| # | Incoherencia en las imágenes | Resolución |
|---|---|---|
| 1 | Vigencia "3 días" para 16 → 23 oct. (son 7) | **7 días calendario** |
| 2 | COT-1042 generada el 15 oct. 16:05 (M46) y el 16 oct. 09:41 (M23) | **16 oct., 09:15** (ver línea de tiempo) |
| 3 | PED-1042 "15 oct." / "ayer 16 oct. 16:20" / "16 oct. 16:20" | **16 oct., 09:25** |
| 4 | Pago 09:35 antes que la cotización enviada 09:43 | Cotización 09:15–09:17, pedido 09:25, pago 09:35 |
| 5 | Misma visita: "Sin compra / Aún tiene stock" (M11) vs "Con pedido" (M51) | **Con pedido** (M11 queda como ejemplo de *otra* visita) |
| 6 | Horarios de VIS-018: 09:10 vs 08:15–10:30 (M43) | check-in 09:10, check-out 09:45 |
| 7 | Jornada "2 de 5" (M02/M04/M12) vs "4 completadas, 1 pendiente" (M43) | M43 es *otro* escenario (jornada finalizada); se etiqueta así |
| 8 | CL-002 / CL-003 con nombres y distritos distintos según pantalla | Un solo maestro de clientes (ver §5) |
| 9 | Pedidos PED-1031/1018 atribuidos a Pet Market (M15) y a otros clientes (M25) | Pertenecen a **Pet Market** (suman S/ 3,200) |
| 10 | PED-1031: 7 uds a S/ 150 ≠ S/ 980 | Bravery Gato 2 kg a **S/ 140** (7 × 140 = 980) en todo el sistema |
| 11 | Facturas FAC-7781/7810 vs F00100871/F00100902 | **F00100871 / F00100902** |
| 12 | Dirección "San Borja Sur" (M14) vs "Norte" | **Norte** |
| 13 | Contacto Luis Pérez (M19) vs Carlos Pérez (M14) | **Carlos Pérez** |
| 14 | GAS-021 fechado 15 oct. (M36) y 16 oct. (M37) | **16 oct. 09:42** |
| 15 | "Material POP 1" (M32) vs 2 registros (M50) | **2** |
| 16 | Estados del pago: "Esperando archivo" / "A la espera de archivo" / "En espera…" | **Esperando archivo** |
| 17 | "Archivo de Finanzas" vs "Finance Drive" | **Archivo de Finanzas** |
| 18 | M42 (stock 8→6) presentado como si fuera el mismo pedido | Escenario **alternativo** etiquetado: "Stock actualizado" |

> Los números 5, 10 y 18 son decisiones mías; si el negocio prefiere otra, se cambia en un solo lugar (el maestro de datos).

---

## 4. Mapa de brechas: móvil ↔ web

### 4.1 La web tiene algo que es del móvil (se OCULTA, no se elimina)
- `VisitaActivaView` (ruta `/comercial/visitas-jornadas/visita-activa/`): pantalla del comercial en campo. **Se conserva sin enlaces de entrada** (decisión del usuario: ocultar, no borrar).
- `NuevaCotizacionView`, `NuevoPedidoView`, `ReportarPagoDrawer`, `RegistrarGastoDrawer`, `SolicitarVisitaDrawer`, `SolicitarMaterialPOPDrawer`: acciones del comercial. Siguen ocultas y se conservan; las rutas `cotizaciones/nueva` y `pedidos/nuevo` quedan accesibles solo por URL.
- Botón "Convertir a pedido" y similares: comentados con "Ocultado temporalmente"; se conservan para reactivarlos cuando se defina el flujo.

### 4.2 El móvil produce datos que la web no muestra todavía
| Dato móvil | Web hoy | Falta |
|---|---|---|
| Resultado de visita + observaciones + fotos de cierre (M11, M51) | Registros muestra una fila | Detalle de visita con resultado, evidencia y GPS |
| Auditoría de exhibición: stock en góndola, marca, precios, foto (M09) | No existe | Bloque "Auditoría" en el detalle de visita |
| Check-in/check-out con distancia y precisión GPS | No existe | Eventos en el detalle de jornada/visita |
| Cierre anticipado de jornada con motivo (M12) → "se reasigna desde la web" | "Reasignar pendientes" no hace nada | Reasignación real (a otro vendedor) con estado |
| Demanda no atendida (2 uds) | Solo texto fijo | Mostrarla desde los datos y, idealmente, un resumen agregado |
| Reserva SAP provisional 6 h | Texto fijo | Estado y vencimiento desde el pedido |
| Resultados / metas (M40) | Inicio con datos fijos de 2025 | Dashboard alimentado por el mismo maestro |
| Gasto "Por revisar" → "Revisado" (M36) | Tabla + detalle de solo lectura | Acción *Revisar / Aprobar / Observar* |
| Solicitud de visita/POP "Pendiente" → "Aprobada" | Existe revisar | Que el cambio se refleje en el estado compartido |

### 4.3 La web tiene algo que el móvil no necesita
`Catálogo`, `Inventario`, `Reportes`, `Configuración` (páginas vacías, ya fuera del menú): se mantienen ocultas; no afectan el MVP.

### 4.4 Pantallas o destinos que faltan
- Detalle de visita (web) desde Registros / Agenda.
- Pantalla de **importar extracto** en Conciliación (§6).
- Pedidos y cotizaciones **de todos los clientes** deben tener detalle propio (hoy solo existen PED-1042 y PED-1031).
- Ficha de cliente real para los clientes que aparecen en Finanzas (hoy los IDs no coinciden).
- Destinos de enlaces sin salida: "Ver todas", "Abrir comprobante" (usa `alert`), "Vista previa PDF", "Vista de gerencia".

---

## 5. Maestro de clientes (a fijar al implementar)

Se parte de `src/mocks/clientes.mock.ts` (6 clientes, ya usados por la web) y se alinea con los diseños: **CL-001 Pet Market San Borja**, **CL-002 Mundo Animal (Surco)**, y los demás con **un solo** nombre, RUC, distrito y vendedor repetido en Clientes, Ventas, Finanzas, Visitas e Inicio. Finanzas deja de definir sus propios clientes y los toma del maestro.

---

## 6. Conciliación con el extracto (SAP / Finanzas)

Hoy es **manual** (abrir pago → mirar voucher → Conciliar/Observar) y no actualiza el pedido.

Propuesta: botón **Importar extracto** en la bandeja de Conciliación.
1. Finanzas sube el Excel; se lee en el navegador.
2. Cruce por **N° de operación + monto** (banco y fecha como apoyo).
3. Resultado por pago: *Coincide* · *Monto distinto* · *No figura en el extracto* · *Ya conciliado*.
4. Confirmación en bloque de los que coinciden; excepciones a mano.
5. Al conciliar, el pedido pasa a *Pago conciliado* y queda *Reserva por confirmar* hasta que SAP confirme.

Pendiente: formato real de las columnas del Excel (se deja configurable).

---

## 7. Cómo se simula sin móvil

El estado vive en un **store compartido persistido en `localStorage`** (misma app, mismo origen). No se construye prototipo móvil (decisión del usuario): lo que haría la app ya está "ocurrido" en los datos de partida y la web supervisa desde ahí.

### Guion de demo end-to-end
1. **Web · Operaciones** → Clientes → Asignaciones: Pet Market está asignado a Ana Torres. Visitas → Agenda: visita VIS-018 programada 09:00.
2. **App · Ana** → inicia jornada → check-in (24 m) → crea cotización COT-1042 (10 solicitadas, 8 ofrecidas) → comparte PDF.
3. **Web** → Ventas → COT-1042 *Enviada* con su Historial y demanda no atendida de 2.
4. **App** → convierte a pedido PED-1042 → reporta pago BCP 845219.
5. **Web · Finanzas** → Conciliación: aparece el pago *Esperando archivo* → **Importar extracto** → coincide → **Conciliar**.
6. **Web** → PED-1042: pago *Conciliado*, reserva *Por confirmar* (SAP); crédito de Pet Market sin cambios hasta SAP.
7. **App** → cierra visita *Con pedido* → **Web** → Registros / Jornada muestran el resultado y la evidencia.
