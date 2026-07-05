# Content Management Skill

## Post Operations

### List Posts
```
GET /api/content/posts?status=published
```

### Get Post by Slug
```
GET /api/content/posts/:slug
```

### Create Post
```
POST /api/content/posts
{
  "title": "My Blog Post",
  "content": "Full content here...",
  "excerpt": "Short summary",
  "category_id": "uuid",
  "tags": ["seo", "marketing"],
  "seo_title": "SEO Optimized Title",
  "seo_description": "Meta description for search engines"
}
```

### Update Post
```
PUT /api/content/posts/:id
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

### Publish Post
```
POST /api/content/posts/:id/publish
```

## Page Operations

### List Pages
```
GET /api/content/pages
```

### Create Page
```
POST /api/content/pages
{
  "title": "About Us",
  "content": "Page content...",
  "template": "landing"
}
```

## Category Operations

### List Categories
```
GET /api/content/categories
```

### Create Category
```
POST /api/content/categories
{
  "name": "Technology",
  "description": "Tech related posts"
}
```

## Content Guidelines

1. **SEO Optimization**
   - Include target keyword in title
   - Write compelling meta descriptions
   - Use heading hierarchy (H1 > H2 > H3)
   - Add alt text to images

2. **Readability**
   - Short paragraphs (2-3 sentences)
   - Bullet points for lists
   - Clear subheadings
   - Simple language

3. **Internal Linking**
   - Link to related posts
   - Link to relevant pages
   - Use descriptive anchor text
