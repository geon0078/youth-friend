from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class BenefitSource(str, Enum):
    YOUTH_POLICY = "youth-policy"
    EMPLOYMENT24 = "employment24"
    GOV24 = "gov24"


class BenefitStatus(str, Enum):
    ACTIVE = "active"
    UPCOMING = "upcoming"
    ENDED = "ended"
    UNKNOWN = "unknown"


class BenefitCategory(str, Enum):
    EMPLOYMENT = "employment"
    HOUSING = "housing"
    EDUCATION = "education"
    WELFARE = "welfare"
    FINANCE = "finance"
    CULTURE = "culture"
    ETC = "etc"


class Benefit(BaseModel):
    id: str
    title: str
    description: str
    category: BenefitCategory
    source: BenefitSource
    status: BenefitStatus
    organization: str | None = None
    region: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    application_period: str | None = None
    apply_url: str | None = None
    reference_url: str | None = None
    min_age: int | None = None
    max_age: int | None = None
    regions: list[str] = Field(default_factory=list)
    support_count: int | None = None


class BenefitList(BaseModel):
    items: list[Benefit]
    total: int


class UserProfile(BaseModel):
    birth_year: int | None = None
    region: str | None = None
    income_level: Literal["below50", "50to100", "100to150", "above150"] | None = None
    employment_status: (
        Literal["employed", "unemployed", "student", "self-employed", "part-time"]
        | None
    ) = None
    marketing_opt_in: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationStatus(str, Enum):
    PREPARING = "preparing"
    APPLIED = "applied"
    APPROVED = "approved"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(BaseModel):
    id: str
    benefit_id: str
    status: ApplicationStatus
    note: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationType(str, Enum):
    DEADLINE = "deadline"
    NEW_BENEFIT = "new_benefit"
    RESULT = "result"
    SYSTEM = "system"


class Notification(BaseModel):
    id: str
    title: str
    body: str
    type: NotificationType
    benefit_id: str | None = None
    application_id: str | None = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
