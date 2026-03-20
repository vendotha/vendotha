from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
import uuid
from database import get_db
from auth import verify_admin_token
from typing import List

router = APIRouter()

class ExperienceItem(BaseModel):
    id: str = ""
    title: str
    company: str
    period: str
    location: str = ""
    description: str = ""
    tags: List[str] = []
    current: bool = False
    order: int = 0

@router.get("/experience")
async def get_experience(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("SELECT * FROM experience ORDER BY ord ASC")
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "company": r["company"],
            "period": r["period"],
            "location": r["location"],
            "description": r["description"],
            "tags": list(r["tags"]),
            "current": r["current"],
            "order": r["ord"],
        }
        for r in rows
    ]

@router.put("/experience")
async def update_experience(
    items: List[ExperienceItem],
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    async with db.transaction():
        await db.execute("DELETE FROM experience")
        for i, item in enumerate(items):
            exp_id = item.id if item.id and not item.id.startswith("new_") else str(uuid.uuid4())[:8]
            await db.execute("""
                INSERT INTO experience (id, title, company, period, location, description, tags, current, ord)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            """,
                exp_id, item.title, item.company, item.period,
                item.location, item.description, item.tags,
                item.current, i,
            )
    return {"ok": True}
