# Layout Components

This directory contains reusable layout components that structure pages and sections.

## Purpose

Layout components provide consistent structure and organization across the application:

- Page layouts
- Section wrappers
- Grid systems
- Container components

## Guidelines

1. **Reusable**: Layout components should be generic and reusable
2. **Composable**: Design layouts to be composed together
3. **Named exports**: Always use named exports
4. **Server-first**: Prefer Server Components unless interactivity is needed

## Example

```tsx
// layouts/PageLayout.tsx

export function PageLayout({ children, title, sidebar }: PageLayoutProps) {
  return (
    <div className="container mx-auto">
      <header>
        <h1>{title}</h1>
      </header>
      <div className="flex gap-6">
        {sidebar && <aside>{sidebar}</aside>}
        <main>{children}</main>
      </div>
    </div>
  );
}
```
