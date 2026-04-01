# Ads Integration Documentation

Complete guide for managing, configuring, and extending the advertising system in Speed Test App.

## Table of Contents

1. [Overview](#1-overview)
2. [Configuring Google AdSense](#2-configuring-google-adsense)
3. [AdSlot Component API](#3-adslot-component-api)
4. [Current Ad Placements](#4-current-ad-placements)
5. [Adding New Ad Placements](#5-adding-new-ad-placements)
6. [GDPR Consent Banner](#6-gdpr-consent-banner)
7. [Ad Performance Optimization](#7-ad-performance-optimization)
8. [Alternative Ad Networks](#8-alternative-ad-networks)
9. [Ad Size and Format Guide](#9-ad-size-and-format-guide)
10. [Testing: Development vs Production](#10-testing-development-vs-production)
11. [Compliance Requirements](#11-compliance-requirements)

---

## 1. Overview

The ad infrastructure consists of four core components:

| Component | File | Purpose |
|-----------|------|---------|
| **AdConfig** | `src/config/SiteConfig.ts` | Central configuration for ad slots, publisher ID, and enable/disable toggle |
| **AdScript** | `src/components/ads/AdScript.tsx` | Dynamically loads the Google AdSense script into `<head>` |
| **AdSlot** | `src/components/ads/AdSlot.tsx` | Renders individual ad units with format-specific sizing |
| **AdConsentBanner** | `src/components/ads/AdConsentBanner.tsx` | GDPR-compliant consent banner with accept/decline flow |

**Architecture flow:**

```
Root Layout (layout.tsx)
├── AdScript (loads adsbygoogle.js once)
├── AdConsentBanner (shows if no consent stored)
└── Pages
    ├── SpeedTestDashboard (sidebar ad)
    └── IndexPage (footer ad)
```

Ads are **disabled by default**. Set `NEXT_PUBLIC_ADS_ENABLED=true` and provide a valid `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` to activate.

---

## 2. Configuring Google AdSense

### Environment Variables

Add these to `.env.local` (development) or your hosting platform's environment settings (production):

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_ADS_ENABLED` | Yes | Master toggle for all ads | `true` |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | Yes | Your AdSense publisher ID (without `ca-` prefix) | `pub-1234567890123456` |
| `NEXT_PUBLIC_AD_SLOT_LEADERBOARD` | No | Ad unit ID for leaderboard (728x90) | `1234567890` |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | No | Ad unit ID for sidebar (300x250) | `0987654321` |
| `NEXT_PUBLIC_AD_SLOT_IN_CONTENT` | No | Ad unit ID for in-content (336x280) | `1122334455` |
| `NEXT_PUBLIC_AD_SLOT_MOBILE_BANNER` | No | Ad unit ID for mobile banner (320x50) | `5566778899` |
| `NEXT_PUBLIC_AD_SLOT_FOOTER` | No | Ad unit ID for footer placement | `9988776655` |

### Setup Steps

1. **Create a Google AdSense account** at https://www.google.com/adsense

2. **Get your Publisher ID** from AdSense dashboard (looks like `pub-1234567890123456`)

3. **Create ad units** in AdSense for each placement:
   - Go to **Ads > By ad unit > Display ads**
   - Create units matching the sizes in the [Ad Size Guide](#9-ad-size-and-format-guide)
   - Copy the **Ad unit ID** (the numeric portion after `slot=`)

4. **Add environment variables** to `.env.local`:

```env
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=pub-1234567890123456
NEXT_PUBLIC_AD_SLOT_LEADERBOARD=1234567890
NEXT_PUBLIC_AD_SLOT_SIDEBAR=0987654321
NEXT_PUBLIC_AD_SLOT_FOOTER=9988776655
```

5. **Register your domain** in AdSense (required for production)

6. **Wait for approval** (typically 1-2 weeks for new accounts)

### Configuration Reference

The `AdConfig` object in `src/config/SiteConfig.ts` defines all slot metadata:

```typescript
export const AdConfig = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  googleAdSense: {
    id: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
  },
  slots: {
    leaderboard: { id: '...', format: 'horizontal', size: '728x90' },
    sidebar:     { id: '...', format: 'vertical',   size: '300x250' },
    inContent:   { id: '...', format: 'rectangle',  size: '336x280' },
    mobileBanner:{ id: '...', format: 'horizontal', size: '320x50' },
  },
};
```

---

## 3. AdSlot Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `slotId` | `string` | Yes | - | The AdSense ad unit ID (numeric string from AdSense dashboard) |
| `format` | `'horizontal' \| 'vertical' \| 'rectangle'` | No | `'rectangle'` | Ad format that determines size and responsive behavior |
| `className` | `string` | No | `''` | Additional Tailwind CSS classes for positioning |

### Usage Examples

**Basic sidebar ad (vertical):**

```tsx
import { AdSlot } from '@/components/ads/AdSlot';

<AdSlot
  slotId={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR ?? ''}
  format="vertical"
  className="mx-auto"
/>
```

**Full-width footer banner (horizontal):**

```tsx
<AdSlot
  slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''}
  format="horizontal"
  className="mx-auto mb-8 mt-8 max-w-4xl"
/>
```

**In-content rectangle:**

```tsx
<AdSlot
  slotId={process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT ?? ''}
  format="rectangle"
  className="my-6"
/>
```

### Behavior

- **Auto-hides** when `AdConfig.enabled` is `false` (returns `null`)
- **Pushes to `adsbygoogle` queue** on mount via `useEffect`
- **Prevents double-loading** using `hasLoadedRef`
- **Graceful failure** - catches and silently ignores ad load errors
- **Accessible** - includes `aria-label="Advertisement"` and `role="complementary"`

### Size Mapping

| Format | Width | Height | Responsive |
|--------|-------|--------|------------|
| `horizontal` | `100%` (min `320px`) | `90px` | `data-full-width-responsive="true"` |
| `vertical` | `300px` | `250px` | Fixed |
| `rectangle` | `336px` (max `100%`) | `280px` | Max-width constrained |

---

## 4. Current Ad Placements

### Sidebar Ad

**Location:** `src/components/speed-test/SpeedTestDashboard.tsx:275-279`

**Position:** Right sidebar, below the ISP info panel, above recent test history.

**Format:** Vertical (300x250)

**Layout context:**

```
+---------------------------------------------------+
|                    Speed Test                     |
+--------------------------+------------------------+
|                          |  [ISP Info Panel]      |
|    Speed Gauge           |                        |
|    + Controls            |  +------------------+  |
|    + Results             |  |   SIDEBAR AD     |  |
|                          |  |   300x250        |  |
|                          |  +------------------+  |
|                          |                        |
|                          |  [Recent Tests]        |
+--------------------------+------------------------+
```

**Responsive behavior:** On mobile (`lg` breakpoint and below), the sidebar stacks below the main content. The ad remains visible but may need viewport consideration.

### Footer Ad

**Location:** `src/app/[locale]/(marketing)/page.tsx:24-28`

**Position:** Below the SpeedTestDashboard, centered with max-width constraint.

**Format:** Horizontal (leaderboard)

**Layout context:**

```
+---------------------------------------------------+
|                SpeedTestDashboard                 |
+---------------------------------------------------+
|                                                   |
|         +---------------------------+             |
|         |      FOOTER AD 728x90     |             |
|         +---------------------------+             |
|                                                   |
+---------------------------------------------------+
```

**Responsive behavior:** `max-w-4xl` constraint ensures the ad does not stretch on ultrawide displays. The `mx-auto` centers it.

---

## 5. Adding New Ad Placements

### Step 1: Define the Slot in AdConfig

Add a new entry to `src/config/SiteConfig.ts`:

```typescript
slots: {
  // ... existing slots
  stickyBottom: {
    id: process.env.NEXT_PUBLIC_AD_SLOT_STICKY_BOTTOM || '',
    format: 'horizontal',
    size: '728x90',
  },
},
```

### Step 2: Add Environment Variable

Add to `.env.local` and production environment:

```env
NEXT_PUBLIC_AD_SLOT_STICKY_BOTTOM=1234567890
```

### Step 3: Create the Ad Unit in AdSense

1. Go to AdSense > Ads > By ad unit > Display ads
2. Create a new ad unit matching the format/size
3. Copy the numeric ad unit ID

### Step 4: Place the AdSlot Component

Import and render `AdSlot` in your page or component:

```tsx
import { AdSlot } from '@/components/ads/AdSlot';

<AdSlot
  slotId={process.env.NEXT_PUBLIC_AD_SLOT_STICKY_BOTTOM ?? ''}
  format="horizontal"
  className="sticky bottom-0 z-40 bg-cyber-dark/90 backdrop-blur-sm"
/>
```

### Step 5: Test

1. Set `NEXT_PUBLIC_ADS_ENABLED=true` in `.env.local`
2. Run `bun run build-local` to verify no type errors
3. Check the ad renders (or shows empty space if AdSense has not approved the domain)

### Best Practices for New Placements

- **Avoid clutter:** Maximum 3 ad units per page view
- **Respect content:** Do not place ads between the speed gauge and results
- **Mobile-first:** Test on narrow viewports; consider hiding sidebar ads on mobile
- **CLS prevention:** Reserve space with explicit dimensions to avoid layout shift
- **Above the fold:** Prioritize placements visible without scrolling

---

## 6. GDPR Consent Banner

### How It Works

The `AdConsentBanner` component (`src/components/ads/AdConsentBanner.tsx`) implements a basic consent flow:

1. **On mount:** Checks `localStorage` for the key `speed-test-ad-consent`
2. **If no consent stored:** Shows the banner at the bottom of the viewport
3. **User accepts:** Stores `'accepted'` in localStorage and reloads the page (triggers AdScript to load)
4. **User declines:** Stores `'declined'` in localStorage; banner dismisses, no ads load

### localStorage Key

```
Key:    speed-test-ad-consent
Values: 'accepted' | 'declined'
```

### Accept/Decline Flow

```
User visits site
    |
    +-- consent exists in localStorage?
    |   +-- 'accepted' -> Ads load normally
    |   +-- 'declined' -> No ads, banner hidden
    |
    +-- no consent -> Show banner
            |
            +-- Click "Accept" -> Set 'accepted' -> Reload page -> Ads load
            |
            +-- Click "Decline" -> Set 'declined' -> Banner hides -> No ads
```

### Resetting Consent (for testing)

Open browser DevTools console and run:

```javascript
localStorage.removeItem('speed-test-ad-consent');
location.reload();
```

### Current Limitations

The current implementation is **basic** and suitable for initial deployment. For production compliance, consider:

- **Granular consent:** Separate toggles for analytics vs advertising cookies
- **Consent logging:** Store timestamp and consent version for audit trails
- **IAB TCF 2.2:** Integrate a Consent Management Platform (CMP) like Cookiebot, OneTrust, or Quantcast Choice
- **Geo-detection:** Only show consent banners to EU/UK/California users
- **Consent revocation:** Add a settings page where users can change their choice

### Recommended CMP Integrations

| CMP | Cost | Integration Effort | Notes |
|-----|------|-------------------|-------|
| Cookiebot | Free tier | Low | Drop-in script replacement |
| OneTrust | Paid | Medium | Enterprise-grade |
| Quantcast Choice | Free | Low | IAB certified |
| Usercentrics | Paid | Medium | Strong EU compliance |

---

## 7. Ad Performance Optimization

### Current Optimizations

**Lazy script loading:** The AdSense script is loaded via `useEffect` in `AdScript.tsx`, which means it loads after the initial render, not blocking the critical rendering path.

```typescript
useEffect(() => {
  if (!AdConfig.enabled || !AdConfig.googleAdSense.id) return;
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/...`;
  script.async = true;
  // ...
}, []);
```

**Single-load guard:** `AdSlot` uses `hasLoadedRef` to prevent pushing to the `adsbygoogle` queue more than once per component instance.

**Conditional rendering:** When ads are disabled, `AdSlot` returns `null` immediately - no DOM nodes, no script execution.

### Additional Optimizations to Consider

**Intersection Observer (lazy loading):**

Wrap `AdSlot` with an Intersection Observer to only load ads when they enter the viewport:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { AdSlot } from '@/components/ads/AdSlot';

function LazyAdSlot(props: {
  slotId: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible && <AdSlot {...props} />}
    </div>
  );
}
```

**CLS Prevention:**

Always wrap ads in a container with explicit dimensions to prevent Cumulative Layout Shift:

```tsx
<div className="min-h-[250px] w-[300px]">
  <AdSlot slotId="..." format="vertical" />
</div>
```

**Ad blocking detection:**

Detect ad blockers and show a fallback message:

```tsx
useEffect(() => {
  const isBlocked = window.adsbygoogle?.loaded === false;
  if (isBlocked) {
    // Show fallback content or message
  }
}, []);
```

**Preconnect to AdSense domains:**

Add to your layout `<head>` for faster script loading:

```html
<link rel="preconnect" href="https://pagead2.googlesyndication.com" />
<link rel="preconnect" href="https://googleads.g.doubleclick.net" />
```

---

## 8. Alternative Ad Networks

The current implementation is tightly coupled to Google AdSense. Here is how to swap to other networks.

### Key Abstraction Points

The `AdSlot` component is the primary integration point. To support multiple networks:

1. **Add a `network` prop** to `AdSlot`
2. **Create network-specific renderers**
3. **Update `AdConfig`** to support multiple network configs

### Example: Multi-Network AdSlot

```tsx
type AdNetwork = 'adsense' | 'carbon' | 'custom';

type AdSlotProps = {
  slotId: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  network?: AdNetwork;
};

export function AdSlot(props: AdSlotProps) {
  const { slotId, format = 'rectangle', className = '', network = 'adsense' } = props;

  if (!AdConfig.enabled) return null;

  switch (network) {
    case 'adsense':
      return <AdSenseSlot slotId={slotId} format={format} className={className} />;
    case 'carbon':
      return <CarbonSlot className={className} />;
    case 'custom':
      return <CustomSlot slotId={slotId} className={className} />;
    default:
      return null;
  }
}
```

### Supported Networks

| Network | Integration | Notes |
|---------|-------------|-------|
| **Google AdSense** | Built-in | Default, fully configured |
| **Carbon Ads** | Drop-in script | Developer-focused, clean design. Replace AdSlot with the Carbon embed script |
| **Media.net** | Script swap | Contextual ads. Replace `AdScript.tsx` src with Media.net URL |
| **Ezoic** | Full replacement | Requires DNS changes. Replaces entire ad stack |
| **PropellerAds** | Push/pop | Different format entirely. Not recommended for this app |
| **Self-hosted** | Custom component | Direct sponsor deals. Render static images/links |

### Swapping from AdSense to Carbon Ads

1. Remove `AdScript` from `layout.tsx`
2. Replace `AdSlot` usage with Carbon embed code:

```tsx
<div className="carbon-ads-wrapper">
  <script
    async
    src="//cdn.carbonads.com/carbon.js?serve=YOUR_ID"
    id="_carbonads_js"
  />
</div>
```

3. Update `AdConfig.enabled` to control Carbon visibility instead

---

## 9. Ad Size and Format Guide

### Supported Formats

| Format | Dimensions | Use Case | Responsive |
|--------|-----------|----------|------------|
| **Leaderboard** | 728x90 | Top of page, footer | Yes (`data-full-width-responsive`) |
| **Medium Rectangle** | 300x250 | Sidebar, in-content | No (fixed) |
| **Large Rectangle** | 336x280 | In-content, between sections | Partial (`max-width: 100%`) |
| **Mobile Banner** | 320x50 | Mobile-only placements | No (fixed) |

### When to Use Each Format

**Leaderboard (728x90):**
- Footer placements
- Below navigation headers
- Between major content sections
- Best for desktop; use mobile banner for small screens

**Medium Rectangle (300x250):**
- Sidebar placements (current sidebar ad)
- In-content between paragraphs
- Highest CTR format generally
- Works well on both desktop and tablet

**Large Rectangle (336x280):**
- In-content placements
- Below article content
- Slightly larger than medium rectangle
- Good for content-rich pages

**Mobile Banner (320x50):**
- Mobile-only sticky bottom
- Between mobile content sections
- Use only on viewports < 768px

### Responsive Strategy

```tsx
{/* Desktop: show sidebar ad */}
<div className="hidden lg:block">
  <AdSlot slotId={sidebarSlot} format="vertical" />
</div>

{/* Mobile: show banner ad */}
<div className="lg:hidden">
  <AdSlot slotId={mobileSlot} format="horizontal" />
</div>
```

### AdSense Auto Ads

As an alternative to manual placements, AdSense offers **Auto Ads** which automatically place ads based on page content. To enable:

1. Go to AdSense > Ads > Overview > Auto ads
2. Toggle on for your domain
3. The existing `AdScript` component already loads the required script
4. Remove manual `AdSlot` components to avoid duplicate ads

**Trade-off:** Auto Ads are easier to manage but give less control over placement and may impact Core Web Vitals.

---

## 10. Testing: Development vs Production

### Development Testing

**Enable ads locally:**

```env
# .env.local
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=pub-1234567890123456
NEXT_PUBLIC_AD_SLOT_SIDEBAR=1234567890
NEXT_PUBLIC_AD_SLOT_FOOTER=0987654321
```

**What to expect in development:**

- Ad slots render as empty containers (AdSense will not serve ads on `localhost`)
- The `adsbygoogle` queue pushes succeed but no creative loads
- Consent banner shows until you accept/decline
- No errors should appear in the console (errors are caught silently)

**Testing the consent flow:**

```javascript
// In browser console
localStorage.getItem('speed-test-ad-consent');  // Check current state
localStorage.removeItem('speed-test-ad-consent'); // Reset to show banner
localStorage.setItem('speed-test-ad-consent', 'accepted'); // Force accept
localStorage.setItem('speed-test-ad-consent', 'declined'); // Force decline
```

**Verify component behavior:**

1. Set `NEXT_PUBLIC_ADS_ENABLED=false` - All `AdSlot` components should render nothing
2. Remove `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` - `AdScript` should not inject the script
3. Check that the page layout does not break when ads are disabled

### Production Testing

**Pre-launch checklist:**

- [ ] Domain registered and verified in AdSense
- [ ] AdSense account approved
- [ ] All ad unit IDs match between AdSense dashboard and env vars
- [ ] `NEXT_PUBLIC_ADS_ENABLED=true` in production env
- [ ] Consent banner displays for first-time visitors
- [ ] Ads load after accepting consent
- [ ] No ads load after declining consent
- [ ] Page layout stable (no CLS from ad loading)
- [ ] Mobile responsive ad placements work correctly

**Monitoring:**

- Check AdSense dashboard for impression counts
- Monitor Core Web Vitals (CLS, LCP, INP) in Google Search Console
- Use browser DevTools Network tab to verify `adsbygoogle.js` loads
- Check for `adsbygoogle.push()` errors in console

**Common production issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank ad slots | Domain not approved | Wait for AdSense approval |
| "Ad limit reached" | New account limits | Normal; resolves over time |
| Ads not showing | Consent declined | Check localStorage value |
| Layout shift | No reserved space | Add min-height wrapper |
| Duplicate ads | Auto Ads + manual slots | Disable one or the other |

---

## 11. Compliance Requirements

### GDPR (EU/UK)

**Requirements:**
- Obtain **explicit consent** before loading ads or tracking cookies
- Provide clear information about what cookies are used and why
- Allow users to **withdraw consent** at any time
- Log consent for audit purposes

**Current implementation status:**
- Basic consent banner: Yes
- Explicit opt-in before ad loading: Yes (page reload on accept)
- Withdrawal mechanism: No (needs settings page)
- Consent logging: No
- Granular consent options: No

**To achieve full GDPR compliance:**
1. Integrate a certified CMP (see [Section 6](#6-gdpr-consent-banner))
2. Add a privacy settings page with consent management
3. Log consent events with timestamp and version
4. Ensure no tracking scripts load before consent

### CCPA/CPRA (California)

**Requirements:**
- Provide a "Do Not Sell or Share My Personal Information" link
- Honor Global Privacy Control (GPC) signals
- Allow opt-out of targeted advertising

**Implementation:**
- Add a "Do Not Sell My Info" link in the footer
- Check `navigator.globalPrivacyControl` for GPC signals:

```tsx
useEffect(() => {
  if (navigator.globalPrivacyControl) {
    localStorage.setItem('speed-test-ad-consent', 'declined');
  }
}, []);
```

### General Best Practices

- **Privacy Policy:** Ensure `/privacy` page exists and describes ad data collection
- **Terms of Service:** Ensure `/terms` page exists (linked from consent banner)
- **Cookie Policy:** Document all cookies used (AdSense sets multiple cookies)
- **Age restrictions:** AdSense requires users to be 13+ (or local age of consent)
- **Ad content policies:** Review Google ad content policies regularly
- **Accessibility:** Ad slots include `aria-label` and `role="complementary"` attributes

### AdSense Policy Compliance

- Do not click your own ads
- Do not encourage others to click ads
- Do not place ads near interactive elements that could cause accidental clicks
- Do not modify AdSense code beyond what Google allows
- Maintain a minimum content-to-ad ratio
- Do not place ads on pages with prohibited content

---

## Quick Reference

### File Locations

```
src/
├── config/
│   └── SiteConfig.ts          # AdConfig definition
├── components/
│   └── ads/
│       ├── AdSlot.tsx          # Ad unit renderer
│       ├── AdScript.tsx        # AdSense script loader
│       └── AdConsentBanner.tsx # GDPR consent banner
└── app/[locale]/
    ├── layout.tsx              # Root layout (AdScript + ConsentBanner)
    └── (marketing)/
        └── page.tsx            # Footer ad placement
```

### Environment Variable Template

```env
NEXT_PUBLIC_ADS_ENABLED=false
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=
NEXT_PUBLIC_AD_SLOT_LEADERBOARD=
NEXT_PUBLIC_AD_SLOT_SIDEBAR=
NEXT_PUBLIC_AD_SLOT_IN_CONTENT=
NEXT_PUBLIC_AD_SLOT_MOBILE_BANNER=
NEXT_PUBLIC_AD_SLOT_FOOTER=
```

### Consent localStorage

```javascript
// Check consent
localStorage.getItem('speed-test-ad-consent'); // 'accepted' | 'declined' | null

// Reset for testing
localStorage.removeItem('speed-test-ad-consent');
```

============================================================
🚀 [Next.js Boilerplate Max](https://nextjs-boilerplate.com/nextjs-multi-tenant-saas-boilerplate) - Ship your SaaS faster with everything in this free starter, plus multi-tenancy, Stripe billing, RBAC, oRPC, Shadcn UI, and 50+ production-ready features.
============================================================
