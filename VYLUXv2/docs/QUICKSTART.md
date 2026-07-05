# VYLUX v2 — Quick Start

## Prerequisites
- Docker & Docker Compose
- Node.js 22+
- Git

## Step 1: Clone the Fork
```bash
git clone https://github.com/uncdev26/VYLUX.git
cd VYLUX
```

## Step 2: Generate Environment
```bash
./scripts/setup.sh
```
This creates `.env` with all required keys and passwords.

## Step 3: Start Everything
```bash
docker compose up -d
```

## Step 4: Open LobeHub
Open http://localhost:3210 — create your admin account.

## Step 5: Configure MiMo
In LobeHub settings:
1. Go to Settings → Model Provider
2. Add OpenAI-compatible provider:
   - Base URL: `https://token-plan-sgp.xiaomimimo.com/v1`
   - API Key: your MiMo token plan key
   - Model: `mimo-v2.5-pro`
3. Set as default model

## Step 6: Load Agents & Skills
The fork comes pre-loaded with VYLUX agents and skills. They should appear in the agent selector.

## Step 7: Connect Telegram (Optional)
1. Create a Telegram bot via @BotFather
2. In LobeHub: Settings → IM Gateway → Telegram
3. Enter your bot token
4. Start chatting with VYLUX via Telegram

---

## Services

| Service | URL | Purpose |
|---------|-----|---------|
| VYLUX (LobeHub) | http://localhost:3210 | Main dashboard |
| MinIO Console | http://localhost:9001 | File storage |
| PostgreSQL (ParadeDB) | localhost:5432 | LobeHub + CMS data (single DB) |

---

## Development

### Adding a New Agent
1. Create `agents/my-agent.json`
2. Reference skills and MCP tools
3. Restart LobeHub

### Adding a New Skill
1. Create `skills/my-skill.md`
2. Reference in agent's `skills` array
3. Restart LobeHub

### Adding a New MCP Tool
1. Add tool implementation in `packages/mcp-cms/src/tools/`
2. Register in `packages/mcp-cms/src/index.ts`
3. Restart MCP server
