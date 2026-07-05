# AI-Native Marketing Platform Design Spec

**Date:** 2025-07-05
**Status:** Draft
**Author:** MiMo Code Agent

---

## [S1] Problem

Digital marketing agencies need a unified platform that combines CMS, AI content generation, sales funnels, forms, analytics, SEO optimization, and client communication. Current solutions require stitching together 10-20 different tools (WordPress + WooCommerce + Yoast + Mailchimp + HubSpot + etc.), resulting in:

- Fragmented workflows across multiple dashboards
- Inconsistent design across generated content
- Manual SEO optimization that doesn't scale
- No AI-native content creation pipeline
- Complex integrations between disparate systems

## [S2] Solution Overview

An AI-native marketing platform built on three core layers:

1. **LobeHub (Agent Layer)** — Chat-based interface for all operations, agent orchestration, IM gateway (Telegram/Slack/Discord), MCP/Skill marketplace
2. **Supabase (Data Layer)** — PostgreSQL database, authentication, file storage, realtime subscriptions
3. **Astro + Svelte (Presentation Layer)** — SEO-optimized public website with Svelte 5 islands for interactive components

**Key Differentiator:** Every feature is AI-native — not AI bolted onto traditional CMS. Agents understand context, follow design system rules, and optimize for SEO automatically.

