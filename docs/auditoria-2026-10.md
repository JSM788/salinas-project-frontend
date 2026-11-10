# Auditoría del proyecto Aquamundo B2B — octubre 2026

Auditoría de solo lectura. Severidad: **Alta** = rompe la demo o da información falsa · **Media** = deuda que crece con cada pantalla · **Baja** = pulido.

---

## 0. Resumen en 30 segundos

1. **La app es una maqueta de un solo escenario.** Casi todas las vistas de detalle tienen fijo en el código el caso *Pet Market / COT-1042 / PED-1042 / Ana Torres*. Abrir otro pedido, cliente o jornada muestra los mismos datos.
2. **Los mocks se contradicen entre sí.** El mismo `cl-004` es "Mascotas y Más" en Clientes y "Pet Center La Molina" en Finanzas. El crédito de Pet Market vale 5.000 en una pantalla y 15.000 en otra. Hay fechas imposibles.
3. **El flujo de negocio no avanza.** Ninguna acción mueve una entidad al paso siguiente: la cotización nunca se aprueba y conciliar un pago no valida el pedido. Las acciones clave se ocultaron porque viven en la App Móvil o el ERP.
4. **Hay enlaces que terminan en 404.** Cuatro pagos de Finanzas apuntan a pedidos que no existen.
5. **La seguridad es solo visual.** El login no verifica contraseñas, el rol vive en `localStorage` y no hay bloqueo de rutas por rol.
6. **El build oculta errores.** `next.config.mjs` ignora los errores de TypeScript y ESLint.

---

## 1. Cómo simular la app

### Arrancar
```bash
npm run dev
```
Abrir http://localhost:3000. En la pantalla de login, elegir un perfil (los botones autocompletan los datos) y pulsar **Ingresar al sistema**.

| Perfil | Persona | Llega a | Ve en el menú |
|---|---|---|---|
| Gerencia | Juan García | `/inicio/` | Inicio, Comercial, Finanzas |
| Operaciones | Roberto Méndez | `/comercial/clientes/` | Inicio, Comercial, Finanzas |
| Finanzas | Elena Castro | `/finanzas/` | Solo Finanzas |

### El flujo de negocio (lo que la app *representa*)

```
Cliente → Visita / jornada → Cotización → Pedido → Pago reportado → Conciliación (Finanzas) → Reserva SAP → Crédito / deuda
          (App Móvil)       (App Móvil)  (App Móvil)  (App Móvil)       (WEB ✔)                  (ERP)        (WEB, solo lectura)
```

La **web es un back-office de supervisión**: el vendedor hace casi todo desde la App Móvil y la web solo *muestra* el resultado. Las únicas acciones reales de la web son asignar vendedor, conciliar u observar pagos, bloquear líneas de crédito y revisar solicitudes. **Todas se pierden al recargar**, porque no hay persistencia.

### Guion A — Gerencia: la historia de un cliente
1. Entrar como Gerencia → **Inicio**.
2. Comercial → Clientes → **Pet Market San Borja** (`cl-001`) → recorrer las pestañas Resumen, Compras, Crédito y deuda, Actividad.
3. Ventas → Cotizaciones → **COT-1042** → Resumen, Productos, Historial.
4. Ventas → Pedidos → **PED-1042** → Resumen, Productos, Pago y reserva, Historial.
5. Finanzas → Conciliación → abrir el pago de **PED-1042** → **Conciliar** (el badge cambia).

### Guion B — Operaciones: trabajo de campo
1. Entrar como Operaciones → Clientes → pestaña **Asignaciones** → seleccionar 2 clientes → Asignar vendedor (cambia la tabla).
2. Visitas y jornadas → Agenda → Jornadas → **j-01**.
3. Pestaña Registros → abrir una visita → "Ver cliente".
4. Solicitudes → revisar una visita extraordinaria → Material POP → Ver detalle → Gastos → Ver detalle.

### Guion C — Finanzas: cobranza
1. Entrar como Finanzas.
2. Conciliación → filtrar BCP → abrir un pago → **Observar**.
3. Cuentas por cobrar → filtrar "En mora".
4. Líneas de crédito → **Bloquear** una línea activa.

