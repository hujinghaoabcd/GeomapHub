# Roadmap

## M0 — Foundation

- Monorepo structure
- Django, PostGIS, Celery, Redis, MinIO, and Martin development topology
- Custom user and organization models
- Unified Resource model
- Persistent Job model
- Health API and initial resource API
- Vue/OpenLayers portal shell
- Architecture decisions and CI

## M1 — Vector publishing vertical slice

- Multipart upload and upload sessions
- Shapefile ZIP, GeoPackage, GeoJSON, and CSV import
- File inspection, CRS detection, geometry validation, and secure extraction
- Deterministic PostGIS table naming
- Spatial and attribute index creation
- Dataset schema and field statistics
- Martin source registration and TileJSON exposure
- Dataset detail page, attribute table, default style, and preview
- GeoPackage and GeoJSON export

## M2 — Authorization and catalogue

- Object-level permissions
- Groups, organization roles, share links, and API keys
- Full-text, spatial, temporal, and faceted search
- Metadata profiles, contacts, distributions, lineage, and relations
- Audit log, favourites, collections, and usage statistics

## M3 — Raster publishing

- GeoTIFF inspection and COG conversion
- MinIO/S3 object lifecycle
- TiTiler integration
- Band combinations, rescaling, colour maps, statistics, point query, and preview
- STAC Item and Collection projections

## M4 — Map studio

- Map document schema and versioning
- Layer tree, style editor, filters, labels, popups, drawing, measurement, and print
- Saved maps, sharing, embedding, and public viewer
- Integration with the existing OMap/OpenLayers SDK where appropriate

## M5 — Standards and federation

- OGC API Features
- OGC API Tiles
- OGC API Records
- CSW 2.0.2 through embedded pycsw
- STAC API
- External WMS, WMTS, WFS, ArcGIS REST, COG, and STAC registration

## M6 — Applications and analysis

- Dashboards, stories, and application builder
- Processing plugin interface
- Core vector and raster tools
- pyKDEX and pyGWRx adapters
- Data lineage and reproducible analysis jobs
