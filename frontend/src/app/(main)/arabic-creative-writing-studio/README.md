# Arabic Creative Writing Studio

## Overview

The Arabic Creative Writing Studio is a comprehensive AI-powered creative writing platform integrated into the main Next.js 15 application. It provides Arabic writers with intelligent tools, prompts, and analysis powered by Gemini 2.5 Pro.

## Features

- **Prompt Library**: 114+ curated creative writing prompts across multiple genres
- **Smart Editor**: Intelligent writing editor with real-time statistics
- **AI Analysis**: Text analysis and enhancement powered by Gemini
- **RTL Support**: Full right-to-left text support for Arabic content
- **Settings Panel**: Customizable settings for API integration and preferences

## Architecture

### Directory Structure

```
frontend/src/app/(main)/arabic-creative-writing-studio/
├── page.tsx                    # Route entry point
├── components/
│   ├── CreativeWritingStudio.tsx  # Main container component
│   ├── PromptLibrary.tsx          # Prompt browsing and selection
│   ├── WritingEditor.tsx          # Writing and editing interface
│   └── SettingsPanel.tsx          # Configuration panel
├── lib/
│   ├── gemini-service.ts          # Gemini API service
│   └── data-manager.ts            # Local data management
├── types/
│   └── index.ts                   # TypeScript type definitions
└── README.md                      # This file
```

### Component Architecture

#### Server vs Client Components

- **page.tsx**: Server Component (default) - renders the main entry point
- **CreativeWritingStudio.tsx**: Client Component - manages state and routing
- **PromptLibrary.tsx**: Client Component - interactive prompt selection
- **WritingEditor.tsx**: Client Component - text editing with hooks
- **SettingsPanel.tsx**: Client Component - settings management

All interactive components are marked with `"use client"` directive.

### State Management

The application uses React hooks for local state management:

- `useEffect` for side effects and API initialization
- `useCallback` for memoized callbacks

### API Integration

The Gemini service is initialized with user-provided API key and handles:

- Prompt enhancement
- Connection testing

**Security**: API keys are managed through environment variables and never exposed to the client bundle.

## Development

### Local Setup

1. Install dependencies:

```bash
cd frontend
pnpm install
```

### Set up environment variables

```bash
# Create .env.local in frontend directory
GEMINI_API_KEY=your_api_key_here
```

### Run development server

```bash
pnpm dev
```

#### Access the page at: `http://localhost:3000/arabic-creative-writing-studio`

### Building

```bash
pnpm build
```

### Testing

#### Unit Tests (Vitest)

```bash
pnpm test
```

#### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

## Styling

The application uses:

- **Tailwind CSS**: Utility-first CSS framework
- **Project Tokens**: Colors, spacing, and typography from `tailwind.config.ts`
- **Arabic Fonts**: `Amiri`, `Cairo`, `Tajawal` with proper fallbacks
- **RTL Support**: Automatic text direction handling

## Navigation

The page is accessible via:

- **URL**: `/arabic-creative-writing-studio`
- **Navigation Menu**: "استوديو الكتابة" with Pen icon

## Key Design Decisions

1. **Import Aliases**: All imports use `../` relative paths within the feature directory
2. **Client Components**: Interactive components explicitly marked with `"use client"`
3. **Type Safety**: Full TypeScript coverage with comprehensive type definitions
4. **RTL First**: Built with Arabic content and RTL layout as primary design
5. **API Security**: Gemini API calls handled server-side to protect credentials

## Dependencies

The feature relies on standard Next.js and React dependencies already present in the project:

- `react` ^18.2.0
- `react-dom` ^18.2.0
- `next` ^14.0.0
- `tailwindcss` ^3.3.0

No additional dependencies were added to maintain project consistency.

## Future Enhancements

- [ ] Integration with project UI library components
- [ ] Visual regression tests for RTL layout
- [ ] Server-side API route for Gemini calls
- [ ] Persistent storage with database integration
- [ ] Collaborative writing features
- [ ] Export to multiple formats (PDF, DOCX)

## Contributing

When making changes to this feature:

1. Follow the project's TypeScript and ESLint conventions
2. Maintain RTL support in all UI changes
3. Test with Arabic content
4. Update tests for new functionality
5. Document significant architectural changes

## License

This feature is part of the main project and follows the same license.