## [S3] Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOBEHUB (Agent Layer)                  │
│  - Chat-based interface (primary UI)                     │
│  - Agent Builder + Groups                                │
│  - Pages (content creation)                              │
│  - IM Gateway (Telegram/Slack/Discord/WeChat)            │
│  - Skills/MCP Marketplace (10,000+ tools)                │
│  - Resource Library (knowledge base)                     │
│  - Memory (per-agent)                                    │
│  - Artifacts (visual content)                            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (Data Layer)                        │
│  - PostgreSQL (all feature data)                         │
│  - Auth (user management, roles)                         │
│  - Storage (media, documents)                            │
│  - Realtime (live updates)                               │
│  - Edge Functions (AI operations)                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           ASTRO + SVELTE (Presentation Layer)             │
│  - Astro (static pages, SEO optimization)                │
│  - Svelte 5 islands (interactive components)             │
│  - WebMCP tools (AI agent discovery)                     │
│  - Design system tokens (from Supabase)                  │
└─────────────────────────────────────────────────────────┘
```

### Module Pattern

Every feature follows the same modular pattern:

```
Feature = Supabase Table + LobeHub Agent + API Routes + Svelte Components
```

Example:
- **Forms:** `forms` table + Forms Agent + `/api/forms/*` + `<FormBuilder />`
- **Payments:** `orders` table + Payment Agent + `/api/payments/*` + `<Checkout />`

## [S4] Feature Modules

### 4.1 Content Management

**Supabase Tables:**
- `posts` — Blog posts, articles
- `pages` — Landing pages, static pages
- `media` — Images, videos, documents
- `categories` — Content taxonomy
- `tags` — Content tagging

**Agent:** Content Agent
- Generates blog posts from prompts
- Follows design system tokens
- Optimizes for SEO automatically
- Generates images via AI

**API Routes:** `/api/content/*`

**Flow:**
```
User prompt → Content Agent generates → Preview in chat → Approve → Publish
```

### 4.2 Forms

**Supabase Tables:**
- `forms` — Form definitions
- `submissions` — Form submissions
- `form_fields` — Field configurations

**Agent:** Forms Agent
- Generates forms from business goals
- Adds conditional logic
- Validates submissions
- Sends notifications

**API Routes:** `/api/forms/*`

**Svelte 5 Runes:**
- Reactive form state via `$state`
- Real-time validation via `$derived`
- Conditional field visibility via `$effect`

### 4.3 Payments

**Supabase Tables:**
- `orders` — Order records
- `transactions` — Payment transactions
- `products` — Product catalog

**Agent:** Payment Agent
- Processes Stripe/Razorpay/PayPal
- Handles refunds
- Generates invoices
- Tracks revenue

**API Routes:** `/api/payments/*`

### 4.4 E-commerce

**Supabase Tables:**
- `products` — Product catalog
- `cart` — Shopping cart
- `inventory` — Stock management
- `variants` — Product variants

**Agent:** Commerce Agent
- Manages product catalog
- Handles cart operations
- Tracks inventory
- Generates product descriptions

**API Routes:** `/api/commerce/*`

### 4.5 SEO

**Supabase Tables:**
- `seo_configs` — SEO settings per page
- `sitemaps` — Sitemap generation
- `redirects` — URL redirects
- `schema_markup` — Structured data

**Agent:** SEO Agent
- Validates content for SEO
- Generates meta tags
- Creates sitemaps
- Monitors rankings

**API Routes:** `/api/seo/*`

**WebMCP Integration:**
- Exposes `get_content` tool for AI discovery
- Structured data for rich snippets
- Schema.org markup

### 4.6 Analytics

**Supabase Tables:**
- `analytics_config` — GA4, TikTok, Meta Pixel configs
- `events` — Tracking events
- `dashboards` — Custom dashboards

**Agent:** Analytics Agent
- Monitors traffic
- Generates reports
- Alerts on anomalies
- Suggests optimizations

**API Routes:** `/api/analytics/*`

**Config Dashboard:**
- Right-side configuration panel
- Support for GA4, TikTok, Meta Pixel, Pinterest, Microsoft Clarity
- Custom JSON config for new providers
- Site-wide application

### 4.7 Booking

**Supabase Tables:**
- `bookings` — Appointment records
- `calendar` — Availability slots
- `services` — Bookable services

**Agent:** Booking Agent
- Manages appointments
- Sends reminders
- Handles cancellations
- Syncs with external calendars

**API Routes:** `/api/bookings/*`

### 4.8 Membership

**Supabase Tables:**
- `members` — Member records
- `subscriptions` — Subscription plans
- `gated_content` — Protected content

**Agent:** Membership Agent
- Manages subscriptions
- Gates content
- Handles renewals
- Processes upgrades

**API Routes:** `/api/members/*`

### 4.9 Email Automation

**Supabase Tables:**
- `campaigns` — Email campaigns
- `subscribers` — Subscriber lists
- `sequences` — Drip sequences
- `templates` — Email templates

**Agent:** Email Agent
- Creates campaigns
- Manages subscribers
- Sends sequences
- Tracks engagement

**API Routes:** `/api/email/*`

### 4.10 CRM

**Supabase Tables:**
- `contacts` — Contact records
- `deals` — Sales deals
- `pipeline` — Sales pipeline stages
- `activities` — Interaction history

**Agent:** CRM Agent
- Manages contacts
- Tracks deals
- Automates follow-ups
- Generates reports

**API Routes:** `/api/crm/*`

### 4.11 Directory

**Supabase Tables:**
- `listings` — Directory entries
- `categories` — Listing categories
- `reviews` — User reviews

**Agent:** Directory Agent
- Manages listings
- Handles search
- Processes reviews
- Generates descriptions

**API Routes:** `/api/directory/*`

### 4.12 Events

**Supabase Tables:**
- `events` — Event records
- `registrations` — Attendee registrations
- `tickets` — Ticket types

**Agent:** Event Agent
- Creates events
- Manages registrations
- Sends reminders
- Handles check-in

**API Routes:** `/api/events/*`

### 4.13 LMS (Learning Management)

**Supabase Tables:**
- `courses` — Course catalog
- `lessons` — Course content
- `progress` — Student progress
- `certificates` — Completion certificates

**Agent:** LMS Agent
- Creates courses
- Tracks progress
- Generates quizzes
- Issues certificates

**API Routes:** `/api/lms/*`

### 4.14 Chat/Communication

**Supabase Tables:**
- `conversations` — Chat conversations
- `messages` — Chat messages
- `channels` — Communication channels

**Agent:** Chat Agent
- Manages conversations
- Routes messages
- Handles notifications
- Integrates with IM gateway

**API Routes:** `/api/chat/*`

### 4.15 Sitemap Manager

**Supabase Tables:**
- `sitemaps` — Sitemap entries (URL, priority, changefreq, lastmod)
- `sitemap_configs` — Sitemap generation settings

**Agent:** Sitemap Agent
- Auto-generates XML sitemaps on content publish
- Updates sitemap when pages are added/removed
- Submits sitemaps to Google Search Console
- Monitors sitemap health

**API Routes:** `/api/sitemap/*`

**Features:**
- Auto-generation on content publish
- Priority and changefreq management
- Image/video sitemap support
- News sitemap for blog posts
- Multi-language sitemap support

### 4.16 Keywords Manager

**Supabase Tables:**
- `keywords` — Target keywords (keyword, difficulty, volume, intent)
- `keyword_groups` — Keyword clustering
- `keyword_assignments` — Keywords assigned to content

**Agent:** Keywords Agent
- Researches keyword opportunities
- Tracks keyword rankings
- Suggests keyword optimizations
- Monitors competitor keywords

**API Routes:** `/api/keywords/*`

**Features:**
- Keyword research integration
- Search volume tracking
- Keyword difficulty scoring
- Content-keyword mapping
- SERP position monitoring

### 4.17 Design System Manager

**Supabase Tables:**
- `design_tokens` — Colors, typography, spacing, shadows
- `design_components` — Reusable component definitions
- `design_themes` — Theme presets (light, dark, custom)

**Agent:** Design Agent
- Manages design tokens
- Ensures consistency across generated content
- Applies theme to new pages/components
- Suggests design improvements

**API Routes:** `/api/design/*`

**Features:**
- Visual token editor
- Theme switching (light/dark/custom)
- Component library management
- Design system documentation
- Agent compliance enforcement

### 4.18 Media Manager

**Supabase Tables:**
- `media` — File metadata (filename, url, type, size, alt_text)
- `media_folders` — Folder organization
- `media_tags` — Media tagging

**Agent:** Media Agent
- Organizes media library
- Generates alt text for images
- Optimizes images for web
- Suggests related media

**API Routes:** `/api/media/*`

**Features:**
- Drag-drop upload
- Folder organization
- Image optimization (WebP conversion, compression)
- Alt text generation via AI
- Media search and filtering
- Bulk operations

### 4.19 Logo & Favicon Manager

**Supabase Tables:**
- `branding_assets` — Logo, favicon, og_image, apple_touch_icon
- `branding_configs` — Branding settings per domain

**Agent:** Branding Agent
- Manages logo variants (light, dark, icon)
- Generates favicon set (16x16, 32x32, 180x180, 192x192, 512x512)
- Creates OG images for social sharing
- Ensures brand consistency

**API Routes:** `/api/branding/*`

**Features:**
- Multi-variant logo management
- Auto-generated favicon set
- OG image templates
- Brand color extraction
- White-label support

### 4.20 Header & Footer Manager

**Supabase Tables:**
- `header_configs` — Navigation menus, CTA buttons, announcement bars
- `footer_configs` — Footer links, social links, newsletter signup
- `menu_items` — Menu structure (nested)

**Agent:** Navigation Agent
- Manages header/footer content
- Optimizes navigation structure
- A/B tests CTA buttons
- Updates announcement bars

**API Routes:** `/api/navigation/*`

**Features:**
- Drag-drop menu builder
- Multi-level navigation
- Announcement bar management
- Social link management
- Newsletter signup integration

### 4.21 Categories Manager

**Supabase Tables:**
- `categories` — Hierarchical categories (id, name, slug, parent_id, description)
- `category_meta` — SEO metadata per category

**Agent:** Category Agent
- Manages category hierarchy
- Optimizes category pages for SEO
- Suggests category structure
- Auto-assigns categories to content

**API Routes:** `/api/categories/*`

**Features:**
- Hierarchical category tree
- Category-specific SEO settings
- Auto-categorization via AI
- Category page templates
- Bulk category operations

### 4.22 Append Manager

**Supabase Tables:**
- `appends` — Append definitions (type, position, target_pages)
- `append_templates` — Reusable append templates

**Agent:** Append Agent
- Injects booking forms, CTAs, or services into pages
- Manages append positioning (top, bottom, inline, sidebar)
- A/B tests append performance
- Personalizes appends based on user context

**API Routes:** `/api/appends/*`

**Features:**
- Shortcode-style append system (Astro/Svelte components)
- Position control (top, bottom, inline, sidebar)
- Conditional display (page type, user segment)
- Performance tracking
- Template library

**Example:**
```svelte
<!-- Blog post with booking append -->
<Article {post}>
  <Append type="booking" service="consultation" position="bottom" />
  <Append type="cta" text="Get a free audit" position="inline" />
</Article>
```

### 4.23 Backlinks Manager

**Supabase Tables:**
- `backlinks` — Internal and external backlinks (source, target, anchor_text, status)
- `backlink_campaigns` — Outreach campaigns
- `backlink_monitor` — Link health monitoring

**Agent:** Backlink Agent
- Manages internal linking structure
- Tracks external backlinks
- Monitors link health (broken links, redirects)
- Suggests internal linking opportunities

**API Routes:** `/api/backlinks/*`

**Features:**
- Internal link graph visualization
- Broken link detection
- Redirect chain analysis
- Backlink outreach tracking
- Anchor text optimization
- Sitemap integration (backlinks reflected in sitemap)

### 4.24 Social Media Connect Manager

**Supabase Tables:**
- `social_accounts` — Connected social platforms (X, Facebook, Instagram, LinkedIn, Pinterest)
- `social_posts` — Scheduled and published social posts
- `social_templates` — Post templates per platform

**Agent:** Social Agent
- Auto-posts new content to connected platforms
- Schedules posts for optimal times
- Adapts content format per platform
- Tracks engagement metrics

**API Routes:** `/api/social/*`

**Features:**
- MCP integration for X, Facebook, etc.
- Auto-posting on content publish
- Platform-specific formatting (threads, carousels, stories)
- Scheduling calendar
- Engagement tracking
- Hashtag suggestions

**MCP Connections:**
- X (Twitter) via MCP
- Facebook via MCP
- Instagram via MCP
- LinkedIn via MCP
- Pinterest via MCP

### 4.25 A/B Testing Manager

**Supabase Tables:**
- `ab_tests` — Test definitions (variants, traffic split, goals)
- `ab_results` — Test results (impressions, conversions, winner)
- `ab_variants` — Page/CTA variants

**Agent:** Testing Agent
- Creates A/B test variants
- Splits traffic between variants
- Analyzes results for statistical significance
- Auto-selects winners

**API Routes:** `/api/testing/*`

**Features:**
- Page variant testing
- CTA button testing
- Headline testing
- Form testing
- Statistical significance calculation
- Auto-winner selection

### 4.26 Popups & Modals Manager

**Supabase Tables:**
- `popups` — Popup definitions (trigger, content, targeting)
- `popup_templates` — Reusable popup templates
- `popup_analytics` — Popup performance data

**Agent:** Popup Agent
- Creates popups from templates
- Configures triggers (exit intent, time, scroll, page)
- A/B tests popup variants
- Optimizes display timing

**API Routes:** `/api/popups/*`

**Features:**
- Exit intent detection
- Time-based triggers
- Scroll-based triggers
- Page-specific targeting
- Device targeting
- Frequency capping

### 4.27 Lead Scoring Manager

**Supabase Tables:**
- `lead_scores` — Lead score records (contact_id, score, factors)
- `scoring_rules` — Scoring rule definitions
- `score_history` — Score change history

**Agent:** Lead Scoring Agent
- Calculates lead scores based on behavior
- Applies scoring rules (page views, form submits, email opens)
- Updates scores in real-time
- Identifies hot leads

**API Routes:** `/api/leads/*`

**Features:**
- Behavior-based scoring
- Demographic scoring
- Engagement scoring
- Score decay over time
- Hot lead alerts
- CRM integration

### 4.28 Version Control Manager

**Supabase Tables:**
- `content_versions` — Content version history (content_id, version, data, created_at)
- `version_diffs` — Diff between versions

**Agent:** Version Agent
- Tracks all content changes
- Creates version snapshots
- Enables rollback to previous versions
- Shows diff between versions

**API Routes:** `/api/versions/*`

**Features:**
- Auto-versioning on save
- Visual diff viewer
- One-click rollback
- Version comparison
- Branch/merge (advanced)

### 4.29 Content Calendar Manager

**Supabase Tables:**
- `calendar_events` — Scheduled content (content_id, publish_date, platform)
- `calendar_views` — Calendar view configurations

**Agent:** Calendar Agent
- Schedules content across platforms
- Suggests optimal posting times
- Manages content pipeline
- Tracks publishing status

**API Routes:** `/api/calendar/*`

**Features:**
- Drag-drop scheduling
- Multi-platform calendar view
- Content pipeline stages
- Optimal time suggestions
- Team visibility
- Buffer integration

### 4.30 Audit Log Manager

**Supabase Tables:**
- `audit_logs` — All system actions (user_id, action, resource, timestamp, ip)
- `audit_filters` — Log filtering configurations

**Agent:** Audit Agent
- Logs all user and agent actions
- Provides search and filtering
- Generates compliance reports
- Alerts on suspicious activity

**API Routes:** `/api/audit/*`

**Features:**
- Comprehensive action logging
- User activity tracking
- Agent action tracking
- Compliance reporting
- Export capabilities
- Retention policies

### 4.31 Workflow Automation Manager

**Supabase Tables:**
- `workflows` — Workflow definitions (trigger, steps, conditions)
- `workflow_runs` — Workflow execution history
- `workflow_templates` — Reusable workflow templates

**Agent:** Workflow Agent
- Executes multi-step workflows
- Handles conditional branching
- Manages delays and scheduling
- Tracks workflow performance

**API Routes:** `/api/workflows/*`

**Features:**
- Visual workflow builder
- Trigger-based execution
- Conditional branching
- Delay/schedule steps
- Error handling
- Performance analytics

### 4.32 Integration Hub Manager

**Supabase Tables:**
- `integrations` — Connected services (name, type, credentials, status)
- `integration_logs` — Integration activity logs

**Agent:** Integration Agent
- Manages third-party connections
- Handles authentication (OAuth, API keys)
- Monitors integration health
- Routes data between systems

**API Routes:** `/api/integrations/*`

**Features:**
- Centralized integration management
- OAuth flow handling
- API key management
- Health monitoring
- Data mapping
- Error handling

### 4.33 Local SEO Manager

**Supabase Tables:**
- `local_listings` — Google Business Profile data
- `local_keywords` — Local keyword tracking
- `local_reviews` — Review monitoring

**Agent:** Local SEO Agent
- Manages Google Business Profile
- Tracks local keyword rankings
- Monitors and responds to reviews
- Optimizes for local search

**API Routes:** `/api/local-seo/*`

**Features:**
- Google Business Profile sync
- Local keyword tracking
- Review monitoring and response
- Citation management
- Local schema markup
- Map pack optimization

### 4.34 Competitor Analysis Manager

**Supabase Tables:**
- `competitors` — Competitor domains
- `competitor_keywords` — Competitor keyword rankings
- `competitor_backlinks` — Competitor backlink profiles

**Agent:** Competitor Agent
- Monitors competitor activity
- Tracks competitor keywords
- Analyzes competitor backlinks
- Identifies opportunities

**API Routes:** `/api/competitors/*`

**Features:**
- Competitor keyword tracking
- Backlink comparison
- Content gap analysis
- SERP position comparison
- Alert on competitor changes

### 4.35 Reputation Manager

**Supabase Tables:**
- `reviews` — Reviews from all platforms
- `review_responses` — Response templates and history
- `reputation_score` — Overall reputation metrics

**Agent:** Reputation Agent
- Monitors reviews across platforms
- Drafts response suggestions
- Tracks reputation score
- Alerts on negative reviews

**API Routes:** `/api/reputation/*`

**Features:**
- Multi-platform review monitoring
- AI-drafted responses
- Sentiment analysis
- Reputation scoring
- Alert system
- Review solicitation

### 4.36 Heatmaps & Session Recording

**Supabase Tables:**
- `heatmap_data` — Click, scroll, move heatmaps
- `session_recordings` — Session replay data

**Agent:** Analytics Agent (extended)
- Generates heatmap visualizations
- Records user sessions
- Identifies usability issues
- Suggests UX improvements

**API Routes:** `/api/heatmaps/*`

**Features:**
- Click heatmaps
- Scroll depth analysis
- Mouse movement tracking
- Session replay
- Rage click detection
- UX insights

### 4.37 Surveys & Quizzes Manager

**Supabase Tables:**
- `surveys` — Survey definitions
- `survey_responses` — Survey submissions
- `quizzes` — Quiz definitions
- `quiz_results` — Quiz completions

**Agent:** Survey Agent
- Creates surveys from goals
- Generates quiz questions
- Analyzes responses
- Generates insights

**API Routes:** `/api/surveys/*`

**Features:**
- Drag-drop survey builder
- Quiz scoring logic
- Conditional questions
- Response analytics
- Export capabilities
- Embed anywhere

### 4.38 Calculators Manager

**Supabase Tables:**
- `calculators` — Calculator definitions (inputs, formula, outputs)
- `calculator_submissions` — Calculator usage data

**Agent:** Calculator Agent
- Creates ROI calculators
- Builds pricing calculators
- Generates calculator forms
- Tracks usage

**API Routes:** `/api/calculators/*`

**Features:**
- Visual calculator builder
- Custom formulas
- Dynamic pricing
- Lead capture integration
- Embed anywhere
- Usage analytics

### 4.39 Live Chat Manager

**Supabase Tables:**
- `chat_agents` — Chat agent profiles
- `chat_conversations` — Live chat sessions
- `chat_messages` — Chat message history

**Agent:** Live Chat Agent
- Handles visitor inquiries
- Routes to human agents
- Provides canned responses
- Tracks chat metrics

**API Routes:** `/api/live-chat/*`

**Features:**
- Real-time visitor chat
- Agent routing
- Canned responses
- Chat history
- Visitor info display
- Offline messaging

### 4.40 Knowledge Base Manager

**Supabase Tables:**
- `kb_articles` — Knowledge base articles
- `kb_categories` — KB categories
- `kb_search` — Search index

**Agent:** Knowledge Agent
- Creates help articles
- Manages KB structure
- Provides search functionality
- Suggests article improvements

**API Routes:** `/api/knowledge-base/*`

**Features:**
- Article creation and editing
- Category organization
- Full-text search
- Article analytics
- Feedback collection
- AI-suggested answers

### 4.41 Affiliate Program Manager

**Supabase Tables:**
- `affiliates` — Affiliate partner records
- `affiliate_links` — Tracking links
- `affiliate_commissions` — Commission records

**Agent:** Affiliate Agent
- Manages affiliate partners
- Tracks referral links
- Calculates commissions
- Processes payouts

**API Routes:** `/api/affiliates/*`

**Features:**
- Partner onboarding
- Link tracking
- Commission calculation
- Payout processing
- Performance reporting
- Fraud detection

### 4.42 Referral System Manager

**Supabase Tables:**
- `referrals` — Referral records (referrer, referred, status)
- `referral_rewards` — Reward definitions

**Agent:** Referral Agent
- Tracks referral chains
- Manages reward distribution
- Identifies top referrers
- Optimizes referral program

**API Routes:** `/api/referrals/*`

**Features:**
- Referral link generation
- Reward management
- Referral tracking
- Leaderboard
- Social sharing
- Fraud prevention

### 4.43 Domain Manager

**Supabase Tables:**
- `domains` — Domain records (domain, status, ssl, dns)
- `domain_configs` — Domain-specific settings

**Agent:** Domain Agent
- Manages multiple domains
- Handles DNS configuration
- Monitors domain health
- Manages redirects

**API Routes:** `/api/domains/*`

**Features:**
- Multi-domain support
- DNS management
- SSL certificate management
- Domain redirects
- Health monitoring
- Expiration alerts

### 4.44 Backup & Restore Manager

**Supabase Tables:**
- `backups` — Backup records (type, size, timestamp, status)
- `backup_configs` — Backup scheduling settings

**Agent:** Backup Agent
- Creates automated backups
- Manages backup storage
- Handles restore operations
- Verifies backup integrity

**API Routes:** `/api/backups/*`

**Features:**
- Automated scheduled backups
- Manual backup triggers
- One-click restore
- Backup verification
- Storage management
- Retention policies

### 4.45 Migration Tools Manager

**Supabase Tables:**
- `migrations` — Migration records (source, status, progress)
- `migration_mappings` — Data mapping configurations

**Agent:** Migration Agent
- Imports from WordPress
- Maps data structures
- Handles media migration
- Verifies migration integrity

**API Routes:** `/api/migrations/*`

**Features:**
- WordPress import
- Content mapping
- Media migration
- URL redirect creation
- Progress tracking
- Rollback support

## [S5] Design System

### Token Architecture

Design tokens stored in Supabase `design_tokens` table:

```json
{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "accent": "#F59E0B"
  },
  "typography": {
    "fontFamily": "Inter",
    "headingWeight": "700",
    "bodyWeight": "400"
  },
  "spacing": {
    "unit": "8px",
    "scale": [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]
  }
}
```

### Agent Compliance

All agents reference design tokens when:
- Generating content
- Creating pages
- Designing forms
- Building templates

### Svelte Integration

Tokens consumed via CSS variables:
```svelte
<style>
  :root {
    --color-primary: {tokens.colors.primary};
    --font-family: {tokens.typography.fontFamily};
  }
</style>
```

## [S6] WebMCP Integration

### Public Page Tools

Every public page exposes WebMCP tools for AI agent discovery:

```javascript
document.modelContext.registerTool({
  name: "get_content",
  description: "Retrieve page content",
  inputSchema: { type: "object", properties: { slug: { type: "string" } } },
  execute: async ({ slug }) => await fetchContent(slug)
});
```

### Available Tools

- `get_content` — Retrieve page/post content
- `submit_form` — Form submission
- `book_appointment` — Booking creation
- `search_products` — Product search
- `get_events` — Event listing
- `subscribe_newsletter` — Email subscription

## [S7] Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  lobehub:
    image: lobehub/lobehub:latest
    ports:
      - "3210:3210"
    environment:
      - DATABASE_URL=postgresql://...
      - OPENAI_API_KEY=...
    depends_on:
      - supabase

  supabase:
    image: supabase/supabase:latest
    ports:
      - "5432:5432"
      - "8000:8000"
    environment:
      - POSTGRES_PASSWORD=...
      - JWT_SECRET=...

  website:
    build:
      context: ./astro-site
      dockerfile: Dockerfile
    ports:
      - "4321:4321"
    environment:
      - PUBLIC_SUPABASE_URL=...
      - PUBLIC_SUPABASE_ANON_KEY=...
    depends_on:
      - supabase
```

### Compatibility

- Railway (one-click deploy)
- Proxmox CT container
- Any Docker host
- VPS with Docker Compose

## [S8] User Interface

### Chat-First Model

**Primary Interface:** LobeHub chat area

**How Users Interact:**
1. Type natural language prompts
2. Agent generates content/actions
3. Preview results inline
4. Approve and publish from chat

**Example Flows:**

**Content Creation:**
```
User: "Write a blog post about SEO trends in 2025"
Agent: "Here's the draft: [preview]"
User: "Change the headline to 'Top SEO Strategies'"
Agent: "Updated: [preview]"
User: "Publish it"
Agent: "Published at /blog/seo-trends-2025"
```

**Form Creation:**
```
User: "Create a contact form with name, email, phone, message"
Agent: "Created form: [preview]"
User: "Add a dropdown for service type"
Agent: "Added dropdown: [preview]"
User: "Deploy it to /contact"
Agent: "Deployed at /contact"
```

### Side Navigation

Quick access to all sections:
- Content (Posts, Pages, Media)
- Forms (All forms, Submissions)
- E-commerce (Products, Orders)
- Analytics (Dashboard, Reports)
- Bookings (Calendar, Appointments)
- Members (Subscribers, Plans)
- Email (Campaigns, Sequences)
- CRM (Contacts, Deals)
- Settings (Design, Integrations)

### Visual Mode

For complex operations, traditional UI available:
- Drag-drop form builder
- Calendar view for bookings
- Product catalog management
- Analytics dashboards

## [S9] Integration Points

### IM Gateway (via LobeHub)

- Telegram bot
- Slack integration
- Discord bot
- WeChat
- Feishu/Lark

### MCP/Skills Marketplace

- 10,000+ tools available
- Google Calendar, GitHub, Google Drive
- Custom MCP servers
- Agent-to-agent communication

### Payment Processors

- Stripe
- Razorpay
- PayPal
- Custom payment agents

### Analytics Providers

- GA4
- TikTok Pixel
- Meta Pixel
- Pinterest Tag
- Microsoft Clarity
- Custom JSON config

## [S10] Security

### Authentication

- Supabase Auth (email/password, OAuth, magic link)
- Role-based access control (RBAC)
- Multi-tenant support

### Data Protection

- Supabase Row Level Security (RLS)
- API key management
- CORS configuration
- Rate limiting

### Content Protection

- WebMCP permissions policy
- Origin isolation
- CSRF protection

## [S11] Performance

### Static Generation

- Astro generates static HTML for public pages
- Zero JavaScript by default
- Perfect Core Web Vitals

### Svelte Islands

- Interactive components load only when needed
- Minimal JavaScript footprint
- Svelte 5 runes for reactive state

### Caching Strategy

- CDN for static assets
- Supabase caching for database queries
- LobeHub caching for agent responses

## [S12] SEO Optimization

### Technical SEO

- Static HTML (Astro)
- Structured data (Schema.org)
- XML sitemaps
- Robots.txt
- Canonical URLs

### Content SEO

- SEO Agent validates all content
- Meta tag optimization
- Internal linking suggestions
- Keyword optimization

### WebMCP for SEO

- AI agents can discover content
- Structured tool definitions
- Machine-readable content

## [S13] Future Enhancements

### Phase 2

- Multi-language support (i18n)
- Advanced analytics (cohort analysis, funnels)
- A/B testing framework
- White-label support

### Phase 3

- Mobile app (React Native)
- Advanced AI (GPT-5, Claude 4)
- Blockchain integration (NFTs, tokens)
- AR/VR experiences

---

## Appendix A: Database Schema Overview

### Core Tables

```sql
-- Content
CREATE TABLE posts (id, title, slug, content, status, author_id, created_at, updated_at);
CREATE TABLE pages (id, title, slug, content, status, created_at, updated_at);
CREATE TABLE media (id, filename, url, type, size, created_at);

-- Forms
CREATE TABLE forms (id, name, fields, settings, created_at);
CREATE TABLE submissions (id, form_id, data, submitted_at);

-- E-commerce
CREATE TABLE products (id, name, description, price, images, stock, created_at);
CREATE TABLE orders (id, user_id, total, status, created_at);
CREATE TABLE cart (id, user_id, product_id, quantity);

-- Bookings
CREATE TABLE bookings (id, user_id, service_id, start_time, end_time, status);
CREATE TABLE services (id, name, duration, price, description);

-- Members
CREATE TABLE members (id, user_id, plan_id, status, started_at, expires_at);
CREATE TABLE plans (id, name, price, features, interval);

-- Email
CREATE TABLE campaigns (id, name, subject, content, status, sent_at);
CREATE TABLE subscribers (id, email, name, status, subscribed_at);

-- CRM
CREATE TABLE contacts (id, name, email, phone, company, status);
CREATE TABLE deals (id, contact_id, value, stage, expected_close);

-- Events
CREATE TABLE events (id, name, description, start_time, end_time, location);
CREATE TABLE registrations (id, event_id, user_id, ticket_type, registered_at);

-- LMS
CREATE TABLE courses (id, title, description, price, instructor_id);
CREATE TABLE lessons (id, course_id, title, content, order_index);
CREATE TABLE progress (id, user_id, lesson_id, completed_at);

-- Design System
CREATE TABLE design_tokens (id, key, value, updated_at);
CREATE TABLE design_components (id, name, definition, created_at);
CREATE TABLE design_themes (id, name, tokens, created_at);

-- Sitemap
CREATE TABLE sitemaps (id, url, priority, changefreq, lastmod, created_at);
CREATE TABLE sitemap_configs (id, settings, updated_at);

-- Keywords
CREATE TABLE keywords (id, keyword, difficulty, volume, intent, created_at);
CREATE TABLE keyword_groups (id, name, keywords, created_at);
CREATE TABLE keyword_assignments (id, keyword_id, content_id, created_at);

-- Media
CREATE TABLE media (id, filename, url, type, size, alt_text, folder_id, created_at);
CREATE TABLE media_folders (id, name, parent_id, created_at);
CREATE TABLE media_tags (id, media_id, tag, created_at);

-- Branding
CREATE TABLE branding_assets (id, type, url, variant, domain, created_at);
CREATE TABLE branding_configs (id, domain, settings, updated_at);

-- Navigation
CREATE TABLE header_configs (id, domain, menus, cta, announcement, updated_at);
CREATE TABLE footer_configs (id, domain, links, social, newsletter, updated_at);
CREATE TABLE menu_items (id, menu_id, label, url, parent_id, order_index, created_at);

-- Categories
CREATE TABLE categories (id, name, slug, parent_id, description, created_at);
CREATE TABLE category_meta (id, category_id, seo_title, seo_description, updated_at);

-- Appends
CREATE TABLE appends (id, type, position, target_pages, template_id, created_at);
CREATE TABLE append_templates (id, name, content, created_at);

-- Backlinks
CREATE TABLE backlinks (id, source_url, target_url, anchor_text, status, created_at);
CREATE TABLE backlink_campaigns (id, name, targets, status, created_at);
CREATE TABLE backlink_monitor (id, url, status, last_checked, created_at);

-- Social Media
CREATE TABLE social_accounts (id, platform, account_id, access_token, connected_at);
CREATE TABLE social_posts (id, platform, content, scheduled_at, published_at, status);
CREATE TABLE social_templates (id, platform, template, created_at);

-- A/B Testing
CREATE TABLE ab_tests (id, name, variants, traffic_split, goals, status, created_at);
CREATE TABLE ab_results (id, test_id, variant, impressions, conversions, created_at);
CREATE TABLE ab_variants (id, test_id, name, content, created_at);

-- Popups
CREATE TABLE popups (id, name, trigger, content, targeting, status, created_at);
CREATE TABLE popup_templates (id, name, content, created_at);
CREATE TABLE popup_analytics (id, popup_id, impressions, conversions, created_at);

-- Lead Scoring
CREATE TABLE lead_scores (id, contact_id, score, factors, updated_at);
CREATE TABLE scoring_rules (id, name, condition, points, created_at);
CREATE TABLE score_history (id, contact_id, score, reason, created_at);

-- Version Control
CREATE TABLE content_versions (id, content_id, version, data, created_at);
CREATE TABLE version_diffs (id, version_a, version_b, diff, created_at);

-- Content Calendar
CREATE TABLE calendar_events (id, content_id, publish_date, platform, status, created_at);
CREATE TABLE calendar_views (id, name, filters, created_at);

-- Audit Log
CREATE TABLE audit_logs (id, user_id, action, resource, details, ip, timestamp);
CREATE TABLE audit_filters (id, name, filters, created_at);

-- Workflows
CREATE TABLE workflows (id, name, trigger, steps, conditions, status, created_at);
CREATE TABLE workflow_runs (id, workflow_id, status, started_at, completed_at);
CREATE TABLE workflow_templates (id, name, definition, created_at);

-- Integrations
CREATE TABLE integrations (id, name, type, credentials, status, created_at);
CREATE TABLE integration_logs (id, integration_id, action, details, timestamp);

-- Local SEO
CREATE TABLE local_listings (id, platform, listing_id, data, updated_at);
CREATE TABLE local_keywords (id, keyword, location, rank, tracked_at);
CREATE TABLE local_reviews (id, platform, review_id, rating, response, created_at);

-- Competitor Analysis
CREATE TABLE competitors (id, domain, name, created_at);
CREATE TABLE competitor_keywords (id, competitor_id, keyword, rank, tracked_at);
CREATE TABLE competitor_backlinks (id, competitor_id, url, anchor, tracked_at);

-- Reputation
CREATE TABLE reviews (id, platform, review_id, rating, content, sentiment, created_at);
CREATE TABLE review_responses (id, review_id, response, created_at);
CREATE TABLE reputation_score (id, platform, score, updated_at);

-- Heatmaps
CREATE TABLE heatmap_data (id, page_url, type, data, recorded_at);
CREATE TABLE session_recordings (id, session_id, data, duration, recorded_at);

-- Surveys & Quizzes
CREATE TABLE surveys (id, name, questions, settings, created_at);
CREATE TABLE survey_responses (id, survey_id, answers, submitted_at);
CREATE TABLE quizzes (id, name, questions, scoring, created_at);
CREATE TABLE quiz_results (id, quiz_id, score, answers, completed_at);

-- Calculators
CREATE TABLE calculators (id, name, inputs, formula, outputs, created_at);
CREATE TABLE calculator_submissions (id, calculator_id, inputs, outputs, submitted_at);

-- Live Chat
CREATE TABLE chat_agents (id, name, status, skills, created_at);
CREATE TABLE chat_conversations (id, visitor_id, agent_id, status, started_at);
CREATE TABLE chat_messages (id, conversation_id, sender, content, sent_at);

-- Knowledge Base
CREATE TABLE kb_articles (id, title, content, category_id, status, created_at);
CREATE TABLE kb_categories (id, name, parent_id, created_at);
CREATE TABLE kb_search (id, article_id, keywords, updated_at);

-- Affiliates
CREATE TABLE affiliates (id, name, email, commission_rate, status, created_at);
CREATE TABLE affiliate_links (id, affiliate_id, url, code, created_at);
CREATE TABLE affiliate_commissions (id, affiliate_id, amount, status, created_at);

-- Referrals
CREATE TABLE referrals (id, referrer_id, referred_id, status, created_at);
CREATE TABLE referral_rewards (id, referral_id, reward_type, amount, created_at);

-- Domains
CREATE TABLE domains (id, domain, status, ssl, dns_config, created_at);
CREATE TABLE domain_configs (id, domain_id, settings, updated_at);

-- Backups
CREATE TABLE backups (id, type, size, status, created_at);
CREATE TABLE backup_configs (id, schedule, retention, updated_at);

-- Migrations
CREATE TABLE migrations (id, source, status, progress, started_at, completed_at);
CREATE TABLE migration_mappings (id, migration_id, source_type, target_type, mapping);
```

## Appendix B: API Route Structure

```
/api/content/*    — Posts, pages, media CRUD
/api/forms/*      — Form definitions, submissions
/api/payments/*   — Payment processing, refunds
/api/commerce/*   — Products, cart, orders
/api/seo/*        — SEO configs, sitemaps
/api/analytics/*  — Tracking, reports
/api/bookings/*   — Appointments, calendar
/api/members/*    — Subscriptions, gated content
/api/email/*      — Campaigns, subscribers
/api/crm/*        — Contacts, deals
/api/directory/*  — Listings, categories
/api/events/*     — Events, registrations
/api/lms/*        — Courses, progress
/api/chat/*       — Conversations, messages
/api/design/*     — Design tokens, components, themes
/api/sitemap/*    — Sitemap generation, configs
/api/keywords/*   — Keyword research, tracking
/api/media/*      — Media upload, management
/api/branding/*   — Logo, favicon, OG images
/api/navigation/* — Header, footer, menus
/api/categories/* — Category management
/api/appends/*    — Append definitions, templates
/api/backlinks/*  — Backlink tracking, monitoring
/api/social/*     — Social media connections, posts
/api/testing/*     — A/B tests, variants, results
/api/popups/*      — Popups, modals, triggers
/api/leads/*       — Lead scoring, rules
/api/versions/*    — Content versioning
/api/calendar/*    — Content calendar
/api/audit/*       — Audit logs
/api/workflows/*   — Automation workflows
/api/integrations/* — Third-party integrations
/api/local-seo/*   — Local SEO, Google Business
/api/competitors/* — Competitor analysis
/api/reputation/*  — Reviews, reputation
/api/heatmaps/*    — Heatmaps, session recordings
/api/surveys/*     — Surveys, quizzes
/api/calculators/* — ROI, pricing calculators
/api/live-chat/*   — Visitor live chat
/api/knowledge-base/* — Help center
/api/affiliates/*  — Affiliate program
/api/referrals/*   — Referral system
/api/domains/*     — Domain management
/api/backups/*     — Backup and restore
/api/migrations/*  — WordPress migration
```

## Appendix C: Agent Definitions

Each agent is defined in LobeHub with:

1. **System Prompt** — Instructions for the agent
2. **Model** — AI model to use (GPT-4, Claude, etc.)
3. **Skills** — MCP tools and plugins
4. **Resources** — Knowledge base documents
5. **Memory** — Per-agent memory settings

Example Agent Definition:
```json
{
  "name": "SEO Agent",
  "description": "Validates and optimizes content for search engines",
  "model": "gpt-4",
  "systemPrompt": "You are an SEO expert. Validate content for...",
  "skills": ["web-search", "keyword-research", "schema-generator"],
  "resources": ["seo-guidelines.pdf", "keyword-list.csv"]
}
```

---

**End of Design Spec**
