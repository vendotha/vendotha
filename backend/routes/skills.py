from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg
from database import get_db
from auth import verify_admin_token
from typing import List

router = APIRouter()

class SkillCategory(BaseModel):
    title: str
    skills: List[str]

class SkillsPayload(BaseModel):
    categories: List[SkillCategory]

@router.get("/skills")
async def get_skills(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("SELECT category, items FROM skills ORDER BY ord ASC")
    return [{"title": r["category"], "skills": list(r["items"])} for r in rows]

@router.put("/skills")
async def update_skills(
    payload: SkillsPayload,
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    async with db.transaction():
        await db.execute("DELETE FROM skills")
        for i, cat in enumerate(payload.categories):
            await db.execute(
                "INSERT INTO skills (category, items, ord) VALUES ($1, $2, $3)",
                cat.title, cat.skills, i
            )
    return {"ok": True}
