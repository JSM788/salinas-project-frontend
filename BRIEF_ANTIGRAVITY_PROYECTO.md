# BRIEF DEL PROYECTO — MOCKUP B2B COMERCIAL

## 1. Objetivo principal

Construir una maqueta frontend navegable de una plataforma B2B de gestión comercial, preparada para crecer posteriormente hacia un sistema real de mayor escala.

En esta etapa el proyecto es **solo frontend con datos simulados**, pero debe quedar organizado desde el inicio con una arquitectura profesional, modular y mantenible.

El objetivo no es únicamente “hacer pantallas”.

Hay dos prioridades no negociables:

1. **Arquitectura limpia y escalable.**
2. **Fidelidad visual máxima respecto a las imágenes de referencia.**

---

# 2. Prioridad absoluta: fidelidad visual

Las imágenes ubicadas en la carpeta de diseños son la referencia visual principal.

La implementación debe reproducirlas con la **máxima fidelidad posible**.

No se desea una reinterpretación.

No se desea una versión “inspirada en”.

No se desea que la IA cambie el diseño por uno que considere mejor.

Debe reproducirse fielmente:

- layout
- sidebar
- header
- proporciones
- anchos
- alturas
- márgenes
- paddings
- espaciados
- tipografía
- tamaños de texto
- jerarquía visual
- bordes
- radios
- sombras
- tablas
- filtros
- formularios
- botones
- badges
- tabs
- paneles laterales
- cards
- estados visuales
- distribución de elementos
- densidad de información

El objetivo es que una comparación lado a lado entre la referencia y la implementación muestre diferencias mínimas.

## Regla

**No mejorar, reinterpretar ni rediseñar las imágenes de referencia por iniciativa propia.**

Si existe una decisión visual dudosa, debe intentarse reproducir la referencia antes que sustituirla por una solución diferente.

---

# 3. Fuente de verdad

Existen dos fuentes de verdad diferentes:

## Apariencia

Las imágenes mandan sobre:

- composición
- disposición
- tamaños
- diseño visual
- espaciados
- jerarquía
- componentes visibles

## Funcionalidad y estructura

La documentación manda sobre:

- nombres
- módulos
- navegación
- pestañas
- funcionalidades
- reglas de negocio simuladas
- organización del proyecto

Si una imagen contiene una inconsistencia accidental respecto a la documentación, **prevalece la documentación para la funcionalidad**.

Ejemplo conocido:

- `Solicitudes` contiene:
  - Visitas extraordinarias
  - Material POP
- `Gastos` no contiene pestañas.

No deben inventarse pestañas adicionales aunque alguna referencia generada previamente las muestre.

---

# 4. Alcance actual

El alcance actual es:

- Frontend.
- Mockup navegable.
- Datos ficticios coherentes.
- Interacciones de demostración.
- Estado local.
- Sin backend real.
- Sin base de datos real.
- Sin autenticación real.
- Sin seguridad real.
- Sin integración real con servicios externos.

Sí deben funcionar visualmente las interacciones necesarias para demostrar el sistema, por ejemplo:

- navegación
- cambio de pestañas
- apertura de paneles
- apertura de modales si la referencia lo requiere
- filtros visuales
- selección de filas
- selección de productos
- formularios simulados
- cambios de estado simulados

No implementar infraestructura innecesaria que todavía no pertenece a esta fase.

---

# 5. Stack base

Usar:

- Next.js
- App Router
- TypeScript estricto
- pnpm
- Tailwind CSS
- shadcn/ui cuando sea útil como base técnica

IMPORTANTE:

shadcn/ui es una base de implementación, **no una referencia de diseño**.

Si el aspecto visual predeterminado de un componente no coincide con las imágenes, debe adaptarse hasta coincidir con ellas.

No sustituir el diseño de referencia por el diseño por defecto de la librería.

Evitar agregar dependencias sin necesidad real.

---

# 6. Arquitectura

Este proyecto está pensado para crecer considerablemente.

