# Component Guidelines

## UI Component Library

A comprehensive shadcn/ui-style component library lives in `src/components/ui/` (40 components). These are Taro-adapted versions using `@tarojs/components` (View, Text, etc.) instead of HTML elements.

**CRITICAL**: Always use `@/components/ui/*` for standard UI elements. Never hand-craft buttons, inputs, dialogs, cards, tabs, or other common components with raw View/Text + Tailwind.

Reference: `style-guide.md` for the full component table and selection guide.

### Component Usage Pattern

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@tarojs/components'

<Card>
  <CardContent className="p-4">
    <Button onClick={handleClick}>
      <Text>开始冥想</Text>
    </Button>
  </CardContent>
</Card>
```

### When Components Are Missing

If a needed UI component doesn't exist in `@/components/ui/`:

1. Add it to `src/components/ui/` following the existing pattern (Taro-adapted, uses `cn()`, exports with variants).
2. Then use it from the page.

Anti-pattern: Creating one-off UI components inside page files or business component files.

## Business Components

Reusable business components live in `src/components/` (not in `ui/`):

| Component | File | Purpose |
|-----------|------|---------|
| `MenuItem` | `menu-item.tsx` | List item with icon, label, subtitle, badge, chevron |
| `SelectableCard` | `selectable-card.tsx` | Card with selection state (border + check icon) |
| `WhiteNoiseGrid` | `white-noise-grid.tsx` | 4-column grid of white noise items with emoji icons |

These are composed from UI components:

```tsx
// SelectableCard exports sub-components for composition
import { SelectableCard, SelectableCardIcon, SelectableCardText } from '@/components/selectable-card'

<SelectableCard selected={isSelected} onPress={handleSelect}>
  <SelectableCardIcon>🌙</SelectableCardIcon>
  <SelectableCardText>改善睡眠</SelectableCardText>
</SelectableCard>
```

## Styling Rules

### Tailwind First

All styling uses Tailwind CSS classes. The `cn()` utility (`src/lib/utils.ts`) merges class names:

```tsx
import { cn } from '@/lib/utils'

<View className={cn('rounded-xl p-4', isSelected && 'border-2 border-primary')}>
```

### Design Tokens

Colors are defined as CSS custom properties in `app.css` and mapped to Tailwind tokens:

- `primary`: `#7c6aef` (purple)
- `secondary`: `#2dd4bf` (teal)
- `background`: `#0a0a1a` (near-black navy)
- `muted`: `#1a1a3e`
- `destructive`: red, `success`: green, `warning`: amber

The app is **dark-mode-first** — `:root` and `.dark` blocks have identical values.

### WXSS Compatibility

WeChat WXSS does not support Tailwind's opacity syntax (`bg-primary/20`). Manual opacity utility classes are defined in `app.css`:

```css
.bg-primary-10 { background-color: color-mix(in srgb, var(--primary) 10%, transparent) }
.bg-primary-20 { background-color: color-mix(in srgb, var(--primary) 20%, transparent) }
/* etc. */
```

Use these instead of Tailwind opacity modifiers.

### Anti-Patterns

- Using `w-[340px]`, `text-[14px]`, `p-[16px]` — hardcoded `px` values break cross-platform.
- Using `style={{ width: '200px' }}` — prefer Tailwind classes.
- Using `style` for layout — only use inline styles for cross-platform compatibility fixes (Fixed+Flex, Input wrapping).

## Icon Usage

Icons come from `lucide-react-taro`. Use `color`, `size`, `strokeWidth` props — NOT `className` for coloring:

```tsx
import { House, Settings } from 'lucide-react-taro'

// ✅ Correct
<House size={18} color="#ff0000" className="mr-2" />

// ❌ Wrong — className text-* doesn't affect the SVG stroke
<House className="text-red-500 w-8 h-8" />
```
