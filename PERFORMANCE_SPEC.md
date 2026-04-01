# Performance Optimization Spec

## Current State Analysis

The Speed Test App is a Next.js 16.2.1 application deployed on Vercel with:
- Animated canvas background (particles, grid, scanline)
- SVG speed gauge with neon glow effects
- Real-time streaming speed measurements
- PostgreSQL database for result persistence
- i18n support (English, French)
- Cyber-themed CSS animations

## Performance Targets

| Metric | Target | Current (estimated) |
|--------|--------|---------------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~3.5s |
| FCP (First Contentful Paint) | < 1.8s | ~2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.15 |
| TBT (Total Blocking Time) | < 200ms | ~400ms |
| TTI (Time to Interactive) | < 3.8s | ~5s |
| Lighthouse Performance Score | > 90 | ~70 |
| Bundle Size (JS) | < 200KB | ~350KB |
| Image optimization | WebP/AVIF | Not optimized |

## Optimization Areas

### 1. Bundle Size Reduction
- **Remove unused dependencies** (Sentry, Storybook, Chromatic in production)
- **Dynamic imports** for heavy components (CyberBackground canvas, SpeedChart)
- **Tree-shake** unused exports
- **Analyze bundle** with @next/bundle-analyzer

### 2. Rendering Optimization
- **Canvas optimization**: Use `will-change`, reduce particle count on mobile, use `requestAnimationFrame` efficiently
- **CSS animations**: Use `transform` and `opacity` only (GPU-accelerated), avoid layout thrashing
- **React optimization**: Memoize expensive computations in SpeedGauge, avoid unnecessary re-renders
- **Font optimization**: Use `next/font` with `swap`, preload critical fonts

### 3. Network Optimization
- **Image optimization**: Convert any images to WebP/AVIF
- **Preconnect** to external domains (ip-api.com)
- **Resource hints**: Preload critical CSS, prefetch route transitions
- **Compression**: Ensure Brotli/gzip (Vercel handles this)

### 4. Core Web Vitals
- **LCP**: Optimize hero section, preload critical resources
- **CLS**: Set explicit dimensions for all elements, avoid layout shifts
- **TBT**: Defer non-critical JS, use web workers for heavy computation
- **FCP**: Minimize render-blocking resources

### 5. API Performance
- **Edge caching** for static API responses
- **Response compression**
- **Connection pooling** for database

### 6. Mobile Performance
- **Reduce particle count** on mobile (based on screen width)
- **Disable heavy animations** on low-end devices (prefers-reduced-motion)
- **Touch optimization** for interactive elements

## Implementation Plan

### Phase 1: Quick Wins (High Impact, Low Effort)
1. Add `preconnect` links for external resources
2. Optimize canvas particle count based on device
3. Add `prefers-reduced-motion` support
4. Memoize SpeedGauge computations
5. Dynamic import CyberBackground

### Phase 2: Bundle Optimization (High Impact, Medium Effort)
1. Analyze and reduce bundle size
2. Dynamic import heavy components
3. Remove unused dependencies from production build
4. Optimize import paths

### Phase 3: Core Web Vitals (Medium Impact, Medium Effort)
1. Optimize LCP with resource hints
2. Fix CLS issues
3. Reduce TBT with code splitting
4. Add proper image dimensions

### Phase 4: Testing & Validation
1. Run Lighthouse via DevTools MCP
2. Compare before/after metrics
3. Document results

## Success Criteria
- Lighthouse Performance score > 90
- All Core Web Vitals in "good" range
- Bundle size reduced by 30%+
- No regression in speed test accuracy
- Mobile performance comparable to desktop