### ⚠️ Qué evitar durante una demo
- Usar solo **PED-1042** y **COT-1042**. Los demás detalles muestran datos de PED-1042 o dan 404.
- No abrir "Ver pedido" en los pagos 002 a 005 de Finanzas: dan 404.
- No abrir jornadas distintas de j-01: todas muestran "Ana Torres".
- No recargar después de una acción: el cambio se pierde.

---

## 2. Incoherencias en el flujo (lo más importante)

### Alta
| # | Problema | Evidencia |
|---|---|---|
| F1 | **El mismo ID de cliente es otra empresa.** `cl-004` es "Mascotas y Más" en Clientes y "Pet Center La Molina" en Finanzas. `cl-005` es "Clínica Vet. San Miguel" en un lado y "Distribuidora Patitas" en el otro. Los RUC también están cruzados. | `src/mocks/clientes.mock.ts:80-82` vs `src/modules/finanzas/mocks/finanzas.mock.ts:131-134` |
| F2 | **El crédito de Pet Market no cuadra.** Clientes: límite 5.000, deuda 2.300, disponible 2.400 (debería ser 2.700). Finanzas: límite 15.000, deuda 3.450. Documentos pendientes: 2.600. | `clientes.mock.ts:36-39`, `finanzas.mock.ts:306-307,387-389`, `ClienteCreditoTab.tsx:27-44` |
| F3 | **PED-1042 se contradice.** El estado del pago dice "Pendiente / Esperando archivo", pero el timeline ya registra "Pago reportado". El número de operación es 845219 en Ventas y 00984124 en Finanzas. | `ventas.mock.ts:157`, `PedidoResumenTab.tsx:107,193`, `finanzas.mock.ts:230` |
| F4 | **COT-1042 sigue "Enviada"** aunque ya existe PED-1042 generado desde ella. Nunca pasa a "Aprobada". | `ventas.mock.ts:53` |
| F5 | **Las acciones no propagan su efecto.** Conciliar un pago no valida el pedido ni confirma la reserva: solo cambia un `useState` local de la tabla. | `ConciliacionPagosTable.tsx:40-48` |
| F6 | **Las vistas de detalle ignoran la entidad.** PED-1031 está Validado, Conciliado y por S/ 620, pero se muestra "Pendiente de validación", S/ 1,440 y Bravery 7 kg. Todas las jornadas son de Ana Torres. | ver §3 |
| F7 | **Enlaces a 404.** Los pagos de Finanzas apuntan a `ped-1041/1039/1037/1035` y Compras a `ped-1018`, pero solo existen `ped-1042` y `ped-1031`. | `finanzas.mock.ts:22-67`, `ConciliacionPagosTable.tsx:58`, `ClienteComprasTab.tsx:56` |

### Media
- **Fechas imposibles.** El pedido se crea el 15 oct., antes que la cotización (16 oct.). COT-1038 a 1041 vencen en **2025**, antes de su emisión en 2026. Inicio y los filtros muestran "mar. 2025". (`ventas.mock.ts:50,75,98,110,122`, `PedidoResumenTab.tsx:61`, `PedidosTable.tsx:121`, `inicio/page.tsx:32,66-72`)
- **Nombres de cliente distintos para el mismo cliente:** "Pet Market (CL-001)", "Pet Market" y "Pet Market San Borja". Lo mismo con "Mundo Animal" y "Mundo Animal Surco".
- **Vendedor distinto para el mismo cliente:** `cl-003` es de "Lucía Mendoza" en Clientes y Finanzas, pero de "Luis Ramos" en Ventas y Agenda.
- **COT-1038 a 1040 tienen `items: []`** pero montos de 730 a 1.250. La pestaña Productos calcula 0, mientras Resumen fija "10/8/2".
- **El filtro "Estado" de Pedidos no filtra.** No existe `matchesStatus`. (`PedidosTable.tsx:24-30`)
- **Los KPIs de Finanzas están fijos** ("Conciliados hoy S/ 3,000 · 2 pedidos validados") y no salen de los datos. (`FinanzasView.tsx:114-116`)
- **"Nueva cotización" y "Nuevo pedido" no guardan nada.** Siempre redirigen a COT-1042 o PED-1042. (`NuevaCotizacionView.tsx:236`, `NuevoPedidoView.tsx:185`)

