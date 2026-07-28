# GeomapHub Architecture

## Product objective

GeomapHub provides the capabilities expected from an ArcGIS Online / Portal-style platform and a spatial data catalogue without making GeoServer, a second authorization system, or a separate metadata database mandatory.

## System boundary

```text
Browser (Vue + OpenLayers)
        |
        v
Django modular monolith
  |-- accounts and organizations
  |-- unified resources and metadata
  |-- permissions and audit
  |-- upload and processing orchestration
  |-- REST / OpenAPI / OGC adapters
        |
        +--> PostgreSQL / PostGIS
        +--> Redis --> Celery workers
        +--> S3 / MinIO
        +--> Martin --> vector tiles
        +--> TiTiler --> raster tiles
```

## Core principles

### Modular monolith first

Business modules share one deployable backend and one transactional database. Internal module boundaries are explicit; network services are introduced only for independently scalable data-plane workloads such as vector and raster tiles.

### Unified resource model

Every user-visible object derives from `Resource`: datasets, maps, scenes, dashboards, stories, documents, external services, analysis results, and applications. Search, metadata, ownership, sharing, versioning, favourites, and audit are implemented once.

### Control plane versus data plane

Django is the control plane: identity, authorization, catalogue, configuration, jobs, and editing. Martin and TiTiler are the data plane: high-throughput vector and raster delivery. Tile services are not independent sources of truth.

### Permanent and transient state

PostgreSQL stores durable resource and job state. Redis carries transient task messages. Large input and output files live in S3-compatible storage. Celery messages contain identifiers, never geospatial file payloads.

## Publishing stack

| Data | Canonical storage | Delivery | Query/edit |
|---|---|---|---|
| Vector | PostGIS | Martin + MVT | Django API / OGC API Features |
| Raster | COG in S3/MinIO | TiTiler | Django-controlled metadata and processing |
| Maps | Versioned JSON document | OpenLayers portal | Django API |
| Metadata | Resource + JSONB + relational core | REST, OGC API Records, CSW, STAC | Django catalogue |

GeoServer may be enabled later as a legacy protocol adapter for comprehensive WMS/WFS/WCS/SLD compatibility. It is not required for the core platform.

## Initial security model

The foundation starts with ownership and visibility. The next security milestone adds object grants for users, groups, organizations, anonymous access, authenticated access, API keys, and expiring share links. API, download, edit, tile-token, and catalogue decisions must call the same permission service.
