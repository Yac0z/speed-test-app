# Constitution

## Project Principles

### Core Values
1. **Performance First** - The speed test app must deliver accurate, reliable measurements with minimal overhead
2. **User Experience** - Clean, intuitive interface with real-time visual feedback during tests
3. **Data Privacy** - All speed test data stays local by default; no data collection without explicit consent
4. **Accessibility** - WCAG 2.1 AA compliant, works across all modern browsers and devices

### Development Standards
1. **Type Safety** - Strict TypeScript with no `any` types
2. **Component Architecture** - Small, focused, reusable components with clear interfaces
3. **Testing** - Unit tests for utilities, integration tests for API routes, E2E tests for critical user flows
4. **Code Quality** - Linted with ESLint, formatted with Prettier, zero linting errors in CI
5. **Documentation** - All public APIs and complex logic documented

### Technical Constraints
1. **Framework** - Next.js 16 with App Router
2. **Styling** - Tailwind CSS 4
3. **Language** - TypeScript (strict mode)
4. **Database** - DrizzleORM with PGlite (local) / Neon (production)
5. **State Management** - React hooks and context, no external state libraries unless necessary
6. **No Heavy Dependencies** - Prefer native APIs and lightweight libraries

### Performance Requirements
1. **Lighthouse Score** - 90+ on Performance, Accessibility, Best Practices, SEO
2. **Initial Load** - Under 2 seconds on 3G
3. **Speed Test Accuracy** - Within 5% of industry-standard tools
4. **Real-time Updates** - 60fps animations during test execution
