# Reglas de Proyecto y Guía para Agentes — Frontend (Aquamundo B2B)

Este archivo define las reglas de navegación, arquitectura y restricciones no negociables para cualquier agente de IA o desarrollador que trabaje en este workspace de frontend.

---

## 1. Fuentes de la Verdad (Leer SIEMPRE antes de modificar o crear)

Para evitar alucinaciones o código basado en suposiciones, consulta **siempre** los archivos fuente:

1. **Requisitos de Negocio y Alcance General**:
   - `../REQUISITOS.md`: Especificación central (Consola Gerencial, App Móvil, SAP Business One, SUNAFIL, geocercas de 50m).
   - `BRIEF_ANTIGRAVITY_PROYECTO.md`: Fidelidad visual requerida, lineamientos de diseño y arquitectura frontend.
2. **Modelo de Datos y Base de Datos (Backend)**:
   - `../backend/prisma/schema.prisma`: Entidades reales de PostgreSQL (`Company`, `User`, `Membership`, `Customer`, `Workday`, `Visit`, etc.).
   - `../backend/src/modules/`: Controladores y servicios NestJS por dominio.
3. **Rutas, Permisos y Sesiones (Frontend)**:
   - `src/config/routes.ts`: Mapa centralizado de rutas (`APP_ROUTES`).
   - `src/shared/api/platform.ts`: Políticas declarativas de acceso por rol (`platform_owner`, `manager`).

---

## 2. Arquitectura Frontend Obligatoria (`src/`)

El frontend está estructurado en capas unidireccionales: `shared` -> `modules` -> `app`.

* **`app/` (Next.js App Router)**:
  * **Única responsabilidad**: Enrutamiento y composición básica de páginas.
  * **Prohibido**: Concentrar tablas complejas, lógica de negocio o estado pesado directamente en `page.tsx`. Las páginas solo importan vistas de `modules/` dentro del shell (`DashboardShell`).
* **`modules/` (Lógica de Dominio y Funcionalidades)**:
  * Cada módulo (`platform`, `inicio`, `comercial/*`, `finanzas`) encapsula sus componentes, adaptadores y estado.
  * **Regla estricta de API Pública**: Cada módulo expone su interfaz pública **exclusivamente** a través de `index.ts`. Prohibido importar rutas internas de otro módulo (ejemplo: importar `@/modules/comercial/clientes/data/internal` es inválido; usar `@/modules/comercial/clientes`).
* **`shared/` (Componentes y Utilidades Agnósticas)**:
  * Componentes puramente visuales (`Button`, `DataTable`, `Header`, `Sidebar`, `DashboardShell`).
  * **Prohibido**: Que `shared/` tenga conocimiento o dependa de reglas de negocio específicas de un módulo.

---

## 3. Manejo de Datos: Estrategia Dual (Connected & Standalone)

El frontend opera fluidamente en dos modalidades sin duplicar componentes:

1. **Modo Conectado (Backend NestJS activo en puerto 3002)**:
   * Consumir a través del proxy interno `/api/field/*` y los contratos Zod (`useResource`, `useDirectory`, `apiRequest`).
   * No bypassar el proxy ni saltarse las cookies de sesión `field_session`.
2. **Modo Autónomo / Demo (Sin backend levantado)**:
   * Consumir y persistir en `src/shared/state/demo-store.tsx`.
   * **Prohibido**: Incrustar arrays de datos mock inventados directamente dentro del JSX de los componentes. Los datos deben provenir de adaptadores o del store común.

---

## 4. Roles y Seguridad en el Frontend

* **Superadministrador (`platform_owner`)**:
  * Alcance de plataforma (`scope: "platform"`).
  * Rutas exclusivas en `/admin/*` (Panel global, Empresas tenants, Usuarios globales).
* **Gerente de Empresa (`manager`)**:
  * Alcance de empresa (`scope: "tenant"`).
  * Acceso a `/dashboard`, `/team`, `/customers`, `/routes` y operaciones de campo de su distribuidora.

---

## 5. Reglas de Calidad y Verificación (MANDATORIO)

Antes de dar cualquier tarea por completada o entregar una respuesta:

1. **TypeScript Estricto**:
   ```powershell
   pnpm exec tsc --noEmit
   ```
   No se permiten errores de tipos ni `any` innecesarios.
2. **Preservación de Contratos**:
   * Si una modificación toca contratos de API compartidos, ejecutar:
     ```powershell
     pnpm test:api
     ```
3. **Integridad de Código**:
   * Mantener los comentarios existentes, nombres de variables y estilo del proyecto (Tailwind, Lucide Icons, paleta zinc).

