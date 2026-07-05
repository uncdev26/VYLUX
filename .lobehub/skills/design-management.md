# Design Management Skill

## Token Operations

### Get All Tokens
```
GET /api/design/tokens
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": [
      { "key": "colors", "value": { "primary": "#3B82F6" }, "updatedAt": "2025-01-01T00:00:00Z" }
    ]
  }
}
```

### Get Token by Key
```
GET /api/design/tokens/:key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": { "key": "colors", "value": { "primary": "#3B82F6" }, "updatedAt": "2025-01-01T00:00:00Z" }
  }
}
```

### Create Token
```
POST /api/design/tokens
{
  "key": "colors",
  "value": { "primary": "#3B82F6" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": { "key": "colors", "value": { "primary": "#3B82F6" }, "createdAt": "2025-01-01T00:00:00Z" }
  }
}
```

### Update Token
```
PUT /api/design/tokens/:key
{
  "value": { "primary": "#00FF00" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": { "key": "colors", "value": { "primary": "#00FF00" }, "updatedAt": "2025-01-01T00:00:00Z" }
  }
}
```

### Delete Token
```
DELETE /api/design/tokens/:key
```

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

## Error Handling

### Error Response Format
All API errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Token with key 'colors' not found",
    "details": {}
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `TOKEN_NOT_FOUND` | 404 | Token key does not exist |
| `TOKEN_ALREADY_EXISTS` | 409 | Token key already in use |
| `INVALID_TOKEN_VALUE` | 400 | Value fails validation |
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Handling Errors in Code
```svelte
<script>
  import { designApi } from '$lib/api/design';
  import { toast } from '$lib/stores/toast';

  async function updateToken(key, value) {
    try {
      const result = await designApi.updateToken(key, value);
      toast.success('Token updated');
      return result;
    } catch (error) {
      if (error.code === 'TOKEN_NOT_FOUND') {
        toast.error('Token not found');
      } else if (error.code === 'INVALID_TOKEN_VALUE') {
        toast.error('Invalid token value: ' + error.message);
      } else {
        toast.error('Failed to update token');
      }
      throw error;
    }
  }
</script>
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
