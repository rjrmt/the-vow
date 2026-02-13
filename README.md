# The Vow

Mobile-first shared mindfulness and commitment app. Create sessions, complete modules (Dopamine Deck, Pulse Sync, Memory Loom, Affirmation Orbit, Co-Op Canvas), and generate a shareable Vow Card.

## Tech Stack

- Next.js 15 App Router, TypeScript, Tailwind v4, Framer Motion
- Prisma (SQLite dev / PostgreSQL production)
- WebSocket for realtime sync
- html-to-image for PNG export

## Local Development

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | SQLite: `file:./prisma/dev.db` or PostgreSQL connection string |

## Deploy to Production

**Important:** This app uses a custom Node server with WebSocket. **Vercel does not support custom servers**—use **Railway** or **Render** for full functionality.

### Railway (recommended)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add **PostgreSQL** plugin (or use external DB)
4. Set `DATABASE_URL` in Variables
5. Deploy

### Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect repo, use `render.yaml` settings
4. Add PostgreSQL database, set `DATABASE_URL`
5. Deploy

### Database Setup (Production)

Use **Neon**, **Railway Postgres**, or **Vercel Postgres**. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
}
```

Then:

```bash
npx prisma migrate deploy
```

## Project Structure

See [STRUCTURE.md](./STRUCTURE.md).
