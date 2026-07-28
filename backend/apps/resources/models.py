from __future__ import annotations

import uuid

from django.conf import settings
from django.contrib.gis.db import models

from apps.organizations.models import Organization


class Resource(models.Model):
    class Type(models.TextChoices):
        VECTOR_DATASET = "vector_dataset", "Vector dataset"
        RASTER_DATASET = "raster_dataset", "Raster dataset"
        TABLE_DATASET = "table_dataset", "Table dataset"
        MAP = "map", "Map"
        SCENE = "scene", "Scene"
        DASHBOARD = "dashboard", "Dashboard"
        STORY = "story", "Story"
        DOCUMENT = "document", "Document"
        SERVICE = "service", "External service"
        ANALYSIS_RESULT = "analysis_result", "Analysis result"
        APPLICATION = "application", "Application"

    class Visibility(models.TextChoices):
        PRIVATE = "private", "Private"
        ORGANIZATION = "organization", "Organization"
        PUBLIC = "public", "Public"
        LINK = "link", "Anyone with link"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"
        ARCHIVED = "archived", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource_type = models.CharField(max_length=32, choices=Type.choices)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="resources")
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        related_name="resources",
        null=True,
        blank=True,
    )
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.PRIVATE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    metadata = models.JSONField(default=dict, blank=True)
    spatial_extent = models.PolygonField(srid=4326, null=True, blank=True)
    temporal_start = models.DateTimeField(null=True, blank=True)
    temporal_end = models.DateTimeField(null=True, blank=True)
    thumbnail_url = models.URLField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)
        constraints = [
            models.UniqueConstraint(fields=("owner", "slug"), name="unique_resource_slug_per_owner")
        ]
        indexes = [
            models.Index(fields=("resource_type", "status")),
            models.Index(fields=("visibility", "updated_at")),
        ]

    def __str__(self) -> str:
        return self.title
