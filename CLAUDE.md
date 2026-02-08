# CLAUDE.md — NextGen Analytics Portal

## Project Overview

A next-generation dashboard and reporting portal (Next.js 14 + TypeScript) featuring glassmorphism UI, animated charts, and AI-powered insights. Dark-mode only. All data is currently hardcoded sample data — ready for backend API integration.

## Tech Stack

- **Framework:** Next.js 14.2 (App Router), React 18.3, TypeScript 5.3 (strict mode)
- **Styling:** Tailwind CSS 3.4 (dark mode via `class` strategy), clsx + tailwind-merge, class-variance-authority
- **Animation:** Framer Motion 11
- **Charts:** Recharts 2.12
- **Icons:** Lucide React
- **State:** Zustand 4.5 (included, not yet used), SWR 2.2.5 (included, not yet used)
- **Utilities:** date-fns 3.3
- **Node:** >=18.17.0, npm >=9.0.0

## Commands

```bash
npm run dev          # Start dev server (next dev)
npm run build        # Production build (next build)
npm run start        # Start production server (next start)
npm run lint         # Run ESLint (next lint)
npm run type-check   # TypeScript check (tsc --noEmit)
```

Install dependencies first with `npm install`. There is no test runner configured.

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (Sidebar + main area)
│   ├── page.tsx                # / — Executive Dashboard (home)
│   ├── globals.css             # Global styles + Tailwind imports
│   ├── finance/page.tsx        # /finance — Finance Dashboard
│   ├── sales/page.tsx          # /sales — Sales Dashboard
│   ├── insights/page.tsx       # /insights — AI Insights Center
│   ├── reports/page.tsx        # /reports — Auto Reporting Studio
│   ├── hr/page.tsx             # /hr — Coming Soon placeholder
│   ├── inventory/page.tsx      # /inventory — Coming Soon placeholder
│   └── procurement/page.tsx    # /procurement — Coming Soon placeholder
├── components/
│   ├── ui/                     # Core UI primitives
│   │   ├── Button.tsx          # Button with variants (primary/secondary/ghost/danger)
│   │   ├── GlassCard.tsx       # Glassmorphism card (base container)
│   │   └── MetricCard.tsx      # KPI card with count-up animation
│   ├── charts/
│   │   ├── AnimatedLineChart.tsx  # Recharts Line/Area chart wrapper
│   │   └── RadialProgress.tsx     # SVG circular progress ring
│   ├── ai/
│   │   ├── AIInsightBubble.tsx # AI insight with typewriter effect
│   │   └── AIInsightPanel.tsx  # Slide-in AI chat side panel
│   └── layout/
│       ├── DashboardHeader.tsx # Page header with time range filters
│       └── Sidebar.tsx         # Fixed sidebar navigation (264px)
├── hooks/
│   ├── useCountUp.ts           # Animated number counting hook
│   └── useTypewriter.ts        # Character-by-character typing hook
├── lib/
│   ├── utils.ts                # cn(), formatCurrency(), formatPercent(), debounce(), etc.
│   ├── design-tokens.ts        # Design system constants (colors, spacing, typography)
│   └── animations.ts           # Framer Motion preset variants
└── types/
    ├── dashboard.ts            # Dashboard, KPI, Alert, Report types
    └── charts.ts               # Chart component prop types
