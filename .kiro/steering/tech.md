# Technology Stack

## Framework & Runtime

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Node.js** runtime environment

## Language & Type Safety

- **TypeScript 5.0+** - Strict mode enabled
- Path aliases configured: `@/*` maps to `./src/*`

## Styling & UI

- **Tailwind CSS 3.4+** with custom color palette
- **PostCSS** with Autoprefixer
- Custom primary color scheme (blue variants: 50, 500, 600, 700)
- **Inter font** from Google Fonts

## Development Tools

- **ESLint** and **TypeScript** for code quality
- **npm** package manager

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Dependencies
npm install          # Install all dependencies
```

## Known Issues

- npm cache permission issues may require: `sudo chown -R $(id -u):$(id -g) ~/.npm`

## Architecture Patterns

- Client-side rendering with 'use client' directives
- Component-based architecture
- TypeScript interfaces for type safety
- Custom hooks for state management
- Event-driven component communication
