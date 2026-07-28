# GeomapHub

GeomapHub is a lightweight, full-scope geospatial data portal and web mapping platform. It is designed as a simpler alternative to tightly coupled GeoNode-style deployments while preserving the complete product surface: spatial catalogue, vector and raster publishing, online maps, permissions, metadata, processing jobs, standards-based APIs, dashboards, stories, and extensibility.

> Status: foundation milestone. The first development branch establishes the modular-monolith backend, PostGIS, Celery/Redis, MinIO, Martin, the unified resource model, and the portal shell.

## Architecture at a glance

- **Backend:** Django 5.2 LTS + Django Ninja
- **Database:** PostgreSQL + PostGIS
- **Task execution:** Celery + Redis, with permanent job state in PostgreSQL
- **Vector publishing:** PostGIS + Martin (MVT)
- **Raster publishing:** COG + S3/MinIO + TiTiler
- **Portal:** Vue 3 + TypeScript + OpenLayers
- **Metadata:** unified Resource model with CSW/pycsw, OGC API Records, and STAC adapters

The platform follows three rules:

1. A resource is stored once and exposed through multiple protocols.
2. Authorization is evaluated by one platform permission service.
3. GeoServer is optional compatibility infrastructure, not a mandatory system core.

## Planned development stack

```text
Browser / Vue / OpenLayers
          |
          v
Django control plane
  |-- users, organizations, permissions
  |-- resources, metadata, maps, jobs
  |-- REST, OGC, CSW and STAC adapters
          |
          +--> PostgreSQL / PostGIS
          +--> Redis --> Celery workers
          +--> S3 / MinIO
          +--> Martin --> vector tiles
          +--> TiTiler --> raster tiles
```

See [Architecture](docs/ARCHITECTURE.md), [Roadmap](docs/ROADMAP.md), and [Development log](docs/DEVELOPMENT_LOG.md).

## License

GeomapHub is released under the MIT License.
