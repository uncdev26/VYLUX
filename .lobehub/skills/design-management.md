# Design Management Skill

## Token Operations

### Get All Tokens
```
GET /api/design/tokens
```

### Get Token by Key
```
GET /api/design/tokens/:key
```

### Create Token
```
POST /api/design/tokens
{
  "key": "colors",
  "value": { "primary": "#3B82F6" }
}
```

### Update Token
```
PUT /api/design/tokens/:key
{
  "value": { "primary": "#00FF00" }
}
```

### Delete Token
```
DELETE /api/design/tokens/:key
```

## Component Patterns

### Button Component
```svelte
<Button variant="primary" size="md" onclick={handler}>
  Click me
</Button>
```

### Input Component
```svelte
<Input
  type="text"
  label="Email"
  placeholder="Enter email"
  bind:value={email}
  error={emailError}
/>
```

### Card Component
```svelte
<Card variant="elevated" padding="md">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

## Design Principles

1. **Consistency**: Always use design tokens
2. **Accessibility**: WCAG AA compliance minimum
3. **Responsiveness**: Mobile-first approach
4. **Performance**: Minimal JavaScript footprint
