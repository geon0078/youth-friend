from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from .models import Application, Notification, UserProfile


@dataclass
class InMemoryStore:
    profile: UserProfile | None = None
    applications: Dict[str, Application] = field(default_factory=dict)
    notifications: Dict[str, Notification] = field(default_factory=dict)

    def list_applications(self) -> List[Application]:
        return list(self.applications.values())

    def list_notifications(self) -> List[Notification]:
        return list(self.notifications.values())


store = InMemoryStore()
