# Tailwind CSS v4 Configuration

This document outlines the correct configuration and usage patterns for Tailwind CSS v4 in our Next.js frontend.

## Overview

Tailwind CSS v4 introduces significant changes from v3, including new package names, different configuration syntax, and updated import methods. This guide ensures consistent implementation across the project.

## Key Differences from v3

| Feature | Tailwind CSS v3 | Tailwind CSS v4 |
| ------- | --------------- | --------------- |
| Package name | `tailwindcss` | Both `tailwindcss` and `@tailwindcss/postcss` |
| PostCSS config syntax | Array format: `plugins: ["tailwindcss", "autoprefixer"]` | Object format: `plugins: { "@tailwindcss/postcss": {} }` |
| CSS import syntax | Directives: `@tailwind base; @tailwind components; @tailwind utilities;` | Import statement: `@import "tailwindcss";` |

## Correct Configuration

### 1. Package Installation

Install the required packages:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2. PostCSS Configuration

Create a `postcss.config.mjs` file with the following content:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 3. Tailwind CSS Import

In your global CSS file (`src/app/globals.css`):

```css
@import "tailwindcss";
```

### 4. Tailwind Configuration File

The `tailwind.config.ts` file structure remains similar to v3, but should specify content paths for your project:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Other configuration options...
};

export default config;
```

## Common Pitfalls

1. **Mixed Configurations**: Avoid mixing v3 and v4 patterns, especially in PostCSS config.
2. **Incorrect Plugin Name**: Use `@tailwindcss/postcss` instead of `tailwindcss` in PostCSS config.
3. **Array vs. Object Syntax**: PostCSS config in v4 uses object syntax for plugins, not array syntax.
4. **Old Directives**: Using `@tailwind` directives instead of the new `@import` syntax.

## Testing Configuration

### Automated Testing

We have implemented tests to verify correct Tailwind configuration:

```typescript
// Check PostCSS config
expect(configContent).toMatch(/@tailwindcss\/postcss/);
expect(configContent).toMatch(/plugins\s*:\s*{/);

// Check CSS import syntax
expect(cssContent).toMatch(/@import\s+["']tailwindcss["']/);
```

### Visual Testing

For visual verification:
1. Run the development server: `npm run dev`
2. Visit `/tailwind-test` page
3. Check the `TailwindVerifier` component for runtime style verification

## Troubleshooting

If Tailwind styles aren't being applied:

1. Verify PostCSS config format (object vs. array)
2. Check CSS import syntax
3. Ensure both `tailwindcss` and `@tailwindcss/postcss` packages are installed
4. Restart the development server

## References

- [Official Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Next.js Integration Guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs)