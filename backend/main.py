import os
import secrets
from collections import defaultdict, deque
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional, Dict, Deque, Tuple

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    Request,
    Response,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

if not ADMIN_PASSWORD:
    # Force you to set a real admin password in env vars
    raise RuntimeError("ADMIN_PASSWORD environment variable is required")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SESSION_AGE = timedelta(days=7)
SESSION_COOKIE_NAME = "admin_session"

# Max 5 login attempts per 15 minutes per IP
LOGIN_WINDOW_SECONDS = 15 * 60
MAX_LOGIN_ATTEMPTS = 5

# Image upload constraints
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# -------------------------------------------------------------------
# App setup
# -------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# -------------------------------------------------------------------
# DB helpers
# -------------------------------------------------------------------


def get_conn() -> psycopg2.extensions.connection:
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


@contextmanager
def get_db() -> Tuple[psycopg2.extensions.connection, psycopg2.extensions.cursor]:
    conn = get_conn()
    cur = conn.cursor()
    try:
        yield conn, cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def init_db() -> None:
    with get_db() as (_, cur):
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS enquiries (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                message TEXT NOT NULL,
                source_page TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                description TEXT,
                image TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        )


init_db()

# -------------------------------------------------------------------
# Sessions + rate limiting
# -------------------------------------------------------------------

admin_sessions: Dict[str, datetime] = {}
login_attempts: Dict[str, Deque[datetime]] = defaultdict(deque)


def get_session_token(request: Request) -> Optional[str]:
    return request.cookies.get(SESSION_COOKIE_NAME)


def require_admin(request: Request) -> None:
    token = get_session_token(request)
    if not token or token not in admin_sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if datetime.utcnow() - admin_sessions[token] > SESSION_AGE:
        admin_sessions.pop(token, None)
        raise HTTPException(status_code=401, detail="Session expired")


def check_login_rate_limit(client_ip: str) -> None:
    now = datetime.utcnow()
    attempts = login_attempts[client_ip]

    # Drop old attempts
    while attempts and (now - attempts[0]).total_seconds() > LOGIN_WINDOW_SECONDS:
        attempts.popleft()

    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later.",
        )

    attempts.append(now)


# -------------------------------------------------------------------
# Security headers middleware
# -------------------------------------------------------------------


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # Basic hardening headers
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault(
        "Referrer-Policy", "strict-origin-when-cross-origin"
    )
    # Modern browsers ignore this but we keep it explicit
    response.headers.setdefault("X-XSS-Protection", "0")
    return response


# -------------------------------------------------------------------
# Models & validation helpers
# -------------------------------------------------------------------


class EnquiryIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    sourcePage: Optional[str] = None


class AdminLogin(BaseModel):
    password: str


def _clean_text(value: Optional[str], max_len: int) -> str:
    v = (value or "").strip()
    if not v:
        return v
    if len(v) > max_len:
        raise HTTPException(
            status_code=400,
            detail=f"Field too long (max {max_len} characters).",
        )
    return v


def validate_product_fields(name: str, price: int, description: str) -> Tuple[str, int, str]:
    clean_name = _clean_text(name, max_len=200)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Product name is required.")

    try:
        price_int = int(price)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Price must be an integer.")

    if price_int <= 0 or price_int > 1_000_000:
        raise HTTPException(
            status_code=400,
            detail="Price must be between 1 and 1,000,000.",
        )

    clean_desc = _clean_text(description, max_len=2_000)
    return clean_name, price_int, clean_desc


def secure_filename(filename: str) -> str:
    """
    Very small sanitiser to avoid path traversal and weird characters.
    """
    base = os.path.basename(filename or "image")
    safe = "".join(c for c in base if c.isalnum() or c in {"_", "-", "."})
    return safe or "image"


