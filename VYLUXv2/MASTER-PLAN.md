# VYLUX v2 — Master Plan

## The One-Line Vision
**LobeHub IS the CMS.** Fork it, configure MiMo as the model, add agents and skills that connect to the CMS schema via MCP. Done.

---

## What Went Wrong in v1

We built a standalone Express REST API as the main product and treated LobeHub as an afterthought. That's backwards. LobeHub already has:
- Agent builder with memory, skills, resources
- Model gateway (any OpenAI-compatible API)
- IM gateway (Telegram, Slack, Discord, WhatsApp)
- MCP/Skill marketplace (10,000+ tools)
- Chat-based UI (the "ChatGPT-like console" you asked for)
- Artifact rendering (HTML, images, code)
- Per-agent memory and knowledge base

**v2 approach:** LobeHub fork = the product. Single ParadeDB with `cms` schema = the database. MCP tools = the bridge.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                 VYLUX (LobeHub Fork)                  │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Agents     │  │   Skills     │  │   MCP Tools  │ │
│  │             │  │              │  │   (Drizzle)  │ │
│  │ • Content   │─▶│ • blog-write │─▶│ • cms posts  │ │
│  │ • Design    │  │ • seo-optim  │  │ • cms pages  │ │
│  │ • SEO       │  │ • page-gen   │  │ • cms media  │ │
│  │ • Forms     │  │ • form-build │  │ • cms seo    │ │
│  │ • Analytics │  │ • funnel     │  │ • web-search │ │
│  │ • Funnel    │  │ • research   │  │ • email      │ │
│  └─────────────┘  └──────────────┘  └──────┬──────┘ │
│                                            │         │
│  ┌─────────────────────────────────────────┘         │
│  │         ParadeDB (Single PostgreSQL 17)           │
│  │                                                   │
│  │  Schema: public → LobeHub (users, agents, msgs)  │
│  │  Schema: cms    → CMS (posts, pages, forms, etc.)│
│  │                                                   │
│  │  pgvector + pg_search (shared extensions)         │
│  └───────────────────────────────────────────────────┘
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Model Gateway (MiMo)                │ │
│  │  endpoint: https://token-plan-sgp.xiaomimimo.com │ │
│  │  model: mimo-v2.5-pro                           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │           IM Gateway (Telegram Bot)              │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│          Astro + Svelte (Public Website)               │
│                                                       │
│  Static site generated from CMS content via tRPC      │
│  Svelte 5 islands for interactive components          │
│  WebMCP for AI agent discovery                        │
└──────────────────────────────────────────────────────┘
```

---

## The Fork Strategy

**Fork:** `https://github.com/uncdev26/VYLUX` (LobeHub fork)

**What we change in the fork:**
1. Branding (logo, colors, name → VYLUX)
2. Default model config → MiMo
3. Pre-installed agents (Content, Design, SEO, Forms, Analytics, Funnel)
4. Pre-installed skills (blog-write, seo-optimize, page-generate, form-build, etc.)
5. MCP server config → CMS tools (direct Drizzle queries)
6. Docker Compose → single ParadeDB + MinIO + Redis
7. CMS schema added to ParadeDB (`cms.*` tables)

**What we DON'T change:**
- Core LobeHub code (agent runtime, chat UI, IM gateway, model gateway)
- Plugin system
- Update path (we can pull upstream changes)

---

## Implementation Phases

### Phase 0: Fork & Configure (Day 1)
> Get LobeHub running with MiMo, with CMS schema in ParadeDB.

- [ ] Fork LobeHub to `uncdev26/VYLUX`
- [ ] Configure MiMo as default model provider
- [ ] Create Docker Compose (LobeHub + ParadeDB + MinIO + Redis)
- [ ] Run CMS migration (`001_cms_schema.sql`) against ParadeDB
- [ ] Verify: chat with MiMo works, `cms.*` tables exist

### Phase 1: MCP Bridge (Week 1)
> Build MCP tools that query CMS tables via Drizzle ORM.

- [ ] Create `@vylux/mcp-cms` MCP server (direct Drizzle queries, no PostgREST)
  - `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`, `publish_post`
  - `list_pages`, `get_page`, `create_page`, `update_page`, `delete_page`
  - `list_design_tokens`, `get_design_token`, `update_design_token`
  - `list_media`, `upload_media`, `delete_media`, `list_media_folders`
  - `list_forms`, `get_form`, `create_form`, `update_form`, `list_submissions`
  - `get_seo_config`, `update_seo_config`, `list_redirects`, `create_redirect`, `generate_sitemap`
  - `get_header_config`, `update_header_config`, `list_menu_items`, `update_menu_item`
