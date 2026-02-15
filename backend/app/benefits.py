from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from .models import Benefit, BenefitCategory, BenefitSource, BenefitStatus

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "benefits.json"


def _parse_date(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip()
    return cleaned or None


def _status_from_dates(end_date: str | None) -> BenefitStatus:
    if not end_date:
        return BenefitStatus.UNKNOWN
    try:
        parsed = datetime.strptime(end_date[:8], "%Y%m%d")
        return (
            BenefitStatus.ENDED
            if parsed.date() < datetime.utcnow().date()
            else BenefitStatus.ACTIVE
        )
    except ValueError:
        return BenefitStatus.UNKNOWN


def _category_from_labels(
    primary: str | None, secondary: str | None
) -> BenefitCategory:
    labels = " ".join(filter(None, [primary, secondary]))
    if "취업" in labels or "일자리" in labels:
        return BenefitCategory.EMPLOYMENT
    if "주거" in labels:
        return BenefitCategory.HOUSING
    if "교육" in labels:
        return BenefitCategory.EDUCATION
    if "복지" in labels or "건강" in labels:
        return BenefitCategory.WELFARE
    if "금융" in labels or "대출" in labels:
        return BenefitCategory.FINANCE
    if "문화" in labels or "예술" in labels or "여가" in labels:
        return BenefitCategory.CULTURE
    return BenefitCategory.ETC


def _extract_region(text: str | None) -> str | None:
    if not text:
        return None
    patterns = [
        ("서울", "서울"),
        ("부산", "부산"),
        ("대구", "대구"),
        ("인천", "인천"),
        ("광주", "광주"),
        ("대전", "대전"),
        ("울산", "울산"),
        ("세종", "세종"),
        ("경기", "경기"),
        ("강원", "강원"),
        ("충북", "충북"),
        ("충청북", "충북"),
        ("충남", "충남"),
        ("충청남", "충남"),
        ("전북", "전북"),
        ("전라북", "전북"),
        ("전남", "전남"),
        ("전라남", "전남"),
        ("경북", "경북"),
        ("경상북", "경북"),
        ("경남", "경남"),
        ("경상남", "경남"),
        ("제주", "제주"),
    ]
    for key, region in patterns:
        if key in text:
            return region
    return None


def load_benefits() -> list[Benefit]:
    if not DATA_PATH.exists():
        return []
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    benefits: list[Benefit] = []
    for item in data:
        end_date = _parse_date(item.get("bizPrdEndYmd"))
        start_date = _parse_date(item.get("bizPrdBgngYmd"))
        application_period = _parse_date(item.get("aplyYmd"))
        region = (
            _extract_region(item.get("sprvsnInstCdNm"))
            or _extract_region(item.get("operInstCdNm"))
            or _extract_region(item.get("plcyNm"))
            or _extract_region(item.get("plcyExplnCn"))
        )
        benefit = Benefit(
            id=str(item.get("plcyNo") or item.get("plcyId") or item.get("id")),
            title=item.get("plcyNm") or item.get("title") or "",
            description=item.get("plcyExplnCn") or item.get("description") or "",
            category=_category_from_labels(item.get("lclsfNm"), item.get("mclsfNm")),
            source=BenefitSource.YOUTH_POLICY,
            status=_status_from_dates(end_date),
            organization=item.get("sprvsnInstCdNm") or item.get("operInstCdNm"),
            region=region,
            start_date=start_date,
            end_date=end_date,
            application_period=application_period,
            apply_url=item.get("aplyUrlAddr") or None,
            reference_url=item.get("refUrlAddr1") or None,
            min_age=_safe_int(item.get("sprtTrgtMinAge")),
            max_age=_safe_int(item.get("sprtTrgtMaxAge")),
            regions=_split_regions(item.get("zipCd")),
            support_count=_safe_int(item.get("sprtSclCnt")),
        )
        benefits.append(benefit)
    return benefits


def _safe_int(value: str | int | None) -> int | None:
    if value is None:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def _split_regions(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]
