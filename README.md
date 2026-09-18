# Ship24Go

Plataforma de logística internacional para cotización, emisión de envíos, Points afiliados, terminales de mostrador, manifiestos, Hubs, última milla y tracking público.

Producción: [https://ship24go.com](https://ship24go.com)

Repositorio: [github.com/CodeMorf/ship24go](https://github.com/CodeMorf/ship24go)

Rama de auditoría: [Morf/point-full-cleanup](https://github.com/CodeMorf/ship24go/tree/Morf/point-full-cleanup)

## Entradas visuales de producción

Todas las URLs usan el mismo dominio: `https://ship24go.com`.

### Cliente final

| Función | URL visual |
|---|---|
| Página pública | [https://ship24go.com/](https://ship24go.com/) |
| Cotizador público | [https://ship24go.com/cotizador](https://ship24go.com/cotizador) |
| Tracking público | [https://ship24go.com/tracking](https://ship24go.com/tracking) |
| Tracking con código | `https://ship24go.com/tracking?code=CODIGO_DEL_CLIENTE` |
| Localizador de Points | [https://ship24go.com/points](https://ship24go.com/points) |
| Login del cliente | [https://ship24go.com/auth/login](https://ship24go.com/auth/login) |
| Registro del cliente | [https://ship24go.com/auth/register](https://ship24go.com/auth/register) |
| Panel del cliente | [https://ship24go.com/panel](https://ship24go.com/panel) |
| Cotización dentro del panel | [https://ship24go.com/panel/quote](https://ship24go.com/panel/quote) |
| Envíos del cliente | [https://ship24go.com/panel/shipments](https://ship24go.com/panel/shipments) |
| Tiendas e integraciones del cliente | [https://ship24go.com/panel/stores](https://ship24go.com/panel/stores) |
| Wallet y pagos del cliente | [https://ship24go.com/panel/settings/wallet](https://ship24go.com/panel/settings/wallet) |
| Tickets del cliente | [https://ship24go.com/panel/tickets](https://ship24go.com/panel/tickets) |
| Documentación API del cliente | [https://ship24go.com/panel/api-docs](https://ship24go.com/panel/api-docs) |

### Comercios afiliados / Ship24Go Points

La URL que debe usar cada comercio es la misma. La sucursal queda determinada por la terminal que el dueño vincula con correo, autorización y ubicación GPS.

| Función | URL visual |
|---|---|
| Registrar un comercio Point | [https://ship24go.com/point/register](https://ship24go.com/point/register) |
| Acceso de terminal y empleados | [https://ship24go.com/point/login](https://ship24go.com/point/login) |
| Alias de acceso de empleados | [https://ship24go.com/branch/login](https://ship24go.com/branch/login) |
| Panel del dueño del comercio | [https://ship24go.com/point](https://ship24go.com/point) |
| Localizador de comercios | [https://ship24go.com/point/points](https://ship24go.com/point/points) |
| Alias del localizador | [https://ship24go.com/point/locator](https://ship24go.com/point/locator) |
| Roadmap operativo del Point | [https://ship24go.com/point/roadmap](https://ship24go.com/point/roadmap) |

#### Flujo visual del comercio

1. El dueño abre `/point/login`.
2. Vincula la PC del mostrador desde la pestaña de terminal.
3. La terminal recibe un token de dispositivo y queda ligada a la sucursal.
4. El empleado selecciona su nombre y coloca su PIN de 4 dígitos.
5. El backend verifica el Point, el empleado, el PIN y el dispositivo autorizado.
6. El empleado entra al POS en `/point?tab=pos`.
7. Antes de registrar envíos debe existir un turno de caja abierto.
8. Cada operación queda asociada a Point, empleado, turno, dispositivo, método de pago y envío.

No existe una URL pública inventada por comercio como `/comercio/mario-rosi`. La seguridad no depende de ocultar una URL: depende de la vinculación de la terminal, el token hasheado, el estado aprobado del Point, el empleado activo, los permisos y el PIN.

### Operación interna

| Función | URL visual |
|---|---|
| Operación de Hub | [https://ship24go.com/hubs](https://ship24go.com/hubs) |
| Alias de Hub | [https://ship24go.com/hub](https://ship24go.com/hub) |
| Operación de chofer / última milla | [https://ship24go.com/driver](https://ship24go.com/driver) |
| Super Admin | [https://ship24go.com/admin](https://ship24go.com/admin) |
| Administración de clientes | [https://ship24go.com/admin/clients](https://ship24go.com/admin/clients) |
| Administración de envíos | [https://ship24go.com/admin/shipments](https://ship24go.com/admin/shipments) |
| Administración de Points | [https://ship24go.com/admin/points](https://ship24go.com/admin/points) |
| Administración de tarifas | [https://ship24go.com/admin/tariffs](https://ship24go.com/admin/tariffs) |
| Reportes | [https://ship24go.com/admin/reports](https://ship24go.com/admin/reports) |
| Auditoría administrativa | [https://ship24go.com/admin/settings/audit](https://ship24go.com/admin/settings/audit) |

Las rutas internas requieren una sesión autorizada. El README no contiene contraseñas, PIN, tokens, claves API ni datos de clientes.

### Documentación API

| Recurso | URL |
|---|---|
| Swagger UI | [https://ship24go.com/docs](https://ship24go.com/docs) |
| OpenAPI JSON | [https://ship24go.com/openapi.json](https://ship24go.com/openapi.json) |
| Swagger embebido | [https://ship24go.com/docs?embed=1](https://ship24go.com/docs?embed=1) |
| Documentación API en el panel | [https://ship24go.com/panel/api-docs](https://ship24go.com/panel/api-docs) |

## Flujo de tracking y manifiestos

El tracking público separa tres niveles:

1. **Tracking del cliente:** no cambia durante el recorrido.
2. **Tracking del manifiesto:** identifica el lote operativo actual.
3. **Master tracking:** identifica el despacho consolidado o tramo internacional.

Ejemplo operativo:

```text
Comercio USA
  └── Tracking del cliente S24...
       └── Manifiesto USA → Miami
            └── Master del tramo USA → Miami
                 └── Manifiesto Miami → Santo Domingo
                      └── Master del tramo Miami → Santo Domingo
                           └── Hub de destino → última milla → entrega
```

Cuando el Hub crea el siguiente tramo, el tracking del cliente se conserva. El envío solamente cambia de manifiesto y master operativo. El historial de tramos queda en `shipment_manifest_links` y el manifiesto anterior se marca con `detached_at`.

Al abrir una URL de manifiesto en `/tracking`, la pantalla pública muestra los paquetes que pertenecen a ese lote, cada uno con su tracking de cliente y enlace individual.

## Cambios implementados en la auditoría Point / Hub

### Seguridad de terminales y empleados

- El login de empleado exige `deviceToken`.
- Los tokens se almacenan mediante SHA-256 en `point_devices.device_token_hash`.
- Los tokens históricos en claro fueron migrados y eliminados de `point_devices.device_token`.
- Las sesiones JWT de empleado incluyen la terminal autorizada.
- Cada request autenticado de empleado vuelve a validar que la terminal esté activa.
- Revocar una terminal invalida el acceso operativo asociado.
- El Point debe estar en estado `approved`.
- El PIN debe tener exactamente cuatro dígitos desde la interfaz.
- Se aplica bloqueo temporal después de intentos fallidos repetidos.
- Los errores de dispositivo no imprimen tokens ni SQL sensible en logs.

### Caja y trazabilidad financiera

La migración `V31__point_security_cash_audit.sql` agrega:

- `shift_id`;
- `employee_id`;
- `device_id`;
- `payment_method`;
- índices de auditoría para caja y operaciones;
- movimientos `cash_opening` y `cash_closing`.

Una venta de mostrador de empleado exige un turno abierto y registra el contexto completo de auditoría. Si una creación falla a mitad del proceso, se limpian los registros parciales y se recalcula el total del manifiesto.

### Permisos de Hubs y manifiestos

- El detalle de manifiesto exige `manifests.view`.
- La desconsolidación verifica que el manifiesto esté asignado al Hub del operador.
- Los Hubs conservan el control de sus tramos y paquetes.
- La última milla trabaja sobre rutas y paradas autorizadas.

### Visual pública

- Se añadió la vista pública de paquetes pertenecientes a un manifiesto.
- Se muestran tracking del cliente, manifiesto, master, estado e historial de tramos.
- El cliente puede abrir el tracking individual desde el lote.
- La pantalla pública conserva los datos operativos sin exponer información privada innecesaria.

## Arquitectura principal

```text
src/
  App.tsx                    Router principal
  pages/Public.tsx           Landing, tracking y rutas públicas
  pages/Auth.tsx             Login y registro de clientes
  pages/CustomerPanel.tsx    Panel autenticado del cliente
  pages/Point.tsx             Router del ecosistema Point
  pages/PointLogin.tsx       Vinculación de terminal y login de empleado
  pages/PointPanel.tsx       POS, caja, manifiestos y configuración Point
  pages/HubPanel.tsx         Operación de Hubs y manifiestos
  pages/DriverPanel.tsx      Última milla y prueba de entrega
  pages/AdminPanel.tsx       Super Admin

server.ts                    API Express, JWT y reglas de autorización
server/db/repos.ts            Repositorios MySQL y migraciones de arranque
migrations/                   Esquema incremental de producción
tests/                        Pruebas automatizadas disponibles
deploy.sh                    Deploy GitHub → producción
```

## Configuración local

Requisitos:

- Node.js compatible con el proyecto.
- MySQL con una base de datos Ship24Go.
- Variables de entorno en `.env`.
- `JWT_SECRET` con al menos 32 caracteres.

Instalación:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Lint TypeScript:

```bash
npm run lint
```

Pruebas Point:

```bash
npm run test:point
```

## Estado de verificación

La revisión del commit de auditoría confirmó:

- build frontend y backend correcto;
- TypeScript sin errores;
- pruebas Point existentes correctas;
- migración V31 aplicada en producción;
- cero tokens antiguos en claro en `point_devices`;
- PM2 `ship24go` online;
- health interno HTTP 200;
- rutas públicas `/`, `/point`, `/point/login` y `/tracking` con HTTP 200;
- `/api/point/devices` sin sesión con HTTP 401;
- login de empleado sin terminal con HTTP 400;
- tracking inexistente con HTTP 404.

Commit auditado: `bbd88fc` — `fix: harden point terminal and cash audit`.

## Despliegue

El despliegue de producción usa `/www/wwwroot/ship24go.com` y `deploy.sh`:

1. Actualiza `origin/main`.
2. Ejecuta el build frontend/backend.
3. Recarga PM2 con `ship24go --update-env`.
4. Verifica `/api/public/brand`.

Antes del último despliegue se creó un respaldo remoto en `.deploy-backups/`. Los secretos de producción no forman parte del repositorio.

## Auditoría recomendada

Para auditar el código:

1. Revisar la rama [Morf/point-full-cleanup](https://github.com/CodeMorf/ship24go/tree/Morf/point-full-cleanup).
2. Comparar el commit `bbd88fc` con el commit anterior `cd67a10`.
3. Revisar primero `server.ts`, `server/db/repos.ts` y `migrations/V31__point_security_cash_audit.sql`.
4. Validar el flujo visual en `/point/login`, `/point`, `/tracking` y `/hubs` con una cuenta de prueba autorizada.
5. Ejecutar `npm run build`, `npm run lint` y `npm run test:point`.

La prueba autenticada de una venta real debe realizarse con un Point y un empleado de auditoría autorizados. Este README no incluye credenciales ni datos de acceso.

