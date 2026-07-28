from __future__ import annotations

from datetime import datetime, timezone

from ninja import NinjaAPI

from apps.resources.api import router as resources_router

api = NinjaAPI(
    title="GeomapHub API",
    version="0.1.0",
    description="Resource catalogue and geospatial platform API.",
)


@api.get("health", tags=["system"])
def health(request):
    return {
        "status": "ok",
        "service": "geomaphub-api",
        "timestamp": datetime.now(timezone.utc),
    }


api.add_router("resources/", resources_router)
