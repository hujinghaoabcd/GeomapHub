from __future__ import annotations

from datetime import datetime
from uuid import UUID

from ninja import Schema
from pydantic import Field


class ResourceCreate(Schema):
    resource_type: str
    title: str
    slug: str
    description: str = ""
    visibility: str = "private"
    metadata: dict = Field(default_factory=dict)


class ResourceOut(Schema):
    id: UUID
    resource_type: str
    title: str
    slug: str
    description: str
    visibility: str
    status: str
    metadata: dict
    created_at: datetime
    updated_at: datetime