### Terminología (media/baja)
| Concepto | Variantes encontradas | Propuesta |
|---|---|---|
| Cantidad confirmada | "Ofrecidas" (cotización) · "Aceptadas" (pedido) · "productos" (cuando son unidades) | Ofrecidas → en el pedido, "Confirmadas"; siempre "unidades" |
| Vendedor | "Vendedor" · "Ejecutiva comercial" · "Comercial:" | Un solo término: **Vendedor** |
| Pago pendiente | "Pendiente" · "Pendiente de conciliación" · "Esperando archivo" | Estados del modelo, mostrados con un mapa único |
| Cliente moroso | "Con atraso" (Clientes) · "En mora" (Finanzas) | Uno solo |

### Roles
- **Alta:** no hay guardia de rutas. Finanzas solo tiene el menú recortado y llega a `/comercial/*` desde sus propios enlaces. `/` siempre redirige a Clientes, también para Finanzas. (`Sidebar.tsx:72-75`, `app/page.tsx:10`)
- **Media:** Gerencia y Operaciones ven exactamente lo mismo. "Aprobar/Rechazar" en Solicitudes está activo para todos.
- **Media:** `/comercial/visitas-jornadas/visita-activa/` no tiene ningún enlace de entrada, pero mantiene activos "Cotizar", "Crear pedido" y "Reportar pago", que se ocultaron en el resto de la app.

---

## 3. Datos hardcodeados (ignoran sus props)

Causa raíz de F6: el componente recibe la entidad y escribe el escenario a mano.

| Componente | Qué tiene fijo |
|---|---|
| `ventas/components/PedidoHistorialTab.tsx` | No usa `pedido` en ninguna línea; todo el timeline y los estados están fijos |
| `ventas/components/PedidoProductosTab.tsx` | Fila del producto, 10/8/2 unidades, tarjetas de estado (solo usa `pedido.total`) |
| `ventas/components/PedidoResumenTab.tsx` | Dirección, fecha, condición de pago, estados, pago BCP; respaldos falsos `"CL-001"` y `"COT-1042"` |
| `ventas/components/DetallePedidoView.tsx` | Pestaña Pago y reserva: ignora `paymentStatus`, `reservationStatus` y `orderStatus` |
| `ventas/components/DetalleCotizacionView.tsx:103-163` | Resumen 10/8/2 y vista previa del PDF (cliente, RUC, fila de producto) |
| `ventas/components/CotizacionHistorialTab.tsx` | Fechas de los eventos y "Creada" (el modelo no tiene `timeline` ni `createdAt`) |
| `clientes/components/ClienteActividadTab.tsx` | No usa `cliente`; toda la actividad está fija |
| `clientes/components/ClienteComprasTab.tsx` | `COMPRAS_MOCK` definido dentro del componente, igual para todos los clientes |
| `clientes/components/ClienteCreditoTab.tsx` | Documentos pendientes fijos y respaldos inventados (`?? 5000`) |
| `clientes/components/ClienteFichaView.tsx:228-257` | Actividad reciente |
| `visitas-jornadas/components/DetalleJornadaView.tsx` | No recibe props; la página `jornada/[id]` ignora `params` |
| `visitas-jornadas/components/VisitaActivaView.tsx`, `RegistroVisitaDrawer.tsx:33` | Pet Market y enlace fijo a `cl-001` |
| `app/inicio/page.tsx` | Todo el dashboard está dentro de la página (368 líneas) |

---

## 4. Malas prácticas y constantes no globales

