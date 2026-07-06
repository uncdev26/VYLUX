---
const siteUrl = Astro.site?.toString() || 'http://localhost:4321';
---

User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}sitemap.xml
