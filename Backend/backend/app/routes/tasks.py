from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task_schema import TaskCreate, TaskResponse, TaskUpdate
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskResponse], status_code=status.HTTP_200_OK)
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Task]:
    query = db.query(Task)
    if current_user.role != "admin":
        query = query.filter(Task.user_id == current_user.id)
    return query.order_by(Task.created_at.desc()).all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Task:
    assigned_user = db.query(User).filter(User.id == payload.user_id).first()
    if assigned_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )

    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        user_id=payload.user_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if payload.user_id is not None:
        assigned_user = db.query(User).filter(User.id == payload.user_id).first()
        if assigned_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found",
            )
        task.user_id = payload.user_id

    for field in ("title", "description", "status"):
        value = getattr(payload, field)
        if value is not None:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()