def save_upload_image(upload: UploadFile) -> str:
    if not upload.filename:
        raise HTTPException(status_code=400, detail="Image file is required.")

    if upload.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Allowed: JPEG, PNG, WebP.",
        )

    timestamp = int(datetime.utcnow().timestamp())
    safe_name = f"{timestamp}_{secure_filename(upload.filename)}"
    filepath = os.path.join(UPLOAD_DIR, safe_name)

    size = 0
    with open(filepath, "wb") as f:
        for chunk in iter(lambda: upload.file.read(1024 * 1024), b""):
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_IMAGE_SIZE_BYTES:
                try:
                    f.close()
                    os.remove(filepath)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=400,
                    detail="Image too large. Max size is 5 MB.",
                )
            f.write(chunk)

    return f"/uploads/{safe_name}"


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/admin/login")
def admin_login(request: Request, data: AdminLogin, response: Response):
    client_ip = request.client.host if request.client else "unknown"
    check_login_rate_limit(client_ip)

    if not data.password or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Wrong password")

    token = secrets.token_hex(32)
    admin_sessions[token] = datetime.utcnow()

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=int(SESSION_AGE.total_seconds()),
    )
    return {"success": True}


@app.post("/api/admin/logout")
def admin_logout(request: Request, response: Response):
    token = get_session_token(request)
    if token and token in admin_sessions:
        admin_sessions.pop(token, None)

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {"success": True}


@app.post("/api/enquiry")
def create_enquiry(data: EnquiryIn):
    name = _clean_text(data.name, max_len=200)
    message = _clean_text(data.message, max_len=2_000)
    phone = _clean_text(data.phone, max_len=50)
    source_page = _clean_text(data.sourcePage, max_len=200)

    if not name or not data.email or not message:
        raise HTTPException(
            status_code=400,
            detail="Name, valid email and message are required.",
        )

    with get_db() as (_, cur):
        cur.execute(
            """
            INSERT INTO enquiries (name, email, phone, message, source_page)
            VALUES (%s, %s, %s, %s, %s);
            """,
            (name, str(data.email), phone, message, source_page),
        )

    return {"success": True, "message": "Enquiry submitted successfully."}


@app.get("/api/admin/enquiries")
def list_enquiries(request: Request):
    require_admin(request)

    with get_db() as (_, cur):
        cur.execute(
            """
            SELECT id, name, email, phone, message, source_page, created_at
            FROM enquiries
            ORDER BY created_at DESC;
            """
        )
        rows = cur.fetchall()

    return rows


@app.get("/api/products")
def list_products():
    with get_db() as (_, cur):
        cur.execute(
            """
            SELECT id, name, price, description, image, created_at
            FROM products
            ORDER BY created_at DESC;
            """
        )
        rows = cur.fetchall()
    return rows


@app.post("/api/admin/products")
def create_product(
    request: Request,
    name: str = Form(...),
    price: int = Form(...),
    description: str = Form(""),
    image: UploadFile = File(...),
):
    require_admin(request)

    clean_name, price_int, clean_desc = validate_product_fields(
        name, price, description
    )
    img_path = save_upload_image(image)

    with get_db() as (_, cur):
        cur.execute(
            """
            INSERT INTO products (name, price, description, image)
            VALUES (%s, %s, %s, %s);
            """,
            (clean_name, price_int, clean_desc, img_path),
        )

    return {"success": True}


@app.put("/api/admin/products/{product_id}")
def update_product(
    product_id: int,
    request: Request,
    name: str = Form(...),
    price: int = Form(...),
    description: str = Form(""),
    image: UploadFile = File(None),
):
    require_admin(request)

    clean_name, price_int, clean_desc = validate_product_fields(
        name, price, description
    )

    with get_db() as (_, cur):
        if image is not None:
            img_path = save_upload_image(image)
            cur.execute(
                """
                UPDATE products
                SET name=%s, price=%s, description=%s, image=%s
                WHERE id=%s;
                """,
                (clean_name, price_int, clean_desc, img_path, product_id),
            )
        else:
            cur.execute(
                """
                UPDATE products
                SET name=%s, price=%s, description=%s
                WHERE id=%s;
                """,
                (clean_name, price_int, clean_desc, product_id),
            )

    return {"success": True}


@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, request: Request):
    require_admin(request)

    with get_db() as (_, cur):
        cur.execute("DELETE FROM products WHERE id=%s;", (product_id,))

    return {"success": True}
