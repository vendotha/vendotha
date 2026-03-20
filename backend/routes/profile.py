from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
import asyncpg
import base64
from database import get_db
from auth import verify_admin_token
from typing import Optional

router = APIRouter()

def row_to_profile(row) -> dict:
    d = dict(row)
    # Convert dp bytes to base64 data URL for frontend
    if d.get("dp_data"):
        mime = d.get("dp_mime", "image/jpeg")
        b64 = base64.b64encode(bytes(d["dp_data"])).decode()
        d["dp_url"] = f"data:{mime};base64,{b64}"
    d.pop("dp_data", None)
    d.pop("dp_mime", None)
    # Don't expose resume bytes in profile endpoint
    d.pop("resume_data", None)
    d.pop("resume_mime", None)
    return d

@router.get("/profile")
async def get_profile(db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT * FROM profile ORDER BY id LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return row_to_profile(row)

@router.put("/profile")
async def update_profile(
    name: str = Form(...),
    tagline: str = Form(...),
    bio: str = Form(...),
    location: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    github: str = Form(...),
    linkedin: str = Form(...),
    gpa: str = Form(...),
    available: str = Form(...),
    dp_file: Optional[UploadFile] = File(None),
    resume_file: Optional[UploadFile] = File(None),
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    row = await db.fetchrow("SELECT id, dp_data, dp_mime, resume_data, resume_mime FROM profile ORDER BY id LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile_id = row["id"]
    dp_data = row["dp_data"]
    dp_mime = row["dp_mime"]
    resume_data = row["resume_data"]
    resume_mime = row["resume_mime"]

    if dp_file and dp_file.filename:
        dp_data = await dp_file.read()
        dp_mime = dp_file.content_type or "image/jpeg"

    if resume_file and resume_file.filename:
        resume_data = await resume_file.read()
        resume_mime = resume_file.content_type or "application/pdf"

    await db.execute("""
        UPDATE profile SET
            name=$1, tagline=$2, bio=$3, location=$4, email=$5,
            phone=$6, github=$7, linkedin=$8, gpa=$9, available=$10,
            dp_data=$11, dp_mime=$12, resume_data=$13, resume_mime=$14,
            updated_at=NOW()
        WHERE id=$15
    """,
        name, tagline, bio, location, email, phone, github, linkedin,
        gpa, available.lower() == "true",
        dp_data, dp_mime, resume_data, resume_mime,
        profile_id,
    )
    return {"ok": True}

@router.get("/resume")
async def get_resume(db: asyncpg.Connection = Depends(get_db)):
    """Download the resume as an attachment (triggers browser download)."""
    row = await db.fetchrow("SELECT resume_data, resume_mime FROM profile ORDER BY id LIMIT 1")
    if not row or not row["resume_data"]:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return Response(
        content=bytes(row["resume_data"]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Buvananand_Resume.pdf",
            "Access-Control-Allow-Origin": "*",
        },
    )

@router.get("/resume/view")
async def view_resume(db: asyncpg.Connection = Depends(get_db)):
    """Serve resume inline so browsers can display it (no auto-download)."""
    row = await db.fetchrow("SELECT resume_data, resume_mime FROM profile ORDER BY id LIMIT 1")
    if not row or not row["resume_data"]:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return Response(
        content=bytes(row["resume_data"]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline; filename=Buvananand_Resume.pdf",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
        },
    )