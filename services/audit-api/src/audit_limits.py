"""
Daily audit usage tracking and limit enforcement for the backend API.
"""

from datetime import datetime, date
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

# Daily audit limit for free users
DAILY_AUDIT_LIMIT = 3

class DailyAuditUsageTracker:
    """Tracks daily audit usage for users."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_today_usage(self, user_id: str) -> int:
        """Get the number of audits used today by a user."""
        today = date.today().isoformat()
        
        try:
            result = self.db.execute(
                text("""
                    SELECT COUNT(*) as count 
                    FROM audits 
                    WHERE user_id = :user_id 
                    AND DATE(created_at) = :today
                """),
                {"user_id": user_id, "today": today}
            ).fetchone()
            
            return result.count if result else 0
        except Exception as e:
            logger.error(f"Error getting today's usage for user {user_id}: {e}")
            return 0
    
    def can_create_audit(self, user_id: str) -> Dict[str, Any]:
        """Check if a user can create a new audit based on daily limits."""
        if not user_id:
            return {
                "can_create": True,
                "remaining": DAILY_AUDIT_LIMIT,
                "used_today": 0,
                "daily_limit": DAILY_AUDIT_LIMIT,
                "message": None
            }
        
        used_today = self.get_today_usage(user_id)
        remaining = max(0, DAILY_AUDIT_LIMIT - used_today)
        can_create = used_today < DAILY_AUDIT_LIMIT
        
        return {
            "can_create": can_create,
            "remaining": remaining,
            "used_today": used_today,
            "daily_limit": DAILY_AUDIT_LIMIT,
            "message": None if can_create else f"Daily audit limit of {DAILY_AUDIT_LIMIT} reached. Try again tomorrow."
        }
    
    def record_audit_creation(self, user_id: str, audit_id: str) -> bool:
        """Record that a user has created an audit."""
        if not user_id:
            return True
        
        try:
            # The audit record itself serves as the usage tracking
            # This method is mainly for logging and future analytics
            logger.info(f"Audit {audit_id} created by user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error recording audit creation for user {user_id}: {e}")
            return False

def check_audit_limits(db: Session, user_id: Optional[str]) -> Dict[str, Any]:
    """Check if a user can create a new audit based on daily limits."""
    if not user_id:
        # Anonymous users have no limits (for now)
        return {
            "can_create": True,
            "remaining": DAILY_AUDIT_LIMIT,
            "used_today": 0,
            "daily_limit": DAILY_AUDIT_LIMIT,
            "message": None
        }
    
    tracker = DailyAuditUsageTracker(db)
    return tracker.can_create_audit(user_id)

