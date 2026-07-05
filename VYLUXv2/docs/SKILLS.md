# VYLUX Skills

## How Skills Work in LobeHub

Skills are markdown files that give agents specific capabilities. They're loaded as context when an agent needs to perform a task. No code required — just clear instructions.

---

## Core Skills

### blog-write.md
```markdown
# Blog Writing Skill

## Purpose
Create SEO-optimized blog posts from a topic or brief.

## Workflow
1. **Research**: Use web search to find trending angles, competitor content, and keyword opportunities
2. **Outline**: Create a structured outline with H2/H3 headings
3. **Write**: Generate the full post (1500-3000 words)
4. **Optimize**: Add meta title (50-60 chars), meta description (150-160 chars), primary/secondary keywords
5. **Preview**: Show the post to the user
6. **Save**: Use `create_post` MCP tool to save to CMS database
7. **Publish**: Use `publish_post` when approved

## SEO Checklist
- [ ] Primary keyword in title, H1, first paragraph
- [ ] Secondary keywords in H2/H3 headings
- [ ] Meta description includes CTA
- [ ] Internal links to related content
- [ ] Image alt text includes keywords
- [ ] URL slug is clean and keyword-rich
- [ ] Schema.org markup for Article type

## Brand Rules
- Follow the brand guidelines in resources/brand-guidelines.md
- Use the design tokens from the design system
- Maintain consistent tone of voice
```

### page-generate.md
```markdown
# Page Generation Skill

## Purpose
Create complete HTML pages from a description. NO templates — full creative freedom.

## Workflow
1. **Understand**: Ask what the page is for (landing, about, services, etc.)
2. **Research**: Look at competitor pages for inspiration
3. **Design**: Choose layout, colors from design tokens, typography
4. **Generate**: Create complete HTML/CSS with inline styles
5. **Brand**: Apply brand colors, fonts, logo from design system
6. **Preview**: Show the page to the user
7. **Iterate**: Refine based on feedback
8. **Save**: Use `create_page` MCP tool

## Rules
- NEVER use templates or pre-built blocks
- Generate complete HTML — not JSON blocks
- Only enforce branding rules (colors, fonts, tone, logo)
- AI decides layout, design, and content structure
- Pages stored as raw HTML in CMS database
- Mobile-first responsive design
- Include Schema.org markup where relevant
```

### seo-audit.md
```markdown
# SEO Audit Skill

## Purpose
Analyze content for SEO issues and suggest improvements.

## Audit Checklist
1. **Title Tag**: 50-60 chars, includes primary keyword
2. **Meta Description**: 150-160 chars, compelling CTA
3. **Heading Structure**: One H1, logical H2/H3 hierarchy
4. **Keyword Density**: 1-2% for primary keyword
5. **Internal Links**: At least 2-3 to related content
6. **External Links**: 1-2 to authoritative sources
7. **Image Alt Text**: All images have descriptive alt text
8. **URL Structure**: Clean, keyword-rich slugs
9. **Schema.org**: Article, FAQ, or Product markup as appropriate
10. **Mobile**: Content renders well on mobile

## Output Format
For each issue found:
- **Issue**: What's wrong
- **Impact**: High/Medium/Low
- **Fix**: Specific suggestion to fix it
```

### form-build.md
```markdown
# Form Building Skill

## Purpose
Create forms from business goals with conditional logic.

## Form Types
- **Contact**: Name, email, phone, message
- **Lead Capture**: Name, email, company, interest area
- **Feedback**: Rating, comments, NPS
- **Registration**: Full details, preferences
- **Calculator**: Input fields → calculated result

## Workflow
1. **Goal**: Understand what the form should achieve
2. **Fields**: Design the field list
3. **Logic**: Add conditional fields (show/hide based on answers)
4. **Validation**: Set required fields, format validation
5. **Create**: Use `create_form` MCP tool
6. **Embed**: Provide embed code or link
```

### funnel-build.md
```markdown
# Funnel Building Skill

## Purpose
Create complete sales funnels from landing page to conversion.

## Funnel Components
1. **Landing Page**: Value proposition + CTA (use page-generate skill)
2. **Lead Form**: Capture contact info (use form-build skill)
3. **Thank You Page**: Confirmation + next steps
4. **Email Sequence**: Drip emails (optional)
5. **Analytics**: Track conversions at each step

## Workflow
1. **Goal**: Lead gen, product sale, webinar registration, etc.
2. **Audience**: Who is this for?
3. **Offer**: What's the value proposition?
4. **Design**: Create landing page + form
5. **Track**: Set up conversion tracking
6. **Optimize**: Monitor drop-off, A/B test
```

### content-research.md
```markdown
# Content Research Skill

## Purpose
Research topics and create content briefs for the Content Agent.

## Workflow
1. **Search**: Use web search to find relevant sources
2. **Analyze**: Identify key themes, data points, expert quotes
3. **Compete**: Check what competitors have published on the topic
4. **Brief**: Create a structured content brief:
   - Target keyword + search volume
   - Suggested title options
   - Key points to cover
   - Sources to cite
   - Content gap analysis
   - Recommended word count
```
