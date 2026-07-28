from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_name = models.CharField(max_length=150, blank=True)
    locale = models.CharField(max_length=16, default="zh-CN")

    def __str__(self) -> str:
        return self.display_name or self.username
