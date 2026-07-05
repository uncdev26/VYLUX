# MCP CMS Server — Tool Spec

## Overview
An MCP server that exposes VYLUX CMS operations as tools for LobeHub agents. Queries the `cms` schema directly via Drizzle ORM — no PostgREST, no HTTP hop.

## Connection
- Transport: stdio (runs in same process as LobeHub)
- Config in LobeHub: `mcpServers.vylux-cms`
- Package: `@vylux/mcp-cms`

## Architecture
```
Agent → MCP Tool → Drizzle ORM → ParadeDB (cms schema)
```
- Single PostgreSQL instance (shared with LobeHub's `public` schema)
- Type-safe queries via Drizzle
- No JWT auth needed (internal tools)
- Connection pool shared with LobeHub

## Tools

### Content (13 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_posts` | List blog posts with filters | `status?`, `category_id?`, `limit?`, `offset?` |
| `get_post` | Get post by ID or slug | `id` or `slug` |
| `create_post` | Create a new blog post | `title`, `content`, `excerpt?`, `category_id?`, `status?`, `seo?` |
| `update_post` | Update existing post | `id`, `title?`, `content?`, `excerpt?`, `status?`, `seo?` |
| `delete_post` | Soft-delete a post | `id` |
| `publish_post` | Publish a draft post | `id` |
| `list_pages` | List pages | `limit?`, `offset?` |
| `get_page` | Get page by ID or slug | `id` or `slug` |
| `create_page` | Create a new page | `title`, `content`, `slug?`, `template?`, `seo?` |
| `update_page` | Update existing page | `id`, `title?`, `content?`, `seo?` |
| `delete_page` | Soft-delete a page | `id` |
| `list_categories` | List categories | `limit?` |
| `create_category` | Create a category | `name`, `description?` |

### Design System (5 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_design_tokens` | List all design tokens | `category?` |
| `get_design_token` | Get token by name | `name` |
| `update_design_token` | Update or create a token | `name`, `category`, `value`, `description?` |
| `list_design_themes` | List themes | — |
| `apply_theme` | Apply a theme | `theme_id` |

### Media (4 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_media` | List media files | `folder_id?`, `limit?`, `offset?` |
| `upload_media` | Register a media file | `filename`, `mime_type`, `size`, `storage_path`, `alt_text?`, `caption?` |
| `delete_media` | Soft-delete media | `id` |
| `list_media_folders` | List folders | `parent_id?` |

### Forms (5 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_forms` | List forms | — |
| `get_form` | Get form by ID or slug | `id` or `slug` |
| `create_form` | Create a form | `name`, `fields`, `settings?` |
| `update_form` | Update a form | `id`, `name?`, `fields?`, `settings?` |
| `list_submissions` | List submissions | `form_id`, `limit?`, `offset?` |

### SEO (5 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `get_seo_config` | Get SEO config for page | `page_type`, `page_id` |
| `update_seo_config` | Update SEO config | `page_type`, `page_id`, `title?`, `description?`, `keywords?` |
| `list_redirects` | List active redirects | — |
| `create_redirect` | Create a redirect | `from_path`, `to_path`, `status_code?` |
| `generate_sitemap` | Generate XML sitemap | — |

### Navigation (6 tools)
| Tool | Description | Parameters |
|------|-------------|------------|
| `get_header_config` | Get active header | — |
| `update_header_config` | Update header | `id`, `config?`, `logo_media_id?` |
| `get_footer_config` | Get active footer | — |
| `update_footer_config` | Update footer | `id`, `config` |
| `list_menu_items` | List menu items | `menu_type` (header/footer/sidebar) |
| `update_menu_item` | Update menu item | `id`, `label?`, `url?`, `sort_order?` |

---

## Implementation Notes

- All tools return `{ success: boolean, data?: any, error?: string }`
- Soft deletes via `deleted_at` column — tools filter by `deleted_at IS NULL` by default
- No JWT auth needed — MCP server runs internally, queries Drizzle directly
- Connection pool shared with LobeHub (single PostgreSQL instance)
- Total: 38 tools across 6 categories
