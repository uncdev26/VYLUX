-- Seed: default design tokens

-- Colors
INSERT INTO design_tokens (name, category, value, description) VALUES
('primary', 'color', '{"hex": "#2563eb", "rgb": "37, 99, 235", "hsl": "221, 83%, 53%"}', 'Primary brand color'),
('primary-light', 'color', '{"hex": "#60a5fa", "rgb": "96, 165, 250", "hsl": "217, 91%, 68%"}', 'Primary light variant'),
('primary-dark', 'color', '{"hex": "#1d4ed8", "rgb": "29, 78, 216", "hsl": "224, 72%, 48%"}', 'Primary dark variant'),
('secondary', 'color', '{"hex": "#7c3aed", "rgb": "124, 58, 237", "hsl": "262, 83%, 58%"}', 'Secondary brand color'),
('accent', 'color', '{"hex": "#06b6d4", "rgb": "6, 182, 212", "hsl": "189, 94%, 43%"}', 'Accent color'),
('background', 'color', '{"hex": "#ffffff", "rgb": "255, 255, 255", "hsl": "0, 0%, 100%"}', 'Page background'),
('surface', 'color', '{"hex": "#f8fafc", "rgb": "248, 250, 252", "hsl": "210, 40%, 98%"}', 'Surface/card background'),
('text-primary', 'color', '{"hex": "#0f172a", "rgb": "15, 23, 42", "hsl": "222, 47%, 11%"}', 'Primary text color'),
('text-secondary', 'color', '{"hex": "#64748b", "rgb": "100, 116, 139", "hsl": "215, 16%, 47%"}', 'Secondary text color'),
('text-muted', 'color', '{"hex": "#94a3b8", "rgb": "148, 163, 184", "hsl": "213, 18%, 65%"}', 'Muted text color'),
('border', 'color', '{"hex": "#e2e8f0", "rgb": "226, 232, 240", "hsl": "214, 32%, 91%"}', 'Default border color'),
('success', 'color', '{"hex": "#16a34a", "rgb": "22, 163, 74", "hsl": "142, 71%, 36%"}', 'Success state'),
('warning', 'color', '{"hex": "#d97706", "rgb": "217, 119, 6", "hsl": "38, 95%, 44%"}', 'Warning state'),
('error', 'color', '{"hex": "#dc2626", "rgb": "220, 38, 38", "hsl": "0, 84%, 51%"}', 'Error state'),
('info', 'color', '{"hex": "#2563eb", "rgb": "37, 99, 235", "hsl": "221, 83%, 53%"}', 'Info state');

-- Typography
INSERT INTO design_tokens (name, category, value, description) VALUES
('font-family-sans', 'typography', '{"family": "Inter", "fallback": "system-ui, -apple-system, sans-serif"}', 'Primary sans-serif font'),
('font-family-heading', 'typography', '{"family": "Plus Jakarta Sans", "fallback": "Inter, system-ui, sans-serif"}', 'Heading font'),
('font-family-mono', 'typography', '{"family": "JetBrains Mono", "fallback": "Fira Code, monospace"}', 'Monospace font'),
('text-xs', 'typography', '{"size": "0.75rem", "lineHeight": "1rem", "letterSpacing": "0"}', 'Extra small text'),
('text-sm', 'typography', '{"size": "0.875rem", "lineHeight": "1.25rem", "letterSpacing": "0"}', 'Small text'),
('text-base', 'typography', '{"size": "1rem", "lineHeight": "1.5rem", "letterSpacing": "0"}', 'Base text'),
('text-lg', 'typography', '{"size": "1.125rem", "lineHeight": "1.75rem", "letterSpacing": "0"}', 'Large text'),
('text-xl', 'typography', '{"size": "1.25rem", "lineHeight": "1.75rem", "letterSpacing": "-0.01em"}', 'Extra large text'),
('text-2xl', 'typography', '{"size": "1.5rem", "lineHeight": "2rem", "letterSpacing": "-0.02em"}', '2x large text'),
('text-3xl', 'typography', '{"size": "1.875rem", "lineHeight": "2.25rem", "letterSpacing": "-0.02em"}', '3x large text'),
('text-4xl', 'typography', '{"size": "2.25rem", "lineHeight": "2.5rem", "letterSpacing": "-0.03em"}', '4x large heading'),
('font-weight-normal', 'typography', '{"weight": "400"}', 'Normal weight'),
('font-weight-medium', 'typography', '{"weight": "500"}', 'Medium weight'),
('font-weight-semibold', 'typography', '{"weight": "600"}', 'Semibold weight'),
('font-weight-bold', 'typography', '{"weight": "700"}', 'Bold weight');

