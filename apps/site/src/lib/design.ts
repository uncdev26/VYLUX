// Design tokens utility
// Reads design tokens from DB and generates CSS custom properties
import { db, designTokens } from './db';
import { eq, and, sql } from 'drizzle-orm';

export interface DesignToken {
  id: string;
  name: string;
  category: string;
  value: Record<string, any>;
  description: string | null;
}

/**
 * Fetch all active design tokens from the database
 */
export async function getDesignTokens(): Promise<DesignToken[]> {
  return db
    .select()
    .from(designTokens)
    .where(sql`${designTokens.deletedAt} IS NULL`)
    .orderBy(designTokens.category, designTokens.name);
}

/**
 * Generate CSS custom properties from design tokens
 * Returns a CSS string like:
 *   --color-primary: #3b82f6;
 *   --spacing-md: 16px;
 */
export async function generateCSS(): Promise<string> {
  const tokens = await getDesignTokens();
  const lines: string[] = [];

  for (const token of tokens) {
    const varName = `--${token.category}-${token.name}`;
    const value = formatTokenValue(token);
    if (value) {
      lines.push(`  ${varName}: ${value};`);
    }
  }

  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * Format a token value based on its category
 */
function formatTokenValue(token: DesignToken): string | null {
  const { value, category } = token;

  if (!value || typeof value !== 'object') return null;

  switch (category) {
    case 'color':
      // value: { hex: "#3b82f6" } or { r, g, b, a }
      if (value.hex) return value.hex;
      if (value.r !== undefined) {
        const a = value.a !== undefined ? `, ${value.a}` : '';
        return `rgba(${value.r}, ${value.g}, ${value.b}${a})`;
      }
      return null;

    case 'typography':
      // value: { fontFamily, fontSize, fontWeight, lineHeight }
      return null; // Typography tokens are multi-value, handle separately

    case 'spacing':
      // value: { value: 16, unit: "px" }
      if (value.value !== undefined) {
        return `${value.value}${value.unit || 'px'}`;
      }
      return null;

    case 'shadow':
      // value: { x, y, blur, spread, color }
      if (value.x !== undefined) {
        return `${value.x}px ${value.y}px ${value.blur}px ${value.spread}px ${value.color}`;
      }
      return null;

    case 'border':
      // value: { width, style, color }
      if (value.width !== undefined) {
        return `${value.width}px ${value.style || 'solid'} ${value.color}`;
      }
      return null;

    case 'breakpoint':
      // value: { value: 768, unit: "px" }
      if (value.value !== undefined) {
        return `${value.value}${value.unit || 'px'}`;
      }
      return null;

    default:
      // Generic: try to extract a simple value
      if (typeof value.value === 'string') return value.value;
      if (typeof value.value === 'number') return `${value.value}px`;
      return null;
  }
}