La organización debe evitar que, con el tiempo, el código termine concentrado en carpetas genéricas sin límites claros.

La estructura base será la siguiente:

```text
src/
├── app/                             # SOLO Routing y composición de páginas (Next.js App Router)
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── comercial/
│   │   │   ├── clientes/
│   │   │   └── ventas/
│   │   └── finanzas/
│   │       └── conciliacion/
│   └── api/                         # Route handlers si aplican
│
├── modules/                         # LÓGICA DE DOMINIO Y NEGOCIO
│   ├── comercial/
│   │   ├── clientes/
│   │   │   ├── adapters/            # DTO Backend -> Model UI
│   │   │   ├── components/          # Componentes específicos de Clientes
│   │   │   ├── hooks/               # Hooks propios del módulo
│   │   │   ├── models/              # Modelos y schemas
│   │   │   ├── services/            # Acceso a datos / contratos del módulo
│   │   │   └── index.ts             # Public API del módulo
│   │   ├── ventas/
│   │   └── ...
│   │
│   └── finanzas/
│       ├── conciliacion/
│       └── ...
│
├── shared/                          # COMPONENTES Y UTILIDADES AGNÓSTICAS AL NEGOCIO
│   ├── components/
│   │   ├── buttons/
│   │   ├── dialogs/
│   │   ├── form-controls/
│   │   └── data-table/
│   ├── hooks/
│   ├── interceptors/
│   ├── lib/
│   └── types/
│
├── config/                          # Variables de entorno validadas y constantes globales
└── assets/                          # Fuentes, iconos e imágenes estáticas
```

La estructura puede ampliarse cuando aparezcan nuevas necesidades reales, pero debe conservar siempre los límites entre módulos.

## Principios obligatorios de arquitectura

- `app/` solo enruta y compone.
- `modules/` contiene la lógica y UI específica de cada dominio/funcionalidad.
- `shared/` no conoce reglas de Comercial, Finanzas ni ningún otro módulo de negocio.
- Cada módulo expone únicamente una API pública mediante `index.ts`.
- Está prohibido importar archivos internos de otro módulo directamente.
- Las dependencias entre módulos deben mantenerse controladas y unidireccionales.
- Evitar dependencias circulares.
- Los modelos de negocio permanecen cerca de su módulo propietario.
- Los servicios no deben mezclarse con componentes visuales.
- Los adapters traducen contratos externos hacia modelos internos/UI cuando sea necesario.
- No crear carpetas vacías por anticipado: solo se crean las divisiones que realmente necesite cada módulo.
- No concentrar toda la aplicación en `components`, `services`, `utils` o `types` globales.
- No usar `shared` como depósito de código que simplemente “se usa en dos sitios”; debe ser realmente agnóstico al negocio.
- Si dos módulos necesitan colaborar, deben hacerlo mediante sus APIs públicas, no accediendo a su implementación interna.

## Regla de dependencia

La dirección conceptual debe ser:

```text
shared
   ↓
modules
   ↓
app
```

`shared` no depende de módulos de negocio.

Un módulo no debe acceder arbitrariamente a la implementación privada de otro módulo.

Ejemplo incorrecto:

```ts
import { customersMock } from "@/modules/comercial/clientes/data/internal";
```

Ejemplo correcto:

```ts
import { getCustomerSummary } from "@/modules/comercial/clientes";
```

La API pública del módulo debe ser el punto de entrada autorizado.

## API pública por módulo

Cada módulo debe exponer explícitamente lo que otros pueden consumir mediante su `index.ts`.

Ejemplo:

```text
modules/
└── comercial/
    └── clientes/
        ├── adapters/
        ├── components/
        ├── hooks/
        ├── models/
        ├── services/
        └── index.ts
```

Todo lo que no se exporte desde `index.ts` se considera interno al módulo.

Esta regla debe respetarse incluso si técnicamente TypeScript permite importar directamente el archivo.

# 7. Responsabilidad de cada capa

## `src/app/`

Contiene:

- rutas
- layouts
- composición

No debe acumular implementación compleja de funcionalidades.

