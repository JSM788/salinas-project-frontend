# Start with companies and users

The global owner creates companies and their user accounts. Company managers plan and monitor their own team. Customers remain separate records in the field-operation modules.

## Owner path

1. Sign in with an account granted `manage_platform` by the backend operator.
2. Open **Empresas**, select **Nueva empresa**, and enter the name and access subdomain. The backend generates the identifier; the time zone is Lima.
3. Open the users icon for that company, or select the company from **Usuarios**. The icon tooltip reads **Ver usuarios**.
4. Select **Nuevo usuario**, explicitly select the company inside the form, enter the person's name, email and initial password, and choose **Comercial**, **Mercaderista** or **Gerencia**. The page company selector only filters the list.
5. Activate or deactivate non-owner memberships from the same table. Deactivation preserves historical records.

Company creation saves application hostname routing. It does not register DNS or deploy another application. Existing configured bootstrap domains remain reserved.
Company and user lists support search and status filters; the user list also supports role filtering. Query invalidation and cache updates replace manual refresh buttons.

## Company path

Gerencia can open **Equipo** to inspect its own company's users and roles. It cannot create users, change their activation, or choose another company. Its field planning and consultation use the existing **Clientes** and **Visitas y jornadas** modules.

Commercial and Merchandiser users retain their existing personal field routes. Gerencia is a web-only role. The global owner lands on **Empresas** after sign-in; other roles retain the field landing page.

## Contracts and recovery behavior

- Owner reads and mutations use only the `/platform/companies` allowlist and company/member UUID routes. Team uses `/team/members`.
- Owner and Gerencia roles are checked by the backend; hiding a navigation item is not authorization.
- Create and status requests use idempotency keys. Unconfirmed forms keep their values and key in memory for an exact retry; passwords are never stored in browser storage or returned by the API.
- Forms close after a confirmed mutation. Refresh failures are displayed separately from the saved mutation.
- Account creation rejects owner-flag injection. Existing identities are not silently reused or given a replacement password.
- Billing quotas and email password recovery are not represented as operational features.

## Verification

`tests/platform-start.test.ts` checks BFF forwarding, strict input boundaries, secret-free response projection, manager/owner session parsing, and permission-aware landing/navigation. Existing API tests must continue to pass. Production compilation and live UI verification belong to the integrated delivery.
