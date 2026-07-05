# Railway Deployment Guide for VYLUX

## Quick Deploy

### Option 1: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Option 2: Manual Deploy

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add PostgreSQL Plugin**
   ```bash
   railway add postgresql
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set OPENAI_API_KEY=sk-your-key
   railway variables set JWT_SECRET=your-secret-min-32-chars
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Get Deployment URL**
   ```bash
   railway status
   ```

---

## Architecture on Railway

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  VYLUX Service (This Repository)                    │ │
│  │  • Express API Server                               │ │
│  │  • Static Website (Astro)                           │ │
│  │  • Port: $PORT (default 3000)                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Plugin                                  │ │
│  │  • Managed Database                                 │ │
│  │  • Automatic Backups                                │ │
│  │  • $DATABASE_URL provided automatically             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                    External Services
                    • Supabase (Auth, Storage)
                    • OpenAI (AI Features)
                    • LobeHub (Agent Management)
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | `your-secret...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - |

---

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)

Railway provides a managed PostgreSQL plugin:

1. Go to your project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway automatically provides `DATABASE_URL`

### Option 2: External Supabase

If you prefer Supabase for auth and storage:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Set environment variables:
   ```bash
   railway variables set SUPABASE_URL=https://your-project.supabase.co
   railway variables set SUPABASE_ANON_KEY=your-anon-key
   ```

---

## Custom Domain

1. Go to your service settings
2. Click "Networking" → "Custom Domain"
3. Add your domain
4. Configure DNS records as shown

---

## Monitoring

### Health Check

```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-07-05T00:00:00.000Z",
  "services": {
    "api": "running",
    "database": "connected"
  }
}
```

### Logs

View logs in Railway dashboard or via CLI:
```bash
railway logs
```

---

## Troubleshooting

### Build Fails

Check that all dependencies are in `package.json`:
```bash
railway logs --build
```

### Database Connection Issues

Verify `DATABASE_URL` is set:
```bash
railway variables
```

### Port Issues

Railway sets `PORT` automatically. Don't hardcode it:
```typescript
const PORT = process.env.PORT || 3000;
```

---

## Cost Estimate

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | 500 hours/month | $0.000463/min |
| PostgreSQL | 1GB storage | $0.25/GB |
| OpenAI API | - | Pay per use |

---

## Support

- Railway Docs: https://docs.railway.app
- VYLUX Issues: https://github.com/uncdev26/VYLUX/issues
