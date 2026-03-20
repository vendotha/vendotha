from dotenv import load_dotenv
import pathlib
load_dotenv(dotenv_path=pathlib.Path(__file__).parent / ".env", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
from contextlib import asynccontextmanager
from database import init_db
from routes import profile, skills, experience, posts


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Buvananand Portfolio API", lifespan=lifespan)

# Build origins list — filter out empty strings so CORS doesn't break in dev
_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
]
_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if _frontend_url:
    _origins.append(_frontend_url)

print(f"✅ CORS allowed origins: {_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(profile.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(experience.router, prefix="/api")
app.include_router(posts.router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Buvananand Portfolio API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}