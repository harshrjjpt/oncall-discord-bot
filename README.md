# Discord On-Call Bot

A production-ready on-call Discord bot (slash commands) with skill matching and daily reminders.

## Features
- /alert "issue text" — notifies today's on-call; falls back to best-matched developer by skills
- /adddev, /listdevs, /set-oncall-days
- SQLite by default; optionally connect PostgreSQL via DATABASE_URL (Supabase)
- Daily scheduled on-call reminder (Asia/Kolkata timezone)
- Ready to deploy to Railway / Render (free tiers)

## Quick start (local)
1. Clone repo
2. Copy `.env.example` → `.env` and fill `BOT_TOKEN`, `CLIENT_ID`, `GUILD_ID`
3. Install:
   ```bash
   npm ci