-- Spacing
INSERT INTO design_tokens (name, category, value, description) VALUES
('space-0', 'spacing', '{"value": "0"}', 'Zero spacing'),
('space-1', 'spacing', '{"value": "0.25rem"}', '4px spacing'),
('space-2', 'spacing', '{"value": "0.5rem"}', '8px spacing'),
('space-3', 'spacing', '{"value": "0.75rem"}', '12px spacing'),
('space-4', 'spacing', '{"value": "1rem"}', '16px spacing'),
('space-5', 'spacing', '{"value": "1.25rem"}', '20px spacing'),
('space-6', 'spacing', '{"value": "1.5rem"}', '24px spacing'),
('space-8', 'spacing', '{"value": "2rem"}', '32px spacing'),
('space-10', 'spacing', '{"value": "2.5rem"}', '40px spacing'),
('space-12', 'spacing', '{"value": "3rem"}', '48px spacing'),
('space-16', 'spacing', '{"value": "4rem"}', '64px spacing'),
('space-20', 'spacing', '{"value": "5rem"}', '80px spacing'),
('space-24', 'spacing', '{"value": "6rem"}', '96px spacing');

-- Shadows
INSERT INTO design_tokens (name, category, value, description) VALUES
('shadow-sm', 'shadow', '{"value": "0 1px 2px 0 rgb(0 0 0 / 0.05)"}', 'Small shadow'),
('shadow-md', 'shadow', '{"value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"}', 'Medium shadow'),
('shadow-lg', 'shadow', '{"value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"}', 'Large shadow'),
('shadow-xl', 'shadow', '{"value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"}', 'Extra large shadow'),
('shadow-2xl', 'shadow', '{"value": "0 25px 50px -12px rgb(0 0 0 / 0.25)"}', '2x large shadow'),
('shadow-inner', 'shadow', '{"value": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"}', 'Inner shadow'),
('shadow-none', 'shadow', '{"value": "0 0 #0000"}', 'No shadow');

-- Border radius
INSERT INTO design_tokens (name, category, value, description) VALUES
('radius-none', 'border', '{"value": "0"}', 'No radius'),
('radius-sm', 'border', '{"value": "0.125rem"}', 'Small radius'),
('radius-md', 'border', '{"value": "0.375rem"}', 'Medium radius'),
('radius-lg', 'border', '{"value": "0.5rem"}', 'Large radius'),
('radius-xl', 'border', '{"value": "0.75rem"}', 'Extra large radius'),
('radius-2xl', 'border', '{"value": "1rem"}', '2x large radius'),
('radius-full', 'border', '{"value": "9999px"}', 'Full/pill radius');

-- Breakpoints
INSERT INTO design_tokens (name, category, value, description) VALUES
('breakpoint-sm', 'breakpoint', '{"value": "640px", "min": "640px"}', 'Small screens (mobile landscape)'),
('breakpoint-md', 'breakpoint', '{"value": "768px", "min": "768px"}', 'Medium screens (tablet)'),
('breakpoint-lg', 'breakpoint', '{"value": "1024px", "min": "1024px"}', 'Large screens (desktop)'),
('breakpoint-xl', 'breakpoint', '{"value": "1280px", "min": "1280px"}', 'Extra large screens'),
('breakpoint-2xl', 'breakpoint', '{"value": "1536px", "min": "1536px"}', '2x large screens');
