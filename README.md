# Ship24Go

Código fuente de Ship24Go, la plataforma de cotización, creación y seguimiento
de envíos multioperador. Este repositorio corresponde al despliegue operativo
de `ship24go.com` en la versión `1.4.37`.

## Stack

- React 19 + Vite + TypeScript
- Express + Node.js
- MySQL mediante `mysql2`
- Integraciones de transportistas, pagos, tiendas y seguimiento

## Desarrollo local

Requisitos: Node.js compatible con las versiones declaradas en
`package.json` y una instancia MySQL disponible.

```bash
npm ci
cp .env.example .env
# Completar .env únicamente en el entorno local o en el gestor de secretos
npm run dev
```

Comprobaciones disponibles:

```bash
npm run lint
npm run build
npm start
```

## Estructura

- `src/`: aplicación web React.
- `server/` y `server.ts`: API Express e integración del servidor.
- `public/`: recursos públicos de la aplicación.
- `scripts/`: utilidades operativas y diagnósticos controlados.
- `migrations/`: esquema y migraciones SQL.
- `docs/`: documentación funcional y técnica de las versiones.
- `ecosystem.config.cjs`: configuración de ejecución con PM2.

## Configuración y seguridad

`.env.example` documenta los nombres de configuración necesarios, pero no
contiene credenciales. Los valores reales deben mantenerse fuera de GitHub y
proporcionarse mediante variables de entorno o un gestor de secretos.

El repositorio excluye deliberadamente dependencias instaladas, builds
generados, backups, diagnósticos de producción, uploads, storage, releases,
archivos de recuperación, archivos operativos comprimidos y PDFs de trabajo.
El build reproducible se genera con `npm run build`.

## Publicación

La aplicación pública es Ship24Go. CodeMorf participa como agencia y
desarrollador técnico del proyecto.
