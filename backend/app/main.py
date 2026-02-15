from __future__ import annotations

import os
from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .benefits import load_benefits
from .models import (
    Application,
    ApplicationStatus,
    Benefit,
    BenefitCategory,
    BenefitList,
    BenefitSource,
    Notification,
    NotificationType,
    UserProfile,
)
from .storage import store

load_dotenv()

app = FastAPI(title="Youth Friend Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BENEFITS: List[Benefit] = load_benefits()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "benefits": len(BENEFITS)}


@app.get("/benefits", response_model=BenefitList)
def list_benefits(
    search: str | None = None,
    category: BenefitCategory | None = None,
    source: BenefitSource | None = None,
    hide_ended: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> BenefitList:
    items = BENEFITS
    if search:
        term = search.strip().lower()
        items = [
            benefit
            for benefit in items
            if term in benefit.title.lower() or term in benefit.description.lower()
        ]
    if category:
        items = [benefit for benefit in items if benefit.category == category]
    if source:
        items = [benefit for benefit in items if benefit.source == source]
    if hide_ended:
        items = [benefit for benefit in items if benefit.status != benefit.status.ENDED]
    total = len(items)
    return BenefitList(items=items[offset : offset + limit], total=total)


@app.get("/benefits/{benefit_id}", response_model=Benefit)
def get_benefit(benefit_id: str) -> Benefit:
    for benefit in BENEFITS:
        if benefit.id == benefit_id:
            return benefit
    raise HTTPException(status_code=404, detail="Benefit not found")


@app.get("/profile", response_model=UserProfile | None)
def get_profile() -> UserProfile | None:
    return store.profile


@app.post("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile) -> UserProfile:
    store.profile = profile
    return profile


@app.get("/applications", response_model=List[Application])
def list_applications(status: ApplicationStatus | None = None) -> List[Application]:
    items = store.list_applications()
    if status:
        items = [item for item in items if item.status == status]
    return items


@app.post("/applications", response_model=Application)
def create_application(benefit_id: str) -> Application:
    application = Application(
        id=str(uuid4()),
        benefit_id=benefit_id,
        status=ApplicationStatus.PREPARING,
    )
    store.applications[application.id] = application
    return application


@app.patch("/applications/{application_id}", response_model=Application)
def update_application_status(
    application_id: str,
    status: ApplicationStatus,
    note: str | None = None,
) -> Application:
    application = store.applications.get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    updated = application.copy(
        update={"status": status, "note": note, "updated_at": datetime.utcnow()}
    )
    store.applications[application_id] = updated
    return updated


@app.delete("/applications/{application_id}")
def delete_application(application_id: str) -> dict:
    store.applications.pop(application_id, None)
    return {"status": "deleted"}


@app.get("/notifications", response_model=List[Notification])
def list_notifications() -> List[Notification]:
    return store.list_notifications()


@app.post("/notifications", response_model=Notification)
def create_notification(
    title: str,
    body: str,
    type: NotificationType,
    benefit_id: str | None = None,
    application_id: str | None = None,
) -> Notification:
    notification = Notification(
        id=str(uuid4()),
        title=title,
        body=body,
        type=type,
        benefit_id=benefit_id,
        application_id=application_id,
    )
    store.notifications[notification.id] = notification
    return notification


@app.post("/notifications/mark-all-read")
def mark_all_read() -> dict:
    for notification_id, notification in list(store.notifications.items()):
        store.notifications[notification_id] = notification.copy(
            update={"is_read": True}
        )
    return {"status": "ok"}


@app.delete("/notifications/clear")
def clear_notifications() -> dict:
    store.notifications.clear()
    return {"status": "cleared"}


@app.post("/reset")
def reset_data() -> dict:
    store.profile = None
    store.applications.clear()
    store.notifications.clear()
    return {"status": "reset"}