- [ ] Register MCP server in LobeHub config
- [ ] Verify: agent can CRUD posts via chat

### Phase 2: Core Agents (Week 2-3)
> Define the agents that handle all CMS operations.

**Agents to create:**

| Agent | Purpose | Skills | MCP Tools |
|-------|---------|--------|-----------|
| Content Agent | Blog posts, pages, categories | blog-write, page-generate, content-optimize | CMS CRUD |
| Design Agent | Design tokens, themes, components | token-manage, theme-apply, component-create | CMS design CRUD |
| SEO Agent | Meta tags, sitemaps, keywords, redirects | seo-audit, keyword-research, sitemap-gen | CMS SEO CRUD |
| Forms Agent | Form builder, submissions, analytics | form-build, form-analyze | CMS forms CRUD |
| Media Agent | Upload, organize, optimize images | media-upload, image-optimize, alt-text-gen | CMS media CRUD |
| Analytics Agent | Traffic, conversions, reports | analytics-report, anomaly-detect | CMS analytics CRUD |
| Funnel Agent | Sales funnels, landing pages, CTAs | funnel-build, conversion-optimize | CMS funnel CRUD |

**Each agent gets:**
- System prompt with brand guidelines
- Skill references
- MCP tool access
- Project-scoped memory

### Phase 3: Skills Library (Week 3-4)
> The actual AI capabilities — what makes this different from a regular CMS.

**Skills to create:**

| Skill | What It Does |
|-------|-------------|
| `blog-write` | Research topic → generate SEO-optimized post → suggest images → preview |
| `page-generate` | Create complete HTML page from description, following brand rules |
| `seo-audit` | Analyze content for SEO issues, suggest fixes |
| `keyword-research` | Search for keywords, analyze difficulty, suggest content strategy |
| `form-build` | Generate forms from business goals, add conditional logic |
| `funnel-build` | Create sales funnel with landing page → form → thank you → email sequence |
| `content-research` | Web search → summarize → cite → create content brief |
| `image-generate` | Generate images via AI for blog posts and pages |
| `social-post` | Adapt content for X, LinkedIn, Instagram, Facebook |
| `email-campaign` | Create email sequences from content |

### Phase 4: Public Website (Week 4-5)
> The Astro + Svelte site that renders content from the CMS DB.

- [ ] Astro site reads from CMS DB via tRPC (posts, pages, design tokens)
- [ ] Svelte 5 islands for interactive components (forms, funnels, chat widget)
- [ ] Design system tokens applied from CMS DB
- [ ] WebMCP for AI agent discovery
- [ ] SEO: auto-generated sitemaps, meta tags, Schema.org markup
- [ ] Deploy: Astro static build served by LobeHub or separate

### Phase 5: IM Gateway (Week 5-6)
> Control the entire CMS from Telegram.

- [ ] Configure Telegram bot in LobeHub
- [ ] Test: create blog post via Telegram message
- [ ] Test: check analytics via Telegram
- [ ] Test: manage forms via Telegram
- [ ] Add Slack and Discord channels

### Phase 6: Marketing Features (Week 6-10)
> The features that make this a real marketing platform.

- [ ] Sales funnels (landing page → form → thank you → email)
- [ ] Email automation (drip sequences, broadcasts)
- [ ] Analytics dashboard (GA4, TikTok, Meta Pixel)
- [ ] A/B testing (page variants, CTAs)
- [ ] Lead scoring and CRM
- [ ] Popups and modals
- [ ] Content calendar
- [ ] Social media auto-posting

---

## File Structure (Fork)

