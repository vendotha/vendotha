from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional
import asyncpg

from database import get_db, to_jsonb_value
from auth import verify_admin_token

router = APIRouter()


class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    period: str = ""
    gpa: str = ""
    location: str = ""


class NavItem(BaseModel):
    label: str = ""
    href: str = "#"


class SiteSettingsPayload(BaseModel):
    theme: Literal["light", "dark"] = "dark"
    language: Literal["en", "hi", "te"] = "en"
    translation_enabled: bool = True
    about_title: str = "About Me"
    about_intro: str = ""
    about_story: str = ""
    about_quote: str = "Build things that matter. Ship fast. Learn faster."
    experience_heading: str = "Experience"
    experience_subheading: str = "Work, research, and academic background"
    education_heading: str = "Education"
    achievements_heading: str = "Achievements"
    contact_heading: str = "Get in Touch"
    contact_subheading: str = "Open to new opportunities, collaborations, and interesting conversations."
    education: List[EducationItem] = []
    achievements: List[str] = []
    hero_roles: List[str] = []
    nav_items: List[NavItem] = []


@router.get("/site-settings")
async def get_site_settings(db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT * FROM site_settings ORDER BY id LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Site settings not found")
    return {
        "theme": row["theme"],
        "language": row["language"],
        "translation_enabled": row["translation_enabled"],
        "about_title": row["about_title"],
        "about_intro": row["about_intro"],
        "about_story": row["about_story"],
        "about_quote": row["about_quote"],
        "experience_heading": row["experience_heading"],
        "experience_subheading": row["experience_subheading"],
        "education_heading": row["education_heading"],
        "achievements_heading": row["achievements_heading"],
        "contact_heading": row["contact_heading"],
        "contact_subheading": row["contact_subheading"],
        "education": list(row["education"] or []),
        "achievements": list(row["achievements"] or []),
        "hero_roles": list(row["hero_roles"] or []),
        "nav_items": list(row["nav_items"] or []),
    }


@router.put("/site-settings")
async def update_site_settings(
    payload: SiteSettingsPayload,
    db: asyncpg.Connection = Depends(get_db),
    admin: str = Depends(verify_admin_token),
):
    row = await db.fetchrow("SELECT id FROM site_settings ORDER BY id LIMIT 1")

    if row:
        await db.execute(
            """
            UPDATE site_settings SET
                theme=$1,
                language=$2,
                translation_enabled=$3,
                about_title=$4,
                about_intro=$5,
                about_story=$6,
                about_quote=$7,
                experience_heading=$8,
                experience_subheading=$9,
                education_heading=$10,
                achievements_heading=$11,
                contact_heading=$12,
                contact_subheading=$13,
                education=$14,
                achievements=$15,
                hero_roles=$16,
                nav_items=$17,
                updated_at=NOW()
            WHERE id=$18
            """,
            payload.theme,
            payload.language,
            payload.translation_enabled,
            payload.about_title,
            payload.about_intro,
            payload.about_story,
            payload.about_quote,
            payload.experience_heading,
            payload.experience_subheading,
            payload.education_heading,
            payload.achievements_heading,
            payload.contact_heading,
            payload.contact_subheading,
            to_jsonb_value([item.dict() for item in payload.education]),
            to_jsonb_value(payload.achievements),
            to_jsonb_value(payload.hero_roles),
            to_jsonb_value([item.dict() for item in payload.nav_items]),
            row["id"],
        )
    else:
        await db.execute(
            """
            INSERT INTO site_settings (
                theme, language, translation_enabled,
                about_title, about_intro, about_story, about_quote,
                experience_heading, experience_subheading,
                education_heading, achievements_heading,
                contact_heading, contact_subheading,
                education, achievements, hero_roles, nav_items
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            """,
            payload.theme,
            payload.language,
            payload.translation_enabled,
            payload.about_title,
            payload.about_intro,
            payload.about_story,
            payload.about_quote,
            payload.experience_heading,
            payload.experience_subheading,
            payload.education_heading,
            payload.achievements_heading,
            payload.contact_heading,
            payload.contact_subheading,
            to_jsonb_value([item.dict() for item in payload.education]),
            to_jsonb_value(payload.achievements),
            to_jsonb_value(payload.hero_roles),
            to_jsonb_value([item.dict() for item in payload.nav_items]),
        )

    return {"ok": True}
