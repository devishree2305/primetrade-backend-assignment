import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(DOTENV_PATH, override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"[database] dotenv path={DOTENV_PATH}")
print(f"[database] DATABASE_URL loaded={bool(DATABASE_URL)}")
if DATABASE_URL:
    safe_url = DATABASE_URL
    if "@" in safe_url and ":" in safe_url.split("@", 1)[0]:
        prefix, suffix = safe_url.split("@", 1)
        user_part = prefix.rsplit(":", 1)[0]
        safe_url = f"{user_part}:***@{suffix}"
    print(f"[database] DATABASE_URL={safe_url}")
else:
    raise RuntimeError("DATABASE_URL is not set. Check your .env file.")

engine_options = {}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
else:
    engine_options["pool_pre_ping"] = True
    engine_options["pool_recycle"] = 300

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    print("[database] opening session")
    db = SessionLocal()
    try:
        yield db
        print("[database] session yielded successfully")
    except Exception as exc:
        print(f"[database] session error: {type(exc).__name__}: {exc}")
        raise
    finally:
        db.close()
        print("[database] session closed")
