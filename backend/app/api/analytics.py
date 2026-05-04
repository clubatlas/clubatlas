"""
Analytics API - monthly / time-series statistics
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.api.dependencies import require_club_leader
from app.services.firestore_service import subscription_service, user_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class AnalyticsTrendsResponse(BaseModel):
    months: list[str]
    subscribers: list[int]


def _to_datetime(val) -> Optional[datetime]:
    """Convert Firestore timestamp/datetime to naive UTC datetime"""
    if val is None:
        return None
    if hasattr(val, "seconds") and not isinstance(val, datetime):
        return datetime.utcfromtimestamp(val.seconds + getattr(val, "nanoseconds", 0) / 1e9)
    if isinstance(val, datetime):
        if val.tzinfo is not None:
            import calendar
            return datetime.utcfromtimestamp(calendar.timegm(val.utctimetuple()))
        return val
    if hasattr(val, "timestamp"):
        return datetime.utcfromtimestamp(val.timestamp())
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return None
    return None


@router.get("/clubs/{club_id}/trends", response_model=AnalyticsTrendsResponse)
async def get_club_analytics_trends(
    club_id: str,
    months: int = Query(6, ge=1, le=12, description="Number of months to query"),
    current_user: dict = Depends(require_club_leader),
):
    """
    Monthly subscriber statistics for a club - non-cumulative by subscription month
    """
    user_id = current_user["uid"]
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = (user_profile or {}).get("managed_club_ids", [])

    if club_id not in managed_clubs and current_user.get("role") != "super-admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view analytics for clubs you manage",
        )

    try:
        now = datetime.utcnow()
        month_keys: list[tuple[int, int]] = []
        for i in range(months - 1, -1, -1):
            m = now.month - i
            y = now.year
            while m <= 0:
                m += 12
                y -= 1
            month_keys.append((y, m))

        subscribers = await subscription_service.get_club_subscribers(club_id, active_only=True)

        subs_by_month: dict[tuple[int, int], int] = {(y, m): 0 for y, m in month_keys}

        for sub in subscribers:
            dt = _to_datetime(sub.get("subscribed_at")) or _to_datetime(sub.get("created_at"))
            if not dt:
                continue
            key = (dt.year, dt.month)
            if key in subs_by_month:
                subs_by_month[key] += 1

        month_labels = []
        subs_data = []
        for y, m in month_keys:
            month_labels.append(datetime(y, m, 1).strftime("%b"))
            subs_data.append(subs_by_month[(y, m)])

        return AnalyticsTrendsResponse(
            months=month_labels,
            subscribers=subs_data,
        )
    except Exception as e:
        print(f"Analytics trends error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load analytics trends",
        )