Las páginas deben orquestar módulos, no convertirse en componentes gigantes.

---

## `src/modules/`

Contiene las funcionalidades del sistema.

Cada funcionalidad es responsable de su propia implementación.

Ejemplos:

### Comercial / Clientes

Responsable de:

- cartera
- asignaciones
- ficha del cliente

### Comercial / Visitas y jornadas

Responsable de:

- agenda
- jornadas
- visitas
- visita activa
- evidencias
- registros

### Comercial / Ventas

Responsable de:

- cotizaciones
- pedidos
- selección de productos

### Comercial / Solicitudes

Responsable de:

- visitas extraordinarias
- Material POP

### Comercial / Gastos

Responsable de:

- registro de gastos
- detalle de gastos
- consulta de gastos

### Finanzas / Conciliación

Responsable de:

- pagos reportados
- conciliación
- coincidencias
- excepciones

### Reportes

Responsable de:

- presentar indicadores
- consolidar información pública de otros módulos

### Configuración

Preparar el espacio para:

- usuarios
- roles
- permisos
- configuraciones futuras

En esta etapa puede existir solo la representación visual necesaria.

---

# 8. Regla fundamental entre módulos

Los módulos pueden necesitar comunicarse.

La regla NO es:

> ningún módulo puede llamar a otro.

La regla correcta es:

> Un módulo solo puede consumir aquello que otro módulo exponga expresamente como público.

Está prohibido acceder directamente desde otro módulo a:

- componentes internos
- hooks internos
- estado interno
- archivos de datos internos
- implementaciones privadas
- helpers privados
- carpetas internas

Cada módulo debe tener entradas públicas claras.

Ejemplo conceptual:

```text
modules/
└── comercial/
    └── clientes/
        ├── public.ts
        ├── components/
        ├── screens/
        ├── model/
        └── data/
```

Otro módulo podría consumir algo exportado en `public.ts`.

No debería importar arbitrariamente:

```text
clientes/components/internal/...
clientes/data/internal/...
```

---

# 9. Dependencias prohibidas

Evitar:

- dependencias circulares
- Comercial ↔ Finanzas importándose mutuamente de forma directa
- `shared` dependiendo de módulos de negocio
- componentes genéricos con conocimiento de reglas de negocio
- archivos enormes con múltiples responsabilidades
- componentes universales llenos de `if` según pantalla
- duplicación innecesaria de componentes
- datos mock repartidos directamente por JSX
- tipos globales para entidades que pertenecen claramente a un módulo

---

# 10. Shared

## `shared/ui`

Solo componentes visuales realmente genéricos:

- Button
- Input
- Select
- Checkbox
- Badge
- Modal base
- etc.

No deben conocer conceptos como:

- pedido
- cliente
- cotización
- pago
- visita

---

## `shared/patterns`

Patrones reutilizables de mayor nivel:

- DataTable
- FilterBar
- PageHeader
- SidePanel
- FormSection
- EmptyState

Deben seguir siendo agnósticos respecto al negocio.

---

## `shared/layout`

Elementos estructurales:

- sidebar
- header
- shell principal
- navegación visual

---

# 11. Tipos

Los tipos de negocio deben vivir cerca del módulo que los posee.

Evitar un único archivo gigante como:

```text
src/types/index.ts
```

con todas las entidades del sistema.

Ejemplo:

```text
modules/comercial/ventas/model/order.ts
modules/comercial/clientes/model/customer.ts
```

Los tipos verdaderamente globales pueden ubicarse en una capa compartida solo si realmente pertenecen a toda la aplicación.

---

# 12. Datos simulados

Los mocks deben ser coherentes entre sí.

No crear datos independientes para cada pantalla.

Ejemplo:

Si existe:

```text
Cliente:
Ferretería San Martín SAC

Cotización:
COT-2026-0142

Pedido:
PED-2026-0087
```

y esos elementos están relacionados, deben mantenerse relacionados cuando aparezcan en otras pantallas.

