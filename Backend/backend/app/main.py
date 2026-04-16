import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routes import admin, auth, tasks

# Import all models so SQLAlchemy knows them during startup table checks.
from app.models import admin_request, task, user


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] application starting")
    print(f"[startup] engine url={engine.url.render_as_string(hide_password=True)}")
    try:
        print("[startup] running Base.metadata.create_all")
        Base.metadata.create_all(bind=engine)
        print("[startup] create_all completed")
    except Exception as exc:
        print(f"[startup] create_all failed: {type(exc).__name__}: {exc}")
        traceback.print_exc()
        raise

    yield
    print("[shutdown] application stopping")


app = FastAPI(
    title="PrimetradeAI Backend API",
    version="1.0.0",
    description="REST API for authentication, admin requests, and task management.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def debug_requests(request: Request, call_next):
    print(f"[request] {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"[response] {request.method} {request.url.path} -> {response.status_code}")
        return response
    except Exception as exc:
        print(f"[response] {request.method} {request.url.path} -> exception {type(exc).__name__}: {exc}")
        traceback.print_exc()
        raise


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print(f"[exception] {request.method} {request.url.path}: {type(exc).__name__}: {exc}")
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "error_type": type(exc).__name__})


app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def health_check():
    print("[health] root endpoint called")
    return {"message": "PrimetradeAI backend is running"}