### Alta
- **Login sin verificar contraseña.** El usuario `operaciones` entra con cualquier contraseña, igual que "opera" + "123", o la contraseña "admin" con cualquier usuario. Las contraseñas viajan en texto plano en el bundle y el rol se puede editar desde `localStorage`. (`src/shared/lib/auth-context.tsx:15-60,108-160`) → Al ser un export estático no hay backend, así que hay que **documentarlo como demo**. Como mínimo: validar contra `USERS_DB` y agregar un `RoleGuard` en `DashboardShell`.
- **El build ignora errores.** `next.config.mjs:15,18` tiene `ignoreBuildErrors` e `ignoreDuringBuilds`. Hay un error de tipos real escondido: `ConciliacionPagosTable.tsx:129` usa `variant="default"`, que no existe.

### Media
- **Tarjetas de estado Pago/Reserva/Pedido copiadas 4 veces** → crear un componente `<PedidoStatusCards pedido>`.
- **Más de 20 formateos de moneda a mano** (`S/ ${x.toLocaleString()}`) en vez de `formatCurrency`. No hay helper de fechas: todas son strings.
- **Mapas estado→color de badge repetidos en 6 componentes** → un `STATUS_BADGE` por dominio en `models/`.
- **Los mocks redefinen los tipos** (`MockPedido`, `MockCotizacion`…) en vez de importarlos del modelo. Así es como se cuelan valores que el modelo no admite.
- **`src/config/navigation.ts` no se usa.** El Sidebar redefine el menú por su cuenta. Los roles son strings sueltos.
- **Mocks en dos lugares:** `src/mocks/` y `src/modules/finanzas/mocks/`. Finanzas no tiene `services/` y exporta los mocks como API pública. `SeleccionarProductosModal` importa `PRODUCTOS_MOCK` directamente.
- **Filtros que no filtran:** `PedidoHistorialTab`, `ClienteActividadTab`, `ClienteCreditoTab` (vencimiento) y `PedidosTable` (estado).
- **Botones sin acción:** "Vista previa PDF", "Vista de gerencia", "Reasignar pendientes", "Ver todas", etc.
- **Accesibilidad:** no hay ni un `aria-label` en el proyecto. Hay botones de solo icono sin nombre accesible y `<Button>` dentro de `<Link>`.

### Baja
- Hex repetidos (`bg-[#27272a]` 11 veces) → token en Tailwind.
- "Aquamundo" escrito en 7 sitios → `APP_CONFIG.companyName`.
- La lista de vendedores está copiada en 8 selects → obtenerla de un servicio.
- Uso de `any` (2 casos), índice como `key` (6 casos), `"use client"` innecesario e imports sin usar.

---

## 5. Propuesta de mejoras (en orden)

| Fase | Qué | Por qué primero |
|---|---|---|
| **1. Una sola fuente de datos** | Unificar los mocks en `src/mocks/` con IDs, nombres, RUC, vendedores, montos y fechas coherentes. Que los mocks importen los tipos del modelo. Agregar `finanzas.service.ts`. | Todo lo demás depende de esto. Arregla F1–F4 y F7. |
| **2. Vistas guiadas por datos** | Eliminar los hardcodeos de §3: cada detalle renderiza su entidad (`pedido.items`, `pedido.timeline`, estados). Ampliar los modelos (`timeline`, `createdAt`, dirección, pago reportado). | Arregla F6: cualquier ID muestra su propia información. |
| **3. Componentes y constantes compartidas** | `PedidoStatusCards`, `STATUS_BADGE` por dominio, `formatCurrency` y `formatDate` en todas partes, tokens de color, `APP_CONFIG`, el Sidebar leyendo `config/navigation.ts`. | Elimina la duplicación que hace divergir las pantallas. |
| **4. Flujo que avanza** | Un store de demo (React context + `localStorage`) donde conciliar actualice el pedido, la cotización pase a "Aprobada", etc. | Permite una demo creíble de punta a punta. |
| **5. Roles y calidad** | `RoleGuard` por ruta, redirección por rol en `/`, quitar `ignoreBuildErrors`, corregir el error de tipos, `aria-label`. | Cierra los agujeros y evita regresiones silenciosas. |

**Decisión de producto pendiente:** ¿la web solo supervisa (lo que hace la App Móvil se ve en modo lectura) o también opera? Hoy está a medio camino: hay acciones ocultas y la pantalla `visita-activa` las sigue mostrando. Conviene definirlo antes de la fase 4.