El mismo pedido que aparece en Comercial debe ser el mismo que pueda aparecer posteriormente en Finanzas.

Crear un conjunto central y consistente de datos de demostración.

Las pantallas no deben contener arrays mock arbitrarios directamente dentro de sus componentes.

Los datos deben consumirse mediante funciones o adaptadores definidos.

---

# 13. Preparación para backend futuro

Aunque hoy no exista backend, evitar acoplar la UI directamente a la forma concreta de almacenamiento de los mocks.

La UI debe consumir contratos claros.

Ejemplo conceptual:

```ts
getOrders()
getCustomerById()
getQuotes()
getPayments()
```

Hoy esas funciones pueden utilizar mocks.

En el futuro podrán conectarse a APIs.

Esto no significa que el backend real vaya a poder sustituirse sin cambios; simplemente evita mezclar innecesariamente presentación y acceso a datos.

---

# 14. Roles y permisos

Todavía no existe seguridad real.

Sin embargo, la arquitectura no debe impedir incorporar posteriormente:

- usuarios
- roles
- permisos
- alcance por usuario
- funcionalidades contratadas por empresa

Separar conceptualmente:

1. Plan o capacidades de la empresa.
2. Permisos del usuario.
3. Alcance de datos del usuario.

No construir ahora un sistema completo de autorización.

Solo dejar la estructura preparada y simular visualmente lo necesario para el mockup.

---

# 15. Referencias visuales

Las imágenes se encontrarán en una carpeta, por ejemplo:

```text
mockups/
```

Las imágenes estarán identificadas mediante códigos.

Mapa principal de Comercial:

```text
C01-C04
Agenda
Jornadas
Registros
Cotizaciones

C05-C08
Pedidos
Visitas extraordinarias
Material POP
Gastos

C09-C12
Ficha del cliente
Nueva cotización
Nuevo pedido
Detalle de cotización

C13-C16
Detalle del pedido
Jornada
Visita activa con cierre
Reportar pago

C17-C20
Paneles de productos
Programación
Evidencia
Solicitud de visita

C21-C24
Paneles de POP
Aprobación
Registro
Detalle de gasto
```

Cartera y Asignaciones pueden tener referencias visuales adicionales.

---

# 16. No inventar funcionalidades

Está prohibido agregar por iniciativa propia:

- módulos
- páginas
- pestañas
- botones funcionales
- dashboards
- filtros
- widgets
- flujos
- configuraciones
- campos
- acciones

que no aparezcan en las referencias o documentación.

Si un elemento es necesario exclusivamente por razones técnicas internas, puede implementarse internamente sin alterar la interfaz.

---

# 17. Reutilización visual

Cuando un componente visual ya haya sido definido y validado, debe reutilizarse.

Ejemplos:

- sidebar
- header
- tabla
- filtros
- tabs
- botón
- input
- select
- badge
- card
- panel lateral
- modal

No crear múltiples versiones casi idénticas salvo que las referencias demuestren que realmente existen variantes.

---

# 18. Tokens visuales

Centralizar:

- colores
- tipografía
- tamaños
- border radius
- sombras
- spacing
- breakpoints
- alturas comunes
- dimensiones comunes

No repartir valores arbitrarios por cientos de componentes si pertenecen al sistema visual general.

Cuando sea necesario un ajuste específico de una pantalla, mantenerlo cerca de esa funcionalidad.

---

# 19. Flujo obligatorio de implementación

NO implementar todas las pantallas masivamente desde el primer momento.

Seguir este orden:

## Etapa 1 — inspección

1. Leer este documento.
2. Inspeccionar todas las imágenes.
3. Identificar componentes repetidos.
4. Identificar patrones visuales.
5. Detectar contradicciones.
6. Definir estructura final del frontend.

No modificar el diseño.

---

## Etapa 2 — shell principal

Implementar primero:

- layout
- sidebar
- header
- contenedor de contenido
- navegación base
- tokens visuales

Validar que coincidan con las referencias.

---

## Etapa 3 — componentes compartidos

