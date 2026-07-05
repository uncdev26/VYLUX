/**
 * Lightweight HTML sanitizer for user-supplied content fields.
 * Strips all tags and attributes, preserving plain text only.
 * For richer HTML support later, swap in isomorphic-dompurify.
 */
export function sanitizeHtml(input: unknown): unknown {
  if (typeof input !== 'string') return input;
  // Remove script/style tags and their contents, then strip remaining tags
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Walk an object and sanitize every string property whose key
 * is in the `fields` set.
 */
export function sanitizeFields<T extends Record<string, any>>(
  obj: T,
  fields: string[],
): T {
  const result = { ...obj };
  for (const key of fields) {
    if (key in result) {
      (result as any)[key] = sanitizeHtml(result[key]);
    }
  }
  return result;
}
