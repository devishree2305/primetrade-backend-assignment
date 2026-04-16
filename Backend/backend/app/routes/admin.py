from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin_request import AdminRequest
from app.models.user import User
from app.schemas.admin_request_schema import AdminRequestAction, AdminRequestCreateResponse, AdminRequestResponse
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/requests", response_model=AdminRequestCreateResponse, status_code=status.HTTP_201_CREATED)
def create_admin_request(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AdminRequestCreateResponse:
    if current_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already an admin",
        )

    existing_request = (
        db.query(AdminRequest)
        .filter(AdminRequest.user_id == current_user.id, AdminRequest.status == "pending")
        .first()
    )
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pending admin request already exists",
        )

    request = AdminRequest(user_id=current_user.id, status="pending")
    db.add(request)
    db.commit()
    return AdminRequestCreateResponse(message="Admin role request submitted successfully")


@router.get("/requests", response_model=list[AdminRequestResponse], status_code=status.HTTP_200_OK)
def list_admin_requests(
    request_status: str | None = Query(default=None, alias="status"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[AdminRequest]:
    query = db.query(AdminRequest)
    if request_status in {"pending", "approved", "rejected"}:
        query = query.filter(AdminRequest.status == request_status)
    return query.order_by(AdminRequest.requested_at.desc()).all()


@router.post("/approve/{request_id}", response_model=AdminRequestResponse, status_code=status.HTTP_200_OK)
def review_admin_request(
    request_id: int,
    payload: AdminRequestAction = AdminRequestAction(action="approved"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AdminRequest:
    admin_request = db.query(AdminRequest).filter(AdminRequest.id == request_id).first()
    if admin_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin request not found",
        )

    if admin_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin request has already been reviewed",
        )

    user = db.query(User).filter(User.id == admin_request.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested user not found",
        )

    admin_request.status = payload.action
    admin_request.reviewed_by = current_admin.id
    admin_request.reviewed_at = datetime.now(timezone.utc)

    if payload.action == "approved":
        user.role = "admin"

    db.commit()
    db.refresh(admin_request)
    return admin_request