Implementar los componentes comunes necesarios:

- botones
- inputs
- tabs
- badges
- tablas
- filtros
- paneles
- formularios base

No crear abstracciones prematuras.

---

## Etapa 4 — pantallas patrón

Construir primero 2 o 3 pantallas representativas.

Preferentemente incluir:

1. una pantalla operativa/listado
2. una pantalla de tabla
3. una pantalla/formulario o panel complejo

Estas pantallas deben alcanzar alta fidelidad visual antes de continuar.

---

## Etapa 5 — resto de pantallas

Después de validar el sistema visual y los componentes base, implementar el resto de pantallas reutilizando el sistema ya definido.

---

# 20. Verificación visual obligatoria

Antes de considerar una pantalla terminada:

1. abrir la implementación
2. compararla con la imagen de referencia
3. revisar diferencias
4. corregirlas

Revisar específicamente:

- ancho de sidebar
- posición del contenido
- tamaño del header
- márgenes
- paddings
- gaps
- dimensiones
- alineaciones
- tipografía
- pesos tipográficos
- tamaño de iconos
- bordes
- radios
- colores
- sombras
- densidad de tablas
- altura de filas
- ancho de columnas
- posición de botones
- paneles laterales
- formularios

No considerar terminada una pantalla solo porque “funciona”.

---

# 21. Calidad técnica

Antes de finalizar una entrega:

- TypeScript sin errores
- build correcto
- lint correcto
- sin imports rotos
- sin dependencias circulares
- navegación funcional
- componentes reutilizados correctamente
- consola sin errores evitables

No usar `any` indiscriminadamente para hacer desaparecer errores.

---

# 22. Autonomía de ejecución

Se espera autonomía técnica.

No detener la implementación por decisiones menores que puedan resolverse profesionalmente a partir de:

1. esta documentación
2. las imágenes
3. las convenciones ya existentes en el proyecto

Cuando haya varias soluciones técnicas equivalentes, elegir la opción más simple, mantenible y coherente con la arquitectura.

Sin embargo:

**la autonomía técnica no autoriza reinterpretar el diseño visual.**

---

# 23. Cambios en arquitectura

Si durante la implementación aparece una necesidad real de modificar la estructura propuesta:

- puede hacerse
- debe conservarse el aislamiento entre módulos
- debe evitarse acoplamiento innecesario
- debe mantenerse una API pública clara entre módulos
- debe justificarse técnicamente en la documentación del proyecto

No modificar la arquitectura solo por comodidad inmediata.

---

# 24. Regla de crecimiento

El proyecto debe poder aumentar en funcionalidades sin obligar a reorganizar constantemente todo el código.

Agregar una nueva funcionalidad debería implicar principalmente:

- crear/extender el módulo correspondiente
- usar contratos públicos existentes
- reutilizar shared
- añadir rutas/composición

No debería exigir tocar decenas de archivos no relacionados.

---

# 25. Resultado esperado

Al finalizar esta etapa se espera:

- una aplicación frontend navegable
- altamente fiel a los mockups
- datos ficticios coherentes
- interacciones de demostración
- código modular
- módulos desacoplados
- límites claros
- componentes reutilizables
- sistema visual centralizado
- proyecto compilando correctamente
- estructura preparada para seguir creciendo

---

# 26. Instrucción inicial para el agente

Antes de comenzar a programar:

1. Lee este archivo completo.
2. Revisa todas las imágenes de `mockups/`.
3. Revisa los archivos adicionales de documentación si existen.
4. Identifica el sistema visual compartido.
5. Identifica los módulos y sus límites.
6. Comprueba las skills y herramientas disponibles.
7. Define la estructura final del proyecto manteniendo las reglas de este documento.
8. Implementa primero el shell principal y las pantallas patrón.
9. Verifica visualmente contra las referencias.
10. Solo después continúa con todas las demás pantallas.

## Regla final

**Arquitectura: disciplinada, modular y escalable.**

**Diseño: reproducción fiel de las imágenes, no reinterpretación.**
