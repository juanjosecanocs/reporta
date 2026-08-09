# REPORTA

App de incidencias ciudadanas para Almería.

- **Fase 1** (`/`): creación y seguimiento de incidencias, 100% anónima, sin login.
- **Fase 1.5** (`/admin`): panel de administración con Supabase Auth — gestión de
  incidencias (filtros, cambio de estado, borrado/restauración) y gestión completa
  de tipos y subtipos (crear, editar, reordenar, activar/desactivar, eliminar).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (v3)
- Supabase (Postgres + Auth + Storage)
- MapLibre GL JS + [OpenFreeMap](https://openfreemap.org) (tiles gratuitos, sin API key)
- Zustand
- Netlify (deploy automático conectado al repo de GitHub — ver [Despliegue](#despliegue))

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com) (proyecto creado)

## Puesta en marcha

```bash
npm install
cp .env.example .env
```

Rellena `.env` con tus credenciales:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Aplica las migraciones en orden en el SQL Editor de Supabase (o vía `supabase db push`):

```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_seed_subtipos.sql
supabase/migrations/003_fix_adjuntar_imagen_rls.sql
supabase/migrations/004_fix_storage_listado_publico.sql
supabase/migrations/005_panel_admin.sql
supabase/migrations/006_fix_admin_users_rls_recursiva.sql
supabase/migrations/007_nuevos_tipos_deportivas_patrimonio_edificios_mobiliario.sql
supabase/migrations/008_gestion_tipos_admin.sql
```

- `001` crea las 5 tablas (`tipos_incidencias`, `subtipos_incidencias`, `incidencias_anonimas`,
  `images`, `admin_users`), las políticas RLS de acceso anónimo, el bucket de Storage
  `incidencias` y el seed de los 8 tipos iniciales + subtipos de "Limpieza viaria".
- `002` añade los subtipos del resto de los 8 tipos iniciales.
- `003`–`004` corrigen políticas RLS de subida de imágenes y de listado del bucket.
- `005` crea el panel admin (tabla `admin_users`, políticas para incidencias).
- `006` corrige una recursión infinita en la policy RLS de `admin_users`.
- `007` añade 4 tipos nuevos (deportivas, patrimonio, edificios, mobiliario) con 37 subtipos.
- `008` habilita gestión de tipos/subtipos desde el panel admin (permisos de escritura +
  backfill de `icono_name`, la columna que la BD usa como fuente de verdad del icono).

Tras `008` hay 12 tipos y 99 subtipos en total. El panel admin (`/admin`) permite crear,
editar, reordenar y desactivar/eliminar tipos y subtipos sin tocar código ni SQL — cualquier
tipo/subtipo nuevo creado desde ahí ya lleva icono propio gracias a `icono_name`.

Para acceder a `/admin` necesitas un usuario de Supabase Auth cuyo `id` esté también en la
tabla `admin_users` (columna `id`, `email`, `rol`).

Arranca el entorno de desarrollo:

```bash
npm run dev
```

## Fuente Myriad Pro

Myriad Pro es una fuente de pago (Adobe) y no se incluye en el repositorio. Coloca los
archivos `.woff2` licenciados en `public/fonts/MyriadPro-Regular.woff2` (ver
`src/styles/globals.css`). Sin esos archivos, la app usa el fallback del sistema
definido en `tailwind.config.js`.

## Estructura

```
src/
├── admin/                # Panel admin (/admin): login, dashboard de incidencias,
│                         # gestión de tipos/subtipos (GestionTipos.tsx)
├── components/
│   ├── Incidencia/       # Flujo de creación de incidencia (tipo, subtipo, cámara, ficha)
│   ├── Map/              # Mapa MapLibre + estadísticas
│   └── Layout/           # Header (logo + wordmark) / Footer
├── hooks/                # Geolocalización, compresión de imagen, localStorage, tipos, auth admin
├── services/             # Cliente Supabase + storage/incidencias/admin/tiposAdmin
├── types/                # Tipos TypeScript compartidos
├── data/                 # Fallback local de tipos + mapa de iconos emoji (fallback de icono_name)
├── assets/               # Logo y wordmark de REPORTA (fondo transparente)
└── styles/                # Tailwind + variables CSS globales
```

## Despliegue

El sitio de Netlify (`app-reporta`) está conectado directamente al repo de GitHub:
cada push a `main` dispara un build (`npm run build`) y deploy automático en la
infraestructura de Netlify, sin pasos manuales ni GitHub Actions de por medio.

Dominio propio: `app-reporta.es` (Hostinger), con `www` redirigiendo al apex y
subdominios por municipio (ej. `almeria.app-reporta.es`, `garrucha.app-reporta.es`)
dados de alta uno a uno como domain alias en Netlify + CNAME en Hostinger. El
DNS se gestiona en Hostinger (no en Netlify DNS) para no afectar al correo del
dominio.

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Variables de entorno** (Site settings → Environment variables en Netlify):
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Para desplegar manualmente desde local (por ejemplo, para probar antes de hacer push):

```bash
npx netlify deploy --prod --dir=dist --build
```

### Nota sobre MapLibre en producción

`vite.config.ts` incluye un plugin (`copiarWorkerMaplibre`) que copia
`maplibre-gl-worker.mjs` y `maplibre-gl-shared.mjs` desde `node_modules/maplibre-gl/dist/`
a `dist/assets/` en cada build. Sin esto el mapa queda en blanco en producción: el dev
server de Vite sirve esos archivos al vuelo, pero un build de producción normal no los
emite, y el worker de MapLibre (que carga los tiles) nunca llega a inicializarse.

## Costes de infraestructura estimados

| Servicio       | Coste     |
|----------------|-----------|
| Supabase Pro   | €25/mes   |
| Netlify Pro    | €19/mes   |
| MapLibre + OpenFreeMap | €0/mes |
| Dominio .es    | €1.25/mes |
| **Total**      | **~€45/mes** |

> Nota: el coste original de €60/mes contaba con Mapbox (€0–10/mes). Al usar
> MapLibre + OpenFreeMap ese coste desaparece; si en el futuro se necesita más
> control/SLA sobre los tiles, se puede migrar a un proveedor como MapTiler o
> Stadia Maps sin cambiar código (MapLibre es agnóstico del proveedor de tiles).