```
VYLUX/                          # LobeHub fork
├── src/                        # LobeHub core (DON'T MODIFY)
├── docker-compose.yml          # OUR compose: LobeHub + ParadeDB + MinIO + Redis
├── .env.example                # OUR env template
├── packages/
│   ├── database/               # Drizzle schema + connection
│   │   ├── src/
│   │   │   ├── index.ts        # DB connection (shared pool)
│   │   │   └── schemas/
│   │   │       └── cms/        # CMS tables (pgSchema('cms'))
│   │   │           ├── index.ts
│   │   │           ├── content.ts
│   │   │           ├── design.ts
│   │   │           ├── media.ts
│   │   │           ├── seo.ts
│   │   │           ├── forms.ts
│   │   │           ├── branding.ts
│   │   │           ├── navigation.ts
│   │   │           └── audit.ts
│   │   ├── migrations/
│   │   │   └── 001_cms_schema.sql
│   │   └── package.json
│   └── mcp-cms/                # MCP server (Drizzle → ParadeDB)
│       ├── src/
│       │   ├── index.ts        # MCP server entry
│       │   └── tools/          # Tool implementations
│       │       ├── content.ts
│       │       ├── design.ts
│       │       ├── media.ts
│       │       ├── seo.ts
│       │       ├── forms.ts
│       │       └── navigation.ts
│       └── package.json
├── agents/                     # OUR pre-installed agents
│   ├── content-agent.json
│   ├── design-agent.json
│   ├── seo-agent.json
│   ├── forms-agent.json
│   ├── media-agent.json
│   ├── analytics-agent.json
│   └── funnel-agent.json
├── skills/                     # OUR pre-installed skills
│   ├── blog-write.md
│   ├── page-generate.md
│   ├── seo-audit.md
│   ├── form-build.md
│   ├── funnel-build.md
│   ├── content-research.md
│   └── ...
└── resources/                  # OUR knowledge base
    ├── brand-guidelines.md
    ├── seo-guidelines.md
    └── content-style-guide.md
```

---

## Docker Compose (Target)

```yaml
services:
  # LobeHub (VYLUX fork)
  vylux:
    build: .
    ports: ["3210:3210"]
    environment:
      - DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@vylux-db:5432/lobehub
      - REDIS_URL=redis://vylux-redis:6379
    depends_on: [vylux-db, vylux-redis]

  # ParadeDB (single PostgreSQL 17 — LobeHub + CMS)
  vylux-db:
    image: paradedb/paradedb:latest-pg17
    command: ["postgres", "-c", "shared_preload_libraries=pg_search,pg_cron"]

  # Redis
  vylux-redis:
    image: redis:7-alpine

  # MinIO (shared: LobeHub files + CMS media)
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
```

---

## Key Decisions

1. **MiMo as default model** — Not GPT-4, not Claude. Your token plan, your model.
2. **Single database** — One ParadeDB instance with `cms` schema. No Supabase, no PostgREST.
3. **MCP as the bridge** — Agents talk to CMS via MCP tools with direct Drizzle queries.
4. **Fork, don't build from scratch** — LobeHub has 79k stars and 11k commits. Don't reinvent it.
5. **Skills are the product** — The agents and skills are what make this different from a regular CMS.
6. **Telegram-first** — The primary interface is chat. The website is the output.

---

## What Success Looks Like

After Phase 3, a user can:
1. Open Telegram → message the VYLUX bot
2. Say "Write a blog post about AI marketing for small businesses"
3. The Content Agent researches, writes, optimizes for SEO, suggests images
4. User approves → post is saved to CMS DB → published to Astro site
5. Sitemap auto-updates → Google indexes it
6. Social media auto-posts to connected platforms

That's the product. Everything else is incremental.

---

## Environment Variables

```bash
# Database (single ParadeDB instance)
DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@vylux-db:5432/lobehub
PG_PASSWORD=<generated>

# LobeHub
REDIS_URL=redis://vylux-redis:6379
KEY_VAULTS_SECRET=<generated>
AUTH_SECRET=<generated>

# Storage (MinIO)
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=admin
S3_SECRET_ACCESS_KEY=<generated>
S3_BUCKET=vylux

# Telegram (optional)
# TELEGRAM_BOT_TOKEN=<your-bot-token>
```

> **MiMo model** is configured in LobeHub UI (Settings → Model Provider), not via env vars.

---

## Rules (from v1 lessons)

1. Never commit API keys or secrets to git
2. All functions under 50 lines
3. All exception handlers log errors before returning
4. NO templates for page generation — AI generates complete HTML with branding only
5. AI-first for everything — human provides direction, AI executes
6. Token plan only has MiMo models — don't claim others are available
7. LobeHub is the product — never remove it or treat it as optional
8. Single ParadeDB instance — CMS tables in `cms` schema, LobeHub in `public`
9. MCP tools are the bridge — agents query via Drizzle, not direct SQL
10. Skills are markdown — easy to write, easy to update, no code required
