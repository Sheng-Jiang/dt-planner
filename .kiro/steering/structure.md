# Project Structure

## Root Directory

```
├── src/                    # Source code
├── public/                 # Static assets
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
├── .kiro/                  # Kiro configuration
└── package.json            # Project configuration
```

## Source Organization (`src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page component
│   └── globals.css        # Global styles
├── components/             # Reusable React components
│   ├── ObjectivePalette.tsx
│   └── StrategyCanvas.tsx
├── types/                  # TypeScript type definitions
│   └── strategy.ts        # Core business types
└── lib/                    # Utility functions and data
```

## Component Architecture

- **Page Components**: Located in `src/app/` following Next.js App Router conventions
- **UI Components**: Reusable components in `src/components/`
- **Type Definitions**: Centralized in `src/types/` with clear interfaces
- **Utilities**: Helper functions and shared logic in `src/lib/`

## Naming Conventions

- **Files**: PascalCase for components (`ObjectivePalette.tsx`)
- **Types**: PascalCase interfaces (`CompanyObjective`)
- **Variables**: camelCase (`showRecommendations`)
- **CSS Classes**: Tailwind utility classes

## Component Patterns

- Client components use `'use client'` directive
- Props interfaces defined inline or imported from types
- Event handlers passed as props with descriptive names (`onAddObjective`, `onUpdateObjective`)
- State management using React hooks (`useState`, `useRef`, `useCallback`)

## File Organization Rules

- One component per file
- Co-locate related types with components when specific to that component
- Shared types go in `src/types/`
- Import paths use `@/` alias for clean imports
