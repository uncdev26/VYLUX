<div align="center">

# 🚀 VYLUX

### AI-Native Marketing Platform

**The next-generation marketing platform that replaces WordPress + HubSpot + Shopify with a unified AI-powered system.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](docker-compose.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](tsconfig.json)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](supabase/)
[![LobeHub](https://img.shields.io/badge/LobeHub-Agents-purple.svg)](https://lobehub.com)
[![Astro](https://img.shields.io/badge/Astro-4.0-FF5D01.svg)](https://astro.build)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?templateUrl=https://github.com/uncdev26/VYLUX)

[Documentation](docs/) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Features](#-features) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

VYLUX is an **AI-native marketing platform** built for digital marketing agencies and small businesses. It combines content management, sales funnels, forms, analytics, SEO optimization, and client communication into a single, AI-powered system.

### Why VYLUX?

| Traditional Stack | VYLUX |
|-------------------|-------|
| WordPress + WooCommerce + Yoast + Mailchimp + HubSpot | **Single unified platform** |
| 10-20 different dashboards | **One chat-based interface** |
| Manual SEO optimization | **AI-powered SEO automation** |
| Fragmented workflows | **Seamless agent orchestration** |
| High maintenance costs | **Docker-based deployment** |

### Key Differentiators

- **🤖 AI-First Architecture** — Every feature is powered by AI agents, not bolted-on plugins
- **💬 Chat-Based Interface** — Manage everything through natural language prompts (via LobeHub)
- **🌐 WebMCP Integration** — Make your site discoverable by AI agents (Chrome's upcoming standard)
- **🎨 Design System Intelligence** — Agents automatically follow your brand guidelines
- **📊 Modular Architecture** — Enable/disable features as needed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOBEHUB (Agent Layer)                  │
│  • Chat-based interface (primary UI)                     │
│  • Agent Builder + Groups                                │
│  • IM Gateway (Telegram/Slack/Discord)                   │
│  • Skills/MCP Marketplace (10,000+ tools)                │
│  • Resource Library + Memory                             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (Data Layer)                        │
│  • PostgreSQL (20+ tables with RLS)                      │
│  • Auth (email/password, OAuth, magic link)              │
│  • Storage (media, documents)                            │
│  • Realtime (live updates)                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           ASTRO + SVELTE (Presentation Layer)             │
│  • Astro (static pages, SEO optimization)                │
│  • Svelte 5 islands (interactive components)             │
│  • WebMCP tools (AI agent discovery)                     │
│  • Design system tokens (from Supabase)                  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Phase 1: Foundation & Core AI (Months 1-3)

- [x] **Project Setup** — Monorepo with Turborepo, Docker Compose
- [x] **Database Schema** — 20+ tables with RLS, triggers, indexes
- [ ] **Design System** — Tokens, components, themes
- [ ] **Content Management** — Posts, pages, categories
- [ ] **Media Manager** — Upload, organize, optimize
- [ ] **SEO Foundation** — Sitemaps, keywords, meta tags
- [ ] **Forms** — AI-generated forms with conditional logic
- [ ] **WebMCP Integration** — AI agent discovery

### Phase 2: Conversion & Data (Months 4-6)

- [ ] **Analytics Dashboard** — GA4, TikTok, Meta Pixel, Clarity
- [ ] **A/B Testing** — Page variants, CTA testing
- [ ] **Popups & Modals** — Exit intent, scroll triggers
- [ ] **Lead Scoring** — Behavior-based scoring
- [ ] **CRM** — Contacts, deals, pipeline
- [ ] **Email Automation** — Campaigns, sequences, templates
- [ ] **Backlinks Manager** — Internal/external link tracking
- [ ] **Reputation Manager** — Review monitoring, responses

### Phase 3: Ecosystem (Months 7-9)

- [ ] **E-commerce** — Products, cart, inventory
- [ ] **Payments** — Stripe, Razorpay, PayPal
- [ ] **Booking** — Appointments, calendar, reminders
- [ ] **Membership** — Subscriptions, gated content
- [ ] **Events** — Registration, tickets, check-in
- [ ] **LMS** — Courses, lessons, progress tracking
- [ ] **Social Media** — Auto-posting via MCP
- [ ] **Workflow Automation** — Multi-step triggers

### Phase 4: Advanced & Integrations (Months 10-12)

- [ ] **Live Chat** — Real-time visitor support
- [ ] **Knowledge Base** — Help center with search
- [ ] **Affiliate Program** — Partner tracking, commissions
- [ ] **Referral System** — Referral links, rewards
- [ ] **Local SEO** — Google Business Profile sync
- [ ] **Competitor Analysis** — Keyword/backlink tracking
- [ ] **Domain Manager** — Multi-domain, SSL
- [ ] **Backup & Restore** — Automated backups
- [ ] **Migration Tools** — WordPress import

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/uncdev26/VYLUX.git
cd VYLUX

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Install dependencies
npm install

# Start with Docker
docker compose up -d

# Or start development servers
npm run dev
```

### Environment Variables

```env
# Supabase
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key

# LobeHub
OPENAI_API_KEY=your-openai-key

# Website
PUBLIC_SUPABASE_URL=http://localhost:8000
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📁 Project Structure

```
VYLUX/
├── apps/
│   ├── web/                    # Astro + Svelte public site
│   │   ├── src/
│   │   │   ├── components/     # Svelte components
│   │   │   ├── layouts/        # Astro layouts
│   │   │   ├── pages/          # Astro pages
│   │   │   └── styles/         # Global styles
│   │   ├── astro.config.mjs
│   │   └── Dockerfile
│   ├── admin/                  # Admin dashboard (future)
│   └── api/                    # API routes
│       └── src/
│           ├── routes/         # Express routes
│           ├── services/       # Business logic
│           └── middleware/      # Auth, rate limiting
├── packages/
│   ├── shared/                 # Shared types, utils
│   ├── design-system/          # Svelte component library
│   └── database/               # Supabase migrations
│       ├── migrations/         # SQL migrations
│       └── seeds/              # Seed data
├── supabase/
│   └── config.toml             # Supabase config
├── docs/                       # Documentation
│   ├── compose/
│   │   ├── specs/              # Design specifications
│   │   └── plans/              # Implementation plans
│   └── api/                    # API documentation
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Agent Layer** | [LobeHub](https://lobehub.com) | AI agent orchestration, chat UI, IM gateway |
| **Data Layer** | [Supabase](https://supabase.com) | PostgreSQL, Auth, Storage, Realtime |
| **Presentation** | [Astro](https://astro.build) + [Svelte](https://svelte.dev) | Static site + interactive components |
| **Build Tool** | [Turborepo](https://turbo.build) | Monorepo management |
| **Deployment** | [Docker](https://www.docker.com/) | Containerized deployment |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **AI Integration** | [WebMCP](https://github.com/webmachinelearning/webmcp) | AI agent discovery |

---

## 📚 Documentation

- [Design Specification](docs/compose/specs/2025-07-05-ai-marketing-platform-design.md) — Complete system design
- [Phased Development Plan](docs/compose/specs/2025-07-05-phased-development-plan.md) — 12-month roadmap
- [Implementation Plan](docs/compose/plans/2025-07-05-phase1-foundation.md) — Phase 1 tasks
- [API Documentation](docs/api/) — API reference (coming soon)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [LobeHub](https://lobehub.com) — AI agent platform
- [Supabase](https://supabase.com) — Open source Firebase alternative
- [Astro](https://astro.build) — Static site generator
- [Svelte](https://svelte.dev) — Reactive UI framework
- [WebMCP](https://github.com/webmachinelearning/webmcp) — Web Model Context Protocol

---

<div align="center">

**Built with ❤️ by the VYLUX Team**

[Report Bug](https://github.com/uncdev26/VYLUX/issues) • [Request Feature](https://github.com/uncdev26/VYLUX/issues)

</div>
