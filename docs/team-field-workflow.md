# Plan and monitor field work

Users with `manage_field_operations` can plan visits and inspect their company's Commercial and Merchandiser activity from **Visitas y jornadas**. Other users keep their personal view.

## Web to mobile

1. Assign existing field users to customers in **Clientes → Asignaciones**. This requires the separate `manage_customers` permission.
2. Open **Visitas y jornadas → Equipo**, choose role and responsible user, then **Agendar visita**.
3. Select an active responsible user and one of that user's assigned customers, enter the company-local date and time, and save. Scheduling does not start the worker's day.
4. The worker signs into mobile, starts their workday, checks into the visit and records its outcome. An attended Merchandiser visit requires the exhibition audit and photograph; Commercial closure remains unchanged.
5. The manager consults **Agenda**, **Jornadas** and **Registros**. Record detail displays the saved audit and authenticated photograph. The page refreshes every ten seconds while visible; **Actualizar** performs an explicit refresh.

## Access and data

The web uses dedicated `/field-operations/*` routes for team operations and preserves `/me/*` for personal activity. The backend enforces company boundaries and permissions. Scheduling lists only the selected user's assigned customers and sends their membership ID, never an email as identifier. Company and user creation remain outside Clients.

Filters use the real membership and role. Workday counts include each user's own pending visits, without adding another team member's visits. Closed and unavailable Merchandiser visits display their recorded result without invented audits. No financial or sales values are derived from exhibition evidence.
