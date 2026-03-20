import asyncpg
import os
from typing import AsyncGenerator
from dotenv import load_dotenv

# Force load .env from the same directory as this file
import pathlib
env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

_pool: asyncpg.Pool = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise RuntimeError(
                "\n\n❌ DATABASE_URL is not set!\n"
                "Make sure you have a .env file in the backend/ folder with:\n"
                "DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require\n"
            )
        print(f"🔌 Connecting to database... (host: {db_url.split('@')[-1].split('/')[0]})")
        _pool = await asyncpg.create_pool(dsn=db_url, min_size=1, max_size=5)
    return _pool


async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS profile (
                id          SERIAL PRIMARY KEY,
                name        TEXT NOT NULL DEFAULT 'Buvananand Vendotha',
                tagline     TEXT NOT NULL DEFAULT 'Backend Developer & AI/ML Builder',
                bio         TEXT NOT NULL DEFAULT '',
                location    TEXT NOT NULL DEFAULT 'Hyderabad, Telangana, India',
                email       TEXT NOT NULL DEFAULT 'vendotha@gmail.com',
                phone       TEXT NOT NULL DEFAULT '+91 9440401919',
                github      TEXT NOT NULL DEFAULT 'https://github.com/vendotha',
                linkedin    TEXT NOT NULL DEFAULT 'https://www.linkedin.com/in/vendotha',
                gpa         TEXT NOT NULL DEFAULT '8.33',
                resume_data BYTEA,
                resume_mime TEXT,
                dp_data     BYTEA,
                dp_mime     TEXT,
                available   BOOLEAN NOT NULL DEFAULT TRUE,
                updated_at  TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS skills (
                id       SERIAL PRIMARY KEY,
                category TEXT NOT NULL,
                items    TEXT[] NOT NULL DEFAULT '{}',
                ord      INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS experience (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                company     TEXT NOT NULL,
                period      TEXT NOT NULL,
                location    TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '',
                tags        TEXT[] NOT NULL DEFAULT '{}',
                current     BOOLEAN NOT NULL DEFAULT FALSE,
                ord         INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS posts (
                id          TEXT PRIMARY KEY,
                text        TEXT NOT NULL,
                date        TEXT NOT NULL,
                likes       INTEGER NOT NULL DEFAULT 0,
                comments    INTEGER NOT NULL DEFAULT 0,
                image_data  BYTEA,
                image_mime  TEXT,
                video_url   TEXT,
                link        TEXT,
                link_title  TEXT,
                created_at  TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Seed profile if empty
        count = await conn.fetchval("SELECT COUNT(*) FROM profile")
        if count == 0:
            await conn.execute("""
                INSERT INTO profile (name, tagline, bio, location, email, phone, github, linkedin, gpa, available)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            """,
                "Buvananand Vendotha",
                "Python Backend Developer & AI/ML Builder",
                "B.E. CSE '26 @ MVSR · Building intelligent backends with Python, Django & FastAPI. Passionate about AI/ML, computer vision, and solving real-world problems with code. Based in Hyderabad, India.",
                "Hyderabad, Telangana, India",
                "vendotha@gmail.com",
                "+91 9440401919",
                "https://github.com/vendotha",
                "https://www.linkedin.com/in/vendotha",
                "8.33",
                True,
            )

        # Seed skills if empty
        if await conn.fetchval("SELECT COUNT(*) FROM skills") == 0:
            default_skills = [
                (0, "Languages",         ["Python", "JavaScript", "TypeScript", "Java", "C++", "SQL"]),
                (1, "Frameworks",        ["Django", "FastAPI", "Flask", "React", "NestJS"]),
                (2, "AI & ML",           ["TensorFlow", "PyTorch", "OpenCV", "Computer Vision", "NLP", "Hugging Face", "LLMs", "Generative AI"]),
                (3, "Databases",         ["PostgreSQL", "MongoDB", "SQLite", "Redis"]),
                (4, "Tools & Platforms", ["Docker", "Git", "GitHub", "Linux", "Firebase", "Postman", "Figma", "VS Code"]),
            ]
            for ord_, cat, items in default_skills:
                await conn.execute(
                    "INSERT INTO skills (category, items, ord) VALUES ($1,$2,$3)",
                    cat, items, ord_
                )

        # Seed experience if empty
        if await conn.fetchval("SELECT COUNT(*) FROM experience") == 0:
            rows = [
                ("appseed", "Software Development Intern", "Appseed Technologies Pvt. Ltd.",
                 "Feb 2026 — Apr 2026", "Hyderabad, Telangana (On-site)",
                 "Working on backend systems and software development projects. Building and maintaining server-side applications as part of the core development team.",
                 ["NestJS", "TypeScript", "Backend"], True, 0),
                ("dyne", "Research Fellow", "Dyne Research ideaLab",
                 "Jan 2025 — Apr 2025", "Remote",
                 "Selected among 10,000+ applicants. Collaborated with mentors and researchers to enhance dataset quality, refine methodologies, and address ethical considerations in AI-generated media.",
                 ["Python", "PyTorch", "TensorFlow", "Hugging Face", "OpenCV", "GANs", "Diffusion Models"], False, 1),
                ("nsic", "Apprentice", "NSIC Technical Services Center",
                 "Jun 2022 — Nov 2022", "Hyderabad, Telangana",
                 "Implemented gesture recognition algorithms to map hand movements to system commands for seamless hands-free user experience.",
                 ["Python", "Django", "OpenCV", "MediaPipe", "JavaScript"], False, 2),
            ]
            for row in rows:
                await conn.execute("""
                    INSERT INTO experience (id, title, company, period, location, description, tags, current, ord)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                """, *row)

        # Seed posts if empty
        if await conn.fetchval("SELECT COUNT(*) FROM posts") == 0:
            default_posts = [
                ("p1", "📱 One day, my grandfather bought a smartphone… but he didn't know how to use Google Maps, WhatsApp, or make online payments. That inspired me to build Digital Literacy Companion — a Django-based platform designed for senior citizens to navigate the digital world confidently. ❤️ Tech for inclusion!", "2025-06-20", 47, 12, "https://github.com/vendotha", "Digital Literacy Companion"),
                ("p2", "🌟 Exciting News! Selected for Dyne Research ideaLab 🎉 Thrilled to be part of this elite cohort chosen from 10,000+ applicants to solve real-world problems over 12 weeks. 🚀 #DyneIdeaLab", "2025-01-30", 89, 21, None, None),
                ("p3", "🎉 Excited to share my experience at CODE-CRACK 2025 🚀 An offline coding competition with Aptitude + DSA rounds, organized by IEEE MVSR CS. Super grateful for the learning and the Certificate of Participation! 🏆", "2025-06-14", 34, 8, None, None),
            ]
            for p in default_posts:
                await conn.execute("""
                    INSERT INTO posts (id, text, date, likes, comments, link, link_title)
                    VALUES ($1,$2,$3,$4,$5,$6,$7)
                """, p[0], p[1], p[2], p[3], p[4], p[5], p[6])

    print("✅ Database initialised and seeded successfully")