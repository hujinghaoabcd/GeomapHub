# Development Handoff Log

## 2026-07-28 — Repository foundation

### Decisions

- Continue the existing `hujinghaoabcd/GeomapHub` repository rather than create a duplicate portal repository.
- Keep `openlayers-webgis-platform` (OMap) independent as a candidate reusable frontend mapping SDK.
- Use a Django modular monolith for the control plane.
- Use PostGIS + Martin for vector tile delivery.
- Use Celery + Redis for background work, while PostgreSQL remains the permanent job ledger.
- Use COG + MinIO/S3 + TiTiler for raster delivery.
- Keep GeoServer optional and limited to legacy OGC compatibility.

### Foundation scope

- Docker Compose topology for PostGIS, Redis, MinIO, Django, Celery, Martin, and Vue.
- Custom UUID user model.
- Organization and membership models.
- Unified Resource model with spatial and temporal extents.
- Persistent Job model and queue-routed Celery tasks.
- Health endpoint and initial resource endpoints.
- Vue/OpenLayers portal shell.
- Architecture, roadmap, validation, and CI.

### Next action

Implement M1 upload sessions and the Shapefile/GeoPackage/GeoJSON import pipeline. Begin with secure ZIP extraction, dataset inspection, deterministic table naming, transaction-safe PostGIS import, and resource/job status transitions.
