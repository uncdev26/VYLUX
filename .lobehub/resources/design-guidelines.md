# Design Guidelines

## Color System

### Primary Palette
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#3B82F6` | Main actions, links |
| `primary-hover` | `#2563EB` | Hover states |
| `primary-active` | `#1D4ED8` | Active/pressed states |

### Neutral Palette
| Token | Value | Usage |
|-------|-------|-------|
| `gray-50` | `#F9FAFB` | Backgrounds |
| `gray-200` | `#E5E7EB` | Borders |
| `gray-500` | `#6B7280` | Secondary text |
| `gray-900` | `#111827` | Primary text |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#10B981` | Positive actions |
| `warning` | `#F59E0B` | Caution states |
| `error` | `#EF4444` | Error states |
| `info` | `#3B82F6` | Informational |

## Typography Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| h1 | 2rem | 700 | Page titles |
| h2 | 1.5rem | 600 | Section headers |
| h3 | 1.25rem | 600 | Subsections |
| body | 1rem | 400 | Body text |
| small | 0.875rem | 400 | Captions |

## Spacing Scale

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Default gap |
| `space-4` | 16px | Section spacing |
| `space-8` | 32px | Large gaps |
| `space-12` | 48px | Page margins |

## Accessibility Requirements

- **Contrast Ratio:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States:** All interactive elements must have visible focus indicators
- **Touch Targets:** Minimum 44x44px for mobile
- **Alt Text:** All images require descriptive alt text
- **ARIA Labels:** Use semantic HTML and ARIA where needed
