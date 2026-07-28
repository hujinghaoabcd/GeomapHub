from __future__ import annotations

from django.db.models import Q
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from .models import Resource
from .schemas import ResourceCreate, ResourceOut

router = Router(tags=["resources"])


@router.get("", response=list[ResourceOut])
def list_resources(request):
    queryset = Resource.objects.filter(visibility=Resource.Visibility.PUBLIC)
    if request.user.is_authenticated:
        queryset = Resource.objects.filter(Q(visibility=Resource.Visibility.PUBLIC) | Q(owner=request.user))
    return queryset[:100]


@router.get("{resource_id}", response=ResourceOut)
def get_resource(request, resource_id):
    resource = get_object_or_404(Resource, id=resource_id)
    if resource.visibility != Resource.Visibility.PUBLIC and resource.owner_id != getattr(request.user, "id", None):
        raise HttpError(404, "Resource not found")
    return resource


@router.post("", response={201: ResourceOut, 401: dict})
def create_resource(request, payload: ResourceCreate):
    if not request.user.is_authenticated:
        return 401, {"detail": "Authentication required"}
    resource = Resource.objects.create(owner=request.user, **payload.model_dump())
    return 201, resource
