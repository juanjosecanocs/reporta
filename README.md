# REPORTA

App de incidencias ciudadanas para Almería. Fase 1: 100% anónima, sin login.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (v3)
- Supabase (Postgres + Storage)
- MapLibre GL JS + [OpenFreeMap](https://openfreemap.org) (tiles gratuitos, sin API key)
- Zustand
- Netlify + GitHub Actions

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

Aplica el esquema de base de datos en el SQL Editor de Supabase (o vía `supabase db push`):

```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_seed_subtipos.sql
```

`001` crea las 5 tablas (`tipos_incidencias`, `subtipos_incidencias`, `incidencias_anonimas`,
`images`, `admin_users`), las políticas RLS de acceso anónimo, el bucket de Storage
`incidencias` y el seed de los 8 tipos + subtipos de "Limpieza viaria". `002` añade los
subtipos del resto de tipos (62 subtipos en total entre ambas migraciones).

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
├── components/
│   ├── Incidencia/   # Flujo de creación de incidencia (tipo, subtipo, cámara)
│   ├── Map/           # Mapa MapLibre + estadísticas
│   └── Layout/         # Header / Footer
├── hooks/               # Geolocalización, compresión de imagen, localStorage, tipos
├── services/            # Cliente Supabase + storage/incidencias
├── types/               # Tipos TypeScript compartidos
├── data/                # Fallback local de tipos (solo si Supabase no responde)
└── styles/              # Tailwind + variables CSS globales
```

## Despliegue

El workflow `.github/workflows/deploy.yml` construye y despliega a Netlify en cada
push a `main`. Configura estos secrets en el repo de GitHub:

- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

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
