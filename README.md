# Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico

Vectra Cure ayuda a pacientes a encontrar especialistas cercanos, compararlos y
reservar una cita. También permite a especialistas publicar su consultorio y
ganar visibilidad.

## Estructura del repositorio

```text
vectra_cure/   aplicación Flask: código, estilos, plantillas y pruebas
docs/
  guides/MANUAL_DE_USO.md    manual de operación y uso
  design/02_DESIGN_SYSTEM.md sistema visual (tokens, tipografía, componentes)
README.md      este archivo
```

## Cómo levantar la aplicación

Ver **[`vectra_cure/README.md`](vectra_cure/README.md)** (entorno, dependencias,
variables `.env`) y el **[Manual de uso](docs/guides/MANUAL_DE_USO.md)**.

La aplicación necesita una base **PostgreSQL** ya creada y con el esquema
cargado. Los scripts SQL de inicialización, migración y semillas, junto con toda
su documentación, viven fuera del repositorio en
**`Documentacion_PSM/database/`** — se ejecutan desde pgAdmin.

## Documentación

Salvo el manual de uso y el sistema de diseño (que se quedan en `docs/`), el
resto de la documentación del proyecto —investigación UX, arquitectura, PRDs,
flujos, informes, auditorías, base de datos y recursos de diseño (Stitch,
Figma)— se movió a una carpeta aparte:

**`C:\Users\HP\OneDrive\Desktop\Documentacion_PSM\`**

Ver `Documentacion_PSM/README.md` para el índice.