```

## Architecture & Conventions

### File & Naming

- **Components:** PascalCase filenames and exports (`GlassCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useCountUp.ts`)
- **Utilities/config:** kebab-case (`design-tokens.ts`)
- **Types:** PascalCase interfaces (`MetricCardProps`, `KPI`)
- **Path alias:** `@/*` maps to `./src/*` (configured in tsconfig.json)

### Component Pattern

Every component follows this structure:

1. Imports — React/Next.js, then third-party, then local (`@/components`, `@/lib`, `@/hooks`, `@/types`)
2. Props interface definition
3. Constants / config data
4. Component function (default export or named export)

### Styling Rules

- **Tailwind-first** — use utility classes directly; avoid CSS modules or inline styles
- **Class merging** — always use `cn()` from `@/lib/utils` to merge conditional classes
- **Dark mode only** — the `dark` class is applied globally on `<html>`; no light mode support
- **Glassmorphism** — cards use `bg-glass-card backdrop-blur-xl border border-glass-border`
- **Custom colors** are defined in `tailwind.config.ts` under `colors` (bg-primary, accent-primary, status-success, etc.)
- **Custom CSS utilities** (`.glass-effect`, `.custom-scrollbar`) are defined in `globals.css`

### Color System (from tailwind.config.ts)

| Token             | Value       | Usage                      |
|--------------------|-------------|----------------------------|
| `bg-primary`       | `#0D0E12`   | Page background            |
| `bg-secondary`     | `#14151C`   | Section background         |
| `bg-tertiary`      | `#1A1B24`   | Card/elevated surfaces     |
| `accent-primary`   | `#4A96FF`   | Primary interactive color  |
| `accent-secondary` | `#00D1B2`   | Secondary accent           |
| `accent-tertiary`  | `#A78BFA`   | Tertiary accent            |
| `status-success`   | `#41E1A2`   | Positive/success states    |
| `status-warning`   | `#FFB84D`   | Warning states             |
| `status-error`     | `#FF5C5C`   | Error/danger states        |
| `status-info`      | `#6EC5FF`   | Informational states       |

### Animation Patterns

- **Page load:** Components fade-in + slide-up via Framer Motion (presets in `@/lib/animations.ts`)
- **Lists:** Staggered children with 0.1s delay using `staggerContainer`/`staggerItem` variants
- **Buttons:** `whileHover: { scale: 1.02 }`, `whileTap: { scale: 0.98 }`
- **Cards:** `whileHover: { y: -4 }` with shadow enhancement
- **Charts:** 1200ms draw animation, 100ms stagger between lines
- **Numbers:** Count-up from 0 using `useCountUp` hook (800ms, easeOutCubic)
- **AI text:** Typewriter effect at 20ms/char using `useTypewriter` hook
- Use animation presets from `@/lib/animations.ts` rather than defining inline variants

### Type Definitions

All shared types live in `src/types/`. Key types:

- `KPI` — id, title, value, unit, change, trend, icon, description
- `AIInsight` — id, type (info/warning/success/alert), title, content, timestamp
- `Alert` — id, type (warning/error/info/success), title, description
- `DashboardData` — kpis[], trends[], insights[], alerts[]
- `TimeRange` — `'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'`
- `ReportConfig` — type, period, language, sections[], format

### Responsive Breakpoints

- Mobile: default (single column)
- Tablet (md): 768px — 2-column grids
- Desktop (lg): 1024px — 3-4 column grids
- Pattern: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

## Key Decisions & Constraints

1. **No backend yet** — all dashboard data is hardcoded in page components. API integration is planned (see IMPLEMENTATION_GUIDE.md).
2. **No test suite** — no testing framework is configured.
3. **No light mode** — dark mode only by design.
4. **No authentication** — no auth layer exists.
5. **Sidebar is always visible** — 264px fixed, no collapse/responsive hamburger menu.
6. **Three placeholder pages** (HR, Inventory, Procurement) show "Coming Soon" status.

## Adding New Features

### New Dashboard Page

1. Create `src/app/<name>/page.tsx`
2. Add a `'use client'` directive at the top
3. Import `DashboardHeader`, `GlassCard`, `MetricCard`, and chart components
4. Define sample KPI data and chart data arrays
5. Add the route to the Sidebar navigation in `src/components/layout/Sidebar.tsx`
6. Add any new types to `src/types/dashboard.ts`

### New Reusable Component

1. Place in the appropriate `src/components/<category>/` directory
2. Define a `Props` interface
3. Use `cn()` for class merging; use design tokens for colors/spacing
4. Add Framer Motion animation using presets from `@/lib/animations.ts`
5. Export as default

### New Chart Type

1. Create in `src/components/charts/`
2. Use Recharts as the rendering library
3. Define props type in `src/types/charts.ts`
4. Follow the pattern in `AnimatedLineChart.tsx` — custom tooltip, consistent axis styling, animation

## Configuration Reference

| File                | Purpose                                         |
|---------------------|-------------------------------------------------|
| `tsconfig.json`     | TypeScript strict mode, ES2020 target, `@/*` alias |
| `tailwind.config.ts`| Custom theme colors, fonts, animations, shadows |
| `next.config.js`    | SWC minify, React strict mode, image optimization |
| `postcss.config.js` | Tailwind + Autoprefixer                         |
| `.eslintrc.json`    | Extends `next/core-web-vitals`                  |
| `.gitignore`        | node_modules, .next, .env*, build artifacts     |

## Documentation

- `DESIGN_SPECIFICATION.md` — Full design system specification (colors, typography, components, layouts)
- `IMPLEMENTATION_GUIDE.md` — Backend integration plan, API routes, deployment strategy
- `COMPONENT_LIBRARY.md` — Component API reference with prop tables and usage examples
