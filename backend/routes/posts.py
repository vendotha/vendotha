from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
import asyncpg
import base64
import uuid
from database import get_db
from auth import verify_admin_token
from typing import Optional

router = APIRouter()

def row_to_post(row) -> dict:
    d = dict(row)
    if d.get("image_data"):
        mime = d.get("image_mime", "image/jpeg")
        b64 = base64.b64encode(bytes(d["image_data"])).decode()
        d["image_url"] = f"data:{mime};base64,{b64}"
    else:
        d["image_url"] = None
    d.pop("image_data", None)
    d.pop("image_mime", None)
    d.pop("created_at", None)
    return d

@router.get("/posts")
async def get_posts(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("SELECT * FROM posts ORDER BY date DESC, created_at DESC")
    return [row_to_post(r) for r in rows]

@router.post("/posts")
async def create_post(
    text: str = Form(...),
    date: str = Form(...),
    likes: int = Form(0),
    comments: int = Form(0),
    video_url: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    link_title: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    post_id = str(uuid.uuid4())[:8]
    image_data = None
    image_mime = None

    if image_file and image_file.filename:
        image_data = await image_file.read()
        image_mime = image_file.content_type or "image/jpeg"

    await db.execute("""
        INSERT INTO posts (id, text, date, likes, comments, image_data, image_mime, video_url, link, link_title)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    """, post_id, text, date, likes, comments, image_data, image_mime,
        video_url or None, link or None, link_title or None)

    return {"ok": True, "id": post_id}

@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    text: str = Form(...),
    date: str = Form(...),
    likes: int = Form(0),
    comments: int = Form(0),
    video_url: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    link_title: Optional[str] = Form(None),
    remove_image: str = Form("false"),
    image_file: Optional[UploadFile] = File(None),
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    existing = await db.fetchrow("SELECT image_data, image_mime FROM posts WHERE id=$1", post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")

    image_data = existing["image_data"]
    image_mime = existing["image_mime"]

    if remove_image.lower() == "true":
        image_data = None
        image_mime = None
    elif image_file and image_file.filename:
        image_data = await image_file.read()
        image_mime = image_file.content_type or "image/jpeg"

    await db.execute("""
        UPDATE posts SET
            text=$1, date=$2, likes=$3, comments=$4,
            image_data=$5, image_mime=$6, video_url=$7,
            link=$8, link_title=$9
        WHERE id=$10
    """, text, date, likes, comments, image_data, image_mime,
        video_url or None, link or None, link_title or None, post_id)

    return {"ok": True}

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    result = await db.execute("DELETE FROM posts WHERE id=$1", post_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}
