# Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico

Vectra Cure ayuda a pacientes a encontrar especialistas cercanos, compararlos y
reservar una cita. También permite a especialistas publicar su consultorio y
ganar visibilidad.

## Punto de partida

- [Cómo trabajamos el proyecto](FLUJO_DE_TRABAJO.md)
- [Índice completo de documentación](docs/README.md)
- [Manual de uso](docs/guides/MANUAL_DE_USO.md)
- [Aplicación Flask](vectra_cure/README.md)
- [Esquema de base de datos](database/README.md)

## Especificación vigente del rediseño

| Documento | Propósito |
| --- | --- |
| [Plan maestro de producto](docs/product/prds/plan-maestro-producto-vectra-cure-v1.0.md) | Alcance, decisiones de arquitectura y orden de trabajo. |
| [PRD de landing V2](docs/product/prds/landing-medica-v2-v1.0-prd.md) | Dirección visual, landing, acceso, mapa y panel profesional. |
| [Flujos de producto V2](docs/product/prds/flujos-producto-v2-v1.0.md) | Recorridos detallados de paciente y especialista. |
| [Paquete para Google Stitch](docs/design/stitch/README.md) | Contexto visual y prompts por pantalla. |

## Estructura

```text
docs/          documentación por dominio, informes y especificaciones
database/      scripts PostgreSQL y documentación del esquema
scripts/       automatizaciones auxiliares
vectra_cure/   aplicación Flask, estilos, plantillas y pruebas
```

Los documentos originales de investigación, arquitectura y flujos se conservan
en `docs/` como antecedentes. Si contradicen la especificación V2, prevalecen
los documentos de `docs/product/prds/`.
