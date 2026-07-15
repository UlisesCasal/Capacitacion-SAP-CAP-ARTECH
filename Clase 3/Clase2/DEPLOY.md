# Deploy a Cloud Foundry (BTP Trial)

Guía paso a paso para deployar esta app CAP (backend + UI Fiori Elements) a Cloud
Foundry, usando Supabase como base de datos Postgres externa.

## Prerrequisitos

- `cf` CLI instalado y logueado:
  ```powershell
  cf login -a https://api.cf.us10-003.hana.ondemand.com
  ```
- Plugin `multiapps` de `cf` (necesario para `cf deploy`, no viene con el CLI base):
  ```powershell
  cf install-plugin multiapps -r CF-Community
  ```
- Un **dev space** creado en el subaccount de BTP trial (si todavía no existe
  ninguno). Se puede crear desde el cockpit de BTP o por CLI:
  ```powershell
  cf create-space dev
  cf target -s dev
  ```
- `mbt` (Multi-Target App Build Tool) instalado:
  ```powershell
  npm install -g mbt
  ```
- Una base Postgres externa ya creada (Supabase) con host, puerto, usuario,
  password y database a mano.

---

## Parte 0 — Scaffolding inicial del proyecto CAP

Si el proyecto todavía no tiene soporte de Postgres ni el `mta.yaml` generado,
hay que agregarlos antes de tocar nada más:

```bash
cds add postgres
cds add mta
```

- `cds add postgres` agrega `@cap-js/postgres` a las dependencias y genera la
  config base de `cds.requires.db` en `package.json` (que después se ajusta a
  mano para apuntar a un servicio externo, ver paso 1).
- `cds add mta` genera el `mta.yaml` inicial con los módulos `srv` y
  `postgres-deployer` ya cableados. A partir de ahí se edita para usar
  `existing-service` (paso 3) en vez de un servicio managed.

---

## Parte 1 — Backend (CAP srv + conexión a Supabase)

### 1. Decirle a CAP que use Postgres externo, no la base managed de CF

En `package.json` (raíz):

```json
"cds": {
  "requires": {
    "db": {
      "kind": "postgres",
      "vcap": { "label": "user-provided" },
      "pool": { "acquireTimeoutMillis": 15000 }
    },
    "auth": {
      "kind": "dummy"
    }
  }
}
```

- `vcap.label: "user-provided"` — la base no es un servicio *managed* de CF
  (`postgresql-db`), es un **user-provided service** apuntando a Supabase. Sin
  esto, `@cap-js/postgres` busca el label equivocado y no encuentra la base.
- `pool.acquireTimeoutMillis` — el default (1s) es muy corto para una conexión
  TLS a un host externo; se sube a 15s.
- `auth.kind: "dummy"` — CAP activa auth `jwt` (que requiere XSUAA)
  automáticamente en producción. Como esta app no tiene anotaciones
  `@requires`/`@restrict` ni servicio XSUAA, se fuerza `dummy` para no
  necesitar esa infraestructura.

### 2. Dependencias de runtime: nunca declaradas en ambos lados a la vez

Si código en `srv/` usa algo en runtime (ej. `@faker-js/faker` en
`srv/utils/util.js`), tiene que estar **solo** en `dependencies`.

**Ojo con el error más sutil**: si el mismo paquete queda declarado a la vez
en `dependencies` Y en `devDependencies` (típico cuando se instaló primero
como dev tool y después se promovió a runtime, sin borrar la entrada vieja),
npm resuelve el conflicto marcándolo `"dev": true` en `package-lock.json`.
El builder `npm-ci` del `mta.yaml` (`build-parameters: builder: npm-ci`)
instala en modo producción (`npm ci --omit=dev`), así que respeta ese flag y
**no instala el paquete — sin tirar ningún error visible en el build**. La
carpeta del paquete queda vacía dentro de `gen/srv/node_modules` (y dentro
del `.mtar` final), y recién explota en runtime en Cloud Foundry con
`Cannot find module`.

```powershell
npm install
```
(regenera `package-lock.json` después de sacar la dependencia duplicada de
`devDependencies`)

**Verificación antes de deployar** — confirmar que el paquete quedó
efectivamente instalado (no solo la carpeta vacía) en el módulo que se va a
empaquetar:

```powershell
ls gen/srv/node_modules/@faker-js/faker
```
Si el comando no devuelve nada (carpeta vacía o inexistente), el `.mtar` va a
fallar en runtime aunque el build no haya mostrado ningún error.

### 3. Configurar `mta.yaml` para usar un servicio externo, no uno managed

```yaml
resources:
  - name: Clase2-postgres
    type: org.cloudfoundry.existing-service
    parameters:
      service-name: Clase2-postgres
```

`existing-service` (en vez de `managed-service`) le dice al MTA "no crees
nada, solo bindeá el servicio que ya existe con ese nombre".

### 4. Crear el user-provided service en Cloud Foundry (una sola vez, fuera del repo)

```powershell
cf create-user-provided-service Clase2-postgres -p credenciales.json
```

Con `credenciales.json` (no versionar este archivo):

```json
{
  "hostname": "<host-de-tu-pooler-supabase>",
  "port": 5432,
  "username": "<usuario>",
  "password": "<password>",
  "database": "postgres",
  "ssl": { "rejectUnauthorized": false }
}
```

**Detalle clave**: `"ssl": true` falla con
`self-signed certificate in certificate chain` porque el certificado del
pooler de Supabase no está en la cadena de confianza por defecto de Node.
Tiene que ser `"ssl": { "rejectUnauthorized": false }` (objeto, no booleano).
Con `ssl: true` el pool de conexiones tira un `TimeoutError` genérico que no
muestra la causa real — para diagnosticarlo hace falta probar la conexión
directo con un script Node mínimo (`pg`'s `Client`) o `psql`.

Si las credenciales cambian más adelante:
```powershell
cf update-user-provided-service Clase2-postgres -p credenciales.json
cf restage Clase2-srv
```
(el `restage`/`restart` es obligatorio — los apps ya corriendo no recargan
`VCAP_SERVICES` solos)

### 5. Build y deploy

```powershell
mbt build
cf deploy .\mta_archives\Clase2_1.0.0.mtar -f
```

---

## Parte 2 — Frontend (UI5/Fiori Elements vía approuter standalone)

### 6. Scaffoldear el approuter

```bash
npx cds add approuter
```

Genera `app/router/` (`package.json`, `xs-app.json`, `default-env.json`) y
agrega el módulo `Clase2` de tipo `approuter.nodejs` al `mta.yaml`, ya
cableado para consumir `Clase2-srv` como destino `srv-api`.

### 7. Configurar rutas del approuter (`app/router/xs-app.json`)

```json
{
  "welcomeFile": "/index.html",
  "authenticationMethod": "none",
  "routes": [
    {
      "source": "^/odata/(.*)$",
      "target": "/odata/$1",
      "destination": "srv-api",
      "csrfProtection": true
    },
    {
      "source": "^/\\$metadata$",
      "target": "/$metadata",
      "destination": "srv-api"
    },
    {
      "source": "^(.*)$",
      "target": "$1",
      "localDir": "resources/libreria"
    }
  ]
}
```

- Rutas de `/odata/**` y `/$metadata` van al backend.
- Todo lo demás se sirve como archivos estáticos desde `resources/libreria`.
- `authenticationMethod: "none"` porque el backend usa auth `dummy` — no hay
  XSUAA en el medio.

### 8. Empaquetar la UI5 app dentro del approuter (`mta.yaml`)

En el módulo `Clase2` (el approuter):

```yaml
    build-parameters:
      builder: custom
      commands:
        - npm install --production
        - node -e "require('fs').cpSync('../libreria/webapp','resources/libreria',{recursive:true})"
```

Copia `app/libreria/webapp` (la app Fiori Elements) a `resources/libreria`
dentro del approuter al momento del build, para servirla como estático **sin
necesitar HTML5 Application Repository** (esos servicios suelen tener
entitlements limitados en cuentas trial).

### 9. Sincronizar el lockfile raíz

`app/router` es un nuevo workspace (matchea `"workspaces": ["app/*"]` del
`package.json` raíz), trae una dependencia nueva (`@sap/approuter`) que el
lockfile no conoce todavía:

```powershell
npm install
```

### 10. Rebuild y redeploy

```powershell
mbt build
cf deploy .\mta_archives\Clase2_1.0.0.mtar -f
```

---

## Verificación final

```powershell
cf apps
```

Deberían aparecer 3 apps:

| App | Rol | Estado esperado |
|---|---|---|
| `Clase2` | UI / approuter | `started`, 1/1 |
| `Clase2-srv` | Backend CAP (OData) | `started`, 1/1 |
| `Clase2-postgres-deployer` | Seed de datos (task) | `stopped` (normal, solo corre la tarea puntual) |

- **UI**: `https://<org>-<space>-clase2.cfapps.<landscape>.hana.ondemand.com`
- **API directa**: `https://<org>-<space>-clase2-srv.cfapps.<landscape>.hana.ondemand.com/odata/v4/libreria/Libros`

## Troubleshooting rápido

| Síntoma | Causa probable | Dónde mirar |
|---|---|---|
| `Service plan development not found` | `mta.yaml` apunta a un servicio managed que no existe/no está entitled | Cambiar a `existing-service` + user-provided service |
| `Cannot find module 'X'` en runtime | Dependencia solo en `devDependencies`, o duplicada en `dependencies` **y** `devDependencies` (npm la marca `"dev": true` en el lockfile y `npm-ci --omit=dev` la salta en silencio) | `package.json` → dejarla solo en `dependencies`, `npm install`, verificar con `ls gen/srv/node_modules/<paquete>` antes de rebuildear |
| `Cannot find module '@sap/xssec'` | CAP activa auth `jwt` en producción sin XSUAA bindeado | `cds.requires.auth.kind: "dummy"` en `package.json` |
| `TimeoutError: ResourceRequest timed out` conectando a la base | Casi nunca es red — probar TCP (`cf ssh` + `/dev/tcp`) y luego el handshake TLS real con un script Node mínimo | Revisar `ssl` en las credenciales del user-provided service |
| Cambios en credenciales del servicio no toman efecto | Apps ya corriendo no recargan `VCAP_SERVICES` solas | `cf restage`/`cf restart` del app bindeado |
| `cf logs --recent` no muestra nada de una task fallida | Buffer de logs de tasks efímeras se pierde rápido | `cf dmol -i <operation-id>` para bajar el log completo de la operación MTA |
