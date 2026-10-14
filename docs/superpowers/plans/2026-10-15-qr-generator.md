# QR Code Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A free, no-login QR generator site (landing + static QR constructor) where all computation is client-side and Vercel serves only static responses.

**Architecture:** Next.js 15 (App Router, TypeScript, Tailwind v4) with two statically prerendered routes. QR rendering via `qr-code-styling` (client-only). Sticker frames are a custom SVG overlay system composited around the library's SVG output at download time — SVG exports merge frame + QR markup, raster exports rasterize the merged SVG to a canvas.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, `qr-code-styling` ^1.9, Vitest, Playwright (+ `pngjs`, `jsqr` for scan-back verification).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-14-qr-generator-design.md`.
- **No server work ever:** no `app/api/` routes, no server actions, no runtime server code. Both pages are statically prerendered; only `app/constructor/page.tsx` may be a client component shell.
- Hook copy verbatim: `No sign-ups. No payments. Just grab your working QR code.`
- CTA label verbatim: `Create Static QR`. Download label verbatim: `Download QR`.
- Download formats: PNG, JPEG, SVG, WEBP; raster sizes 512/1024/2048 px.
- Error-correction level `H` when a logo is present, `M` otherwise.
- Design tokens: page background `#f1f2f6`, navy `#23234f`, purple `#7b5cd6`.
- All file changes to shared files (e.g. `components/BuilderClient.tsx`) are additive; keep earlier sections intact.
- Commit attribution: end commit messages with `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- Working directory: repo root `/Users/Yauheni_Dzenisenka/Development/qr-generator`.

---

### Task 1: Scaffold Next.js app skeleton

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)

**Interfaces:**
- Produces: runnable Next.js app (`npm run dev`, `npm run build`), Tailwind v4 pipeline, `@/*` import alias, design tokens in `app/globals.css`.

- [ ] **Step 1: Write project config files**

`package.json`:

```json
{
  "name": "qr-generator",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "e2e"]
}
```

`next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {};

export default config;
```

`postcss.config.mjs`:

```javascript
export default {
  plugins: ['@tailwindcss/postcss'],
};
```

`.gitignore`:

````gitignore
/node_modules
/.next
/out
next-env.d.ts
*.tsbuildinfo
/test-results
/playwright-report
````

- [ ] **Step 2: Install dependencies**

Run: `npm install next@15 react@19 react-dom@19 typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss`
Expected: `added N packages`, no errors.

- [ ] **Step 3: Write app files**

`app/globals.css`:

```css
@import "tailwindcss";

:root {
  --bg: #f1f2f6;
  --navy: #23234f;
  --purple: #7b5cd6;
}
```

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR — free static QR code generator',
  description: 'No sign-ups. No payments. Free static QR codes, generated entirely in your browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f1f2f6] text-[#23234f] antialiased">{children}</body>
    </html>
  );
}
```

`app/page.tsx` (placeholder, replaced in Task 5):

```tsx
export default function Home() {
  return <main className="flex min-h-screen items-center justify-center">QR Generator</main>;
}
```

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: compiles; routes listed: `/` and empty favicon warnings are acceptable. No type errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs .gitignore app next-env.d.ts
git commit -m "chore: scaffold Next.js app skeleton"
```

---

### Task 2: Vitest + content payload & validation

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/types.ts`, `lib/payload.ts`, `lib/validate.ts`
- Test: `lib/payload.test.ts`, `lib/validate.test.ts`

**Interfaces:**
- Produces:
  - `buildPayload(content: Content): string` — QR-encoded string per type
  - `normalizeUrl(input: string): string`
  - `isValidEmail(value: string): boolean`
  - `getValidationError(settings: Settings): string | null` — `null` means valid
  - All types in `lib/types.ts` (imported by every later task)

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: installs cleanly.

- [ ] **Step 2: Write types and failing tests**

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts', 'tests/unit/*.test.ts'],
    environment: 'node',
  },
});
```

`lib/types.ts`:

```typescript
export type QrType = 'link' | 'text' | 'email' | 'call';

export interface Content {
  type: QrType;
  link: string;
  text: string;
  email: { to: string; subject: string; body: string };
  phone: string;
}

export type DotType =
  | 'square' | 'dots' | 'rounded'
  | 'classy' | 'classy-rounded' | 'extra-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

export interface PatternSettings {
  dotType: DotType;
  color: string;
  gradient: boolean;
  colorFrom: string;
  colorTo: string;
  bgColor: string;
  transparentBg: boolean;
  bgGradient: boolean;
  bgFrom: string;
  bgTo: string;
}

export interface CornersSettings {
  squareType: CornerSquareType;
  squareColor: string;
  dotType: CornerDotType;
  dotColor: string;
}

export interface LogoSettings {
  dataUrl: string | null;
  size: number;       // 0.1–0.4, passed as imageOptions.scale
  hideBackgroundDots: boolean;
}

export type DownloadFormat = 'png' | 'jpeg' | 'svg' | 'webp';

export interface DownloadSettings {
  format: DownloadFormat;
  size: 512 | 1024 | 2048;
}

export interface Settings {
  content: Content;
  stickerId: string | null;
  pattern: PatternSettings;
  corners: CornersSettings;
  logo: LogoSettings;
  download: DownloadSettings;
}
```

`lib/payload.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildPayload, isValidEmail, normalizeUrl } from './payload';
import type { Content } from './types';

const content = (over: Partial<Content>): Content => ({
  type: 'link', link: '', text: '',
  email: { to: '', subject: '', body: '' }, phone: '', ...over,
});

describe('normalizeUrl', () => {
  it('adds https when the scheme is missing', () => {
    expect(normalizeUrl('example.com/page')).toBe('https://example.com/page');
  });
  it('keeps an existing scheme', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });
  it('trims whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });
});

describe('buildPayload', () => {
  it('encodes links', () => {
    expect(buildPayload(content({ type: 'link', link: 'example.com' }))).toBe('https://example.com');
  });
  it('encodes plain text verbatim', () => {
    expect(buildPayload(content({ type: 'text', text: 'hi there' }))).toBe('hi there');
  });
  it('encodes e-mail with subject and body', () => {
    const payload = buildPayload(content({ type: 'email', email: { to: 'a@b.com', subject: 'Hi', body: 'Yo' } }));
    expect(payload).toBe('mailto:a@b.com?subject=Hi&body=Yo');
  });
  it('encodes e-mail without subject/body as bare mailto', () => {
    expect(buildPayload(content({ type: 'email', email: { to: 'a@b.com', subject: '', body: '' } }))).toBe('mailto:a@b.com');
  });
  it('strips formatting from phone numbers', () => {
    expect(buildPayload(content({ type: 'call', phone: '+1 (555) 010-2030' }))).toBe('tel:+15550102030');
  });
});

describe('isValidEmail', () => {
  it('accepts normal addresses', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
  });
  it('rejects junk', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
```

`lib/validate.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { getValidationError } from './validate';
import { DEFAULT_SETTINGS } from './settings';
import type { Settings } from './types';

const settings = (over: (s: Settings) => Settings): Settings =>
  over(structuredClone(DEFAULT_SETTINGS));

describe('getValidationError', () => {
  it('rejects empty defaults (no link typed yet)', () => {
    expect(getValidationError(DEFAULT_SETTINGS)).not.toBeNull();
  });
  it('accepts a link', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, link: 'example.com' } }));
    expect(getValidationError(s)).toBeNull();
  });
  it('rejects an invalid e-mail', () => {
    const s = settings(s => ({ ...s, content: { type: 'email', link: '', text: '', email: { to: 'bad', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toMatch(/valid e-mail/i);
  });
  it('rejects an empty phone', () => {
    const s = settings(s => ({ ...s, content: { type: 'call', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toMatch(/phone/i);
  });
  it('rejects oversized payloads', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2501) } }));
    expect(getValidationError(s)).toMatch(/too long/i);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — "Cannot find module './payload'" and './settings'.

- [ ] **Step 4: Write minimal implementation**

`lib/payload.ts`:

```typescript
import type { Content } from './types';

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function buildPayload(content: Content): string {
  switch (content.type) {
    case 'link':
      return normalizeUrl(content.link);
    case 'text':
      return content.text;
    case 'email': {
      const parts: string[] = [];
      if (content.email.subject) parts.push(`subject=${encodeURIComponent(content.email.subject)}`);
      if (content.email.body) parts.push(`body=${encodeURIComponent(content.email.body)}`);
      return `mailto:${content.email.to.trim()}${parts.length ? `?${parts.join('&')}` : ''}`;
    }
    case 'call':
      return `tel:${content.phone.replace(/[^+\d]/g, '')}`;
  }
}
```

`lib/settings.ts` (defaults only for now; reducer added in Task 3):

```typescript
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  content: { type: 'link', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' },
  stickerId: null,
  pattern: {
    dotType: 'square', color: '#23234f',
    gradient: false, colorFrom: '#23234f', colorTo: '#7b5cd6',
    bgColor: '#ffffff', transparentBg: false,
    bgGradient: false, bgFrom: '#dbeafe', bgTo: '#ede9fe',
  },
  corners: { squareType: 'square', squareColor: '#23234f', dotType: 'square', dotColor: '#23234f' },
  logo: { dataUrl: null, size: 0.3, hideBackgroundDots: true },
  download: { format: 'png', size: 1024 },
};
```

`lib/validate.ts`:

```typescript
import { buildPayload, isValidEmail } from './payload';
import type { Settings } from './types';

export function getValidationError(settings: Settings): string | null {
  const c = settings.content;
  switch (c.type) {
    case 'link':
      if (!c.link.trim()) return 'Enter a URL to generate your QR code.';
      break;
    case 'text':
      if (!c.text.trim()) return 'Enter some text to encode.';
      break;
    case 'email':
      if (!isValidEmail(c.email.to)) return 'Enter a valid e-mail address.';
      break;
    case 'call':
      if (!c.phone.trim()) return 'Enter a phone number.';
      break;
  }
  if (buildPayload(c).length > 2500) return 'Content is too long for a QR code.';
  return null;
}
```

Note: `validate.ts` imports `DEFAULT_SETTINGS` — the test file imports it directly. Both import chains resolve after this step.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all tests in both files green.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts lib
git commit -m "feat: content payload encoders and validation"
```

---

### Task 3: Settings reducer

**Files:**
- Modify: `lib/settings.ts`
- Test: `lib/settings.test.ts`

**Interfaces:**
- Produces: `type Action` (union below) and `settingsReducer(state: Settings, action: Action): Settings`

- [ ] **Step 1: Write the failing test**

`lib/settings.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, settingsReducer } from './settings';

describe('settingsReducer', () => {
  it('sets the qr type and keeps field values', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, { type: 'setQrType', qrType: 'email' });
    expect(next.content.type).toBe('email');
  });

  it('sets simple content fields', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, { type: 'setField', field: 'link', value: 'example.com' });
    expect(next.content.link).toBe('example.com');
  });

  it('sets e-mail subfields', () => {
    const next = settingsReducer(DEFAULT_SETTINGS, { type: 'setField', field: 'emailTo', value: 'a@b.com' });
    expect(next.content.email.to).toBe('a@b.com');
  });

  it('patches pattern, corners, logo, download independently', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setPattern', patch: { gradient: true } });
    expect(s.pattern.gradient).toBe(true);
    s = settingsReducer(s, { type: 'setCorners', patch: { dotType: 'dot' } });
    expect(s.corners.dotType).toBe('dot');
    s = settingsReducer(s, { type: 'setLogo', patch: { dataUrl: 'data:image/png;base64,AAA' } });
    expect(s.logo.dataUrl).toBe('data:image/png;base64,AAA');
    s = settingsReducer(s, { type: 'setDownload', patch: { size: 2048 } });
    expect(s.download.size).toBe(2048);
    expect(s.logo.dataUrl).toBe('data:image/png;base64,AAA');
  });

  it('sets and clears the sticker', () => {
    let s = settingsReducer(DEFAULT_SETTINGS, { type: 'setSticker', stickerId: 'phone' });
    expect(s.stickerId).toBe('phone');
    s = settingsReducer(s, { type: 'setSticker', stickerId: null });
    expect(s.stickerId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/settings.test.ts`
Expected: FAIL — `settingsReducer` not exported.

- [ ] **Step 3: Implement the reducer**

Append to `lib/settings.ts`:

```typescript
import type { Action } from './actions';

export function settingsReducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'setQrType':
      return { ...state, content: { ...state.content, type: action.qrType } };
    case 'setField':
      switch (action.field) {
        case 'link': return { ...state, content: { ...state.content, link: action.value } };
        case 'text': return { ...state, content: { ...state.content, text: action.value } };
        case 'phone': return { ...state, content: { ...state.content, phone: action.value } };
        case 'emailTo': return { ...state, content: { ...state.content, email: { ...state.content.email, to: action.value } } };
        case 'emailSubject': return { ...state, content: { ...state.content, email: { ...state.content.email, subject: action.value } } };
        case 'emailBody': return { ...state, content: { ...state.content, email: { ...state.content.email, body: action.value } } };
      }
    case 'setSticker': return { ...state, stickerId: action.stickerId };
    case 'setPattern': return { ...state, pattern: { ...state.pattern, ...action.patch } };
    case 'setCorners': return { ...state, corners: { ...state.corners, ...action.patch } };
    case 'setLogo': return { ...state, logo: { ...state.logo, ...action.patch } };
    case 'setDownload': return { ...state, download: { ...state.download, ...action.patch } };
  }
}
```

Create `lib/actions.ts`:

```typescript
import type { ContentField } from './types';
import type {
  CornersSettings, DownloadSettings, LogoSettings,
  PatternSettings, QrType,
} from './types';

export type Action =
  | { type: 'setQrType'; qrType: QrType }
  | { type: 'setField'; field: ContentField; value: string }
  | { type: 'setSticker'; stickerId: string | null }
  | { type: 'setPattern'; patch: Partial<PatternSettings> }
  | { type: 'setCorners'; patch: Partial<CornersSettings> }
  | { type: 'setLogo'; patch: Partial<LogoSettings> }
  | { type: 'setDownload'; patch: Partial<DownloadSettings> };
```

Add to `lib/types.ts` (next to `QrType`):

```typescript
export type ContentField = 'link' | 'text' | 'phone' | 'emailTo' | 'emailSubject' | 'emailBody';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all green.

- [ ] **Step 5: Commit**

```bash
git add lib
git commit -m "feat: settings reducer"
```

---

### Task 4: QR option mapping

**Files:**
- Create: `lib/qrConfig.ts`
- Test: `lib/qrConfig.test.ts`

**Interfaces:**
- Consumes: `Settings`, `buildPayload`
- Produces:
  - `hex(input: string): string` — sanitize arbitrary user text to a valid `#rrggbb`
  - `buildQrConfig(settings: Settings, size = 1000): QRCodeStyling.Options`

- [ ] **Step 1: Write the failing test**

`lib/qrConfig.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildQrConfig, hex } from './qrConfig';
import { DEFAULT_SETTINGS } from './settings';

describe('hex', () => {
  it('passes valid colors through', () => {
    expect(hex('#aabbcc')).toBe('#aabbcc');
  });
  it('falls back to black for junk', () => {
    expect(hex('zzz')).toBe('#000000');
  });
});

describe('buildQrConfig', () => {
  it('encodes the payload', () => {
    const s = { ...DEFAULT_SETTINGS, content: { ...DEFAULT_SETTINGS.content, link: 'example.com' } };
    expect(buildQrConfig(s).data).toBe('https://example.com');
  });

  it('defaults to error correction M without a logo', () => {
    expect(buildQrConfig(DEFAULT_SETTINGS).qrOptions?.errorCorrectionLevel).toBe('M');
  });

  it('uses H and embeds the image when a logo is set', () => {
    const s = { ...DEFAULT_SETTINGS, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4, hideBackgroundDots: true } };
    const config = buildQrConfig(s);
    expect(config.qrOptions?.errorCorrectionLevel).toBe('H');
    expect(config.image).toBe('data:image/png;base64,AAA');
  });

  it('emits solid and gradient dot colors', () => {
    const solid = buildQrConfig(DEFAULT_SETTINGS);
    expect(solid.dotsOptions?.type).toBe('square');
    expect(solid.dotsOptions?.gradient).toBeUndefined();
    const gradient = buildQrConfig({ ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, gradient: true } });
    expect(gradient.dotsOptions?.gradient).toMatchObject({ type: 'linear' });
  });

  it('uses transparent background when the box is checked', () => {
    const s = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } };
    expect(buildQrConfig(s).backgroundOptions?.color).toBe('rgba(0,0,0,0)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/qrConfig.test.ts`
Expected: FAIL — cannot find module `./qrConfig`.

- [ ] **Step 3: Implement**

Run first: `npm install qr-code-styling`

`lib/qrConfig.ts`:

```typescript
import type { Options } from 'qr-code-styling';
import { buildPayload } from './payload';
import type { Settings } from './types';

/** Sanitize free-text color input into something SVG-safe. */
export function hex(input: string): string {
  return /^#[0-9a-f]{6}$/i.test(input.trim()) ? input.trim() : '#000000';
}

export function buildQrConfig(settings: Settings, size = 1000): Options {
  const p = settings.pattern;
  const pattern = p.gradient
    ? {
        gradientType: 'linear' as const,
        rotation: Math.PI / 3,
        colorStops: [
          { offset: 0, color: hex(p.colorFrom) },
          { offset: 1, color: hex(p.colorTo) },
        ],
      }
    : undefined;

  const background = p.transparentBg
    ? { color: 'rgba(0,0,0,0)' } as const
    : p.bgGradient
      ? {
          gradientType: 'linear' as const,
          rotation: Math.PI / 3,
          colorStops: [
            { offset: 0, color: hex(p.bgFrom) },
            { offset: 1, color: hex(p.bgTo) },
          ],
        }
      : { color: hex(p.bgColor) } as const;

  return {
    width: size,
    height: size,
    type: 'svg',
    data: buildPayload(settings.content),
    margin: Math.round(size * 0.06),
    qrOptions: { errorCorrectionLevel: settings.logo.dataUrl ? ('H' as const) : ('M' as const) },
    image: settings.logo.dataUrl ?? undefined,
    imageOptions: {
      hideBackgroundDots: settings.logo.hideBackgroundDots,
      scale: settings.logo.size,
      margin: Math.round(size * 0.004),
      crossOrigin: 'anonymous',
    },
    dotsOptions: { color: hex(p.color), type: p.dotType, gradient: pattern },
    cornersSquareOptions: { color: hex(settings.corners.squareColor), type: settings.corners.squareType },
    cornersDotOptions: { color: hex(settings.corners.dotColor), type: settings.corners.dotType },
    backgroundOptions: background,
  };
}
```

No other branching needed — `qrOptions.errorCorrectionLevel` is always set explicitly (`H` when a logo is present, `M` otherwise), and the test above asserts it literally.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all green.

- [ ] **Step 5: Commit**

```bash
git add lib package.json package-lock.json
git commit -m "feat: map settings to qr-code-styling options"
```

---

### Task 5: Landing page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: the completed landing route; CTA links to `/constructor`.

- [ ] **Step 1: Write the landing page**

`app/page.tsx`:

```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="max-w-3xl bg-gradient-to-r from-[#23234f] via-[#4b3d99] to-[#7b5cd6] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-6xl">
        No sign-ups. No payments. Just grab your working QR code.
      </h1>
      <p className="text-lg text-gray-500">
        Static QR codes, generated entirely in your browser.
      </p>
      <Link
        href="/constructor"
        className="rounded-full bg-[#23234f] px-10 py-4 text-lg font-semibold text-white shadow transition hover:bg-[#7b5cd6]"
      >
        Create Static QR
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Verify build and visuals**

Run: `npx next build`
Expected: PASS. Run `npx next dev`, open `http://localhost:3000`, confirm: light-gray background, navy→purple gradient headline with the exact copy, working CTA to `/constructor`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing page with gradient hero"
```

---

### Task 6: Constructor shell + live preview

**Files:**
- Create: `app/constructor/page.tsx`, `components/BuilderClient.tsx`, `components/QrPreview.tsx`, `components/controls.tsx`
- Modify: none

**Interfaces:**
- Consumes: `DEFAULT_SETTINGS`, `settingsReducer`, `Action`, `buildQrConfig`, `getValidationError`
- Produces:
  - `components/controls.tsx` → `ColorPicker({ value, onChange, label })`, `Toggle({ checked, onChange, label })`, `Panel({ title, children })`
  - `components/BuilderClient.tsx` — reducer state + `<qr instance>` passed to children via props (later tasks add panels here)
  - `components/QrPreview({ settings, qr, error })`

- [ ] **Step 1: Constructor page + shared controls**

`app/constructor/page.tsx`:

```tsx
'use client';
import dynamic from 'next/dynamic';

const BuilderClient = dynamic(() => import('@/components/BuilderClient'), {
  ssr: false,
  loading: () => <div className="p-12 text-gray-500">Loading…</div>,
});

export default function ConstructorPage() {
  return <BuilderClient />;
}
```

`components/controls.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';

export function ColorPicker({ value, onChange, label }: {
  value: string;
  onChange(value: string): void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
      />
      <input
        type="text"
        aria-label={`${label} hex`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#7b5cd6] focus:outline-none"
      />
    </label>
  );
}

export function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange(checked: boolean): void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#7b5cd6]"
      />
      {label}
    </label>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Live preview component**

`components/QrPreview.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { buildQrConfig } from '@/lib/qrConfig';
import { getSticker } from '@/lib/stickers';
import type { Settings } from '@/lib/types';

const PREVIEW = 360;

export function QrPreview({ settings, qr, error }: {
  settings: Settings;
  qr: QRCodeStyling;
  error: string | null;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const stuck = useRef(false);
  const sticker = settings.stickerId ? getSticker(settings.stickerId) : null;
  const qrRect = sticker ? sticker.qrRect : { x: 0, y: 0, w: 1000 };
  const size = Math.round((PREVIEW * qrRect.w) / 1000);

  useEffect(() => {
    if (mount.current && !stuck.current) {
      qr.append(mount.current);
      stuck.current = true;
    }
  }, [qr]);

  useEffect(() => {
    qr.update(buildQrConfig(settings, size));
  }, [qr, settings, size]);

  return (
    <div className="relative" style={{ width: PREVIEW, height: PREVIEW }} data-testid="preview">
      <div
        ref={mount}
        className="absolute"
        style={{
          left: (qrRect.x / 1000) * PREVIEW,
          top: (qrRect.y / 1000) * PREVIEW,
          width: size,
          height: size,
        }}
        data-testid="preview-qr"
      />
      {sticker && (
        <div
          className="pointer-events-none absolute inset-0"
          dangerouslySetInnerHTML={{ __html: sticker.frame('SCAN ME') }}
        />
      )}
      {error && <p className="absolute -bottom-10 left-0 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Builder client shell**

`components/BuilderClient.tsx`:

```tsx
'use client';

import { useEffect, useReducer, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { DEFAULT_SETTINGS, settingsReducer } from '@/lib/settings';
import { getValidationError } from '@/lib/validate';
import { buildQrConfig } from '@/lib/qrConfig';
import { QrPreview } from './QrPreview';
import type { ReactNode } from 'react';

const TABS = ['Content', 'Pattern', 'Corners', 'Logo'] as const;
type Tab = (typeof TABS)[number];

export function BuilderClient() {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);
  const qr = useRef<QRCodeStyling | null>(null);
  if (!qr.current) qr.current = new QRCodeStyling(buildQrConfig(DEFAULT_SETTINGS));
  const [tab, setTab] = useReducer((_: Tab, next: Tab) => next, 'Content');
  const error = getValidationError(settings);

  // Swallow transient invalid payloads (e.g. empty data) so the preview stays last-rendered good.
  useEffect(() => {
    if (error) return;
    qr.current?.update(buildQrConfig(settings, 1000));
  }, [settings, error]);

  const panels: Record<Tab, ReactNode> = {
    Content: <PlaceholderTab label="Content (task 7)" />,
    Pattern: <PlaceholderTab label="Pattern (task 8)" />,
    Corners: <PlaceholderTab label="Corners (task 8)" />,
    Logo: <PlaceholderTab label="Logo (task 9)" />,
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col gap-6">
        <Panel title="1 · Complete the content">
          <PlaceholderTab label="Content selector (task 7)" />
        </Panel>
        <Panel title="2 · Design your QR code">
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            {TABS.map((name) => (
              <button
                key={name}
                onClick={() => setTab(name)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === name ? 'bg-[#23234f] text-white' : 'text-gray-500 hover:text-[#23234f]'}`}
              >
                {name}
              </button>
            ))}
          </div>
          {panels[tab]}
        </Panel>
      </div>
      <div className="flex flex-col items-center gap-4 lg:sticky lg:top-6 lg:self-start">
        <Panel title="3 · Preview & download">
          <div className="flex flex-col items-center gap-4">
            <QrPreview settings={settings} qr={qr.current} error={error} />
            <PlaceholderTab label="Download (task 10)" />
          </div>
        </Panel>
      </div>
    </main>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return <p className="text-sm text-gray-400">{label}</p>;
}
```

- [ ] **Step 4: Verify build + stub sticker module**

Create placeholder `lib/stickers.ts` (full implementation in Task 9):

```typescript
import type { Sticker } from './stickers-types';

export type { Sticker } from './stickers-types';

const PLACEHOLDER: Sticker[] = [];

export function getSticker(id: string | null): Sticker | null {
  return PLACEHOLDER.find((s) => s.id === id) ?? null;
}

export function listStickers(): Sticker[] {
  return PLACEHOLDER;
}
```

Create placeholder `lib/stickers-types.ts`:

```typescript
export interface QrRect { x: number; y: number; w: number }

export interface Sticker {
  id: string;
  label: string | null;
  qrRect: QrRect;
  frame(label: string): string;   // SVG markup for viewBox 0 0 1000 1000
  thumb(size: number, label: string): string;
}
```

Run: `npx next build`
Expected: PASS.

- [ ] **Step 5: Smoke-test manually**

Run: `npx next dev`, open `http://localhost:3000/constructor`.
Expected: preview renders a valid QR of an empty URL is **not** required — page renders panels and preview area without a server error (empty payload renders nothing or a tiny code; either is acceptable).

- [ ] **Step 6: Commit**

```bash
git add app/constructor components lib/stickers.ts lib/stickers-types.ts
git commit -m "feat: constructor shell with live QR preview"
```

---

### Task 7: Content section (type chips + fields)

**Files:**
- Create: `components/ContentSection.tsx`
- Modify: `components/BuilderClient.tsx` (replace Content placeholder)

**Interfaces:**
- Consumes: `Action` via `dispatch`, `QrType`, `ContentField`, `getValidationError`
- Produces: `ContentSection({ settings, dispatch, error })` — renders type chips and the per-type fields.

- [ ] **Step 1: Write ContentSection**

`components/ContentSection.tsx`:

```tsx
'use client';

import type { Action } from '@/lib/actions';
import type { ContentField, QrType, Settings } from '@/lib/types';

const TYPES: { id: QrType; icon: string }[] = [
  { id: 'link', icon: '🔗' },
  { id: 'text', icon: '≡' },
  { id: 'email', icon: '✉' },
  { id: 'call', icon: '☎' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7b5cd6] focus:outline-none';

export function ContentSection({ settings, dispatch, error }: {
  settings: Settings;
  dispatch(action: Action): void;
  error: string | null;
}) {
  const { content } = settings;
  const set = (field: ContentField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'setField', field, value: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TYPES.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => dispatch({ type: 'setQrType', qrType: id })}
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
              content.type === id
                ? 'border-[#7b5cd6] bg-[#7b5cd6]/10 text-[#23234f]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <span aria-hidden>{icon}</span> {id === 'email' ? 'E-mail' : id}
          </button>
        ))}
      </div>

      {content.type === 'link' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Enter your Website
          <input
            type="text"
            placeholder="https://"
            value={content.link}
            onChange={set('link')}
            className={inputClass}
          />
        </label>
      )}

      {content.type === 'text' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Enter your text
          <textarea rows={4} value={content.text} onChange={set('text')} className={inputClass} />
        </label>
      )}

      {content.type === 'email' && (
        <div className="flex flex-col gap-3 text-sm font-medium">
          <label className="flex flex-col gap-1">
            To
            <input type="email" value={content.email.to} onChange={set('emailTo')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            Subject
            <input type="text" value={content.email.subject} onChange={set('emailSubject')} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            Body
            <textarea rows={3} value={content.email.body} onChange={set('emailBody')} className={inputClass} />
          </label>
        </div>
      )}

      {content.type === 'call' && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone number
          <input type="tel" placeholder="+1 555 010 2030" value={content.phone} onChange={set('phone')} className={inputClass} />
        </label>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Wire into BuilderClient**

In `components/BuilderClient.tsx` replace the content placeholder inside `Panel title="1 · Complete the content"` with:

```tsx
<ContentSection settings={settings} dispatch={dispatch} error={error} />
```

and remove the now-unused `PlaceholderTab` function. Add the import at the top:

```tsx
import { ContentSection } from './ContentSection';
```

- [ ] **Step 3: Verify**

Run: `npx next build`
Expected: PASS. Dev-run check: switching chips swaps fields; typing a URL renders a scannable code in the preview; invalid e-mail shows the error inline.

- [ ] **Step 4: Commit**

```bash
git add components/ContentSection.tsx components/BuilderClient.tsx
git commit -m "feat: content section with per-type fields"
```

---

### Task 8: Pattern and Corners panels

**Files:**
- Create: `components/PatternPanel.tsx`, `components/CornersPanel.tsx`
- Modify: `components/BuilderClient.tsx`

**Interfaces:**
- Consumes: `ColorPicker`, `Toggle`, `Action`, `DotType`, `CornerSquareType`, `CornerDotType`
- Produces: `PatternPanel({ settings, dispatch })`, `CornersPanel({ settings, dispatch })`

- [ ] **Step 1: PatternPanel**

`components/PatternPanel.tsx`:

```tsx
'use client';

import type { Action } from '@/lib/actions';
import type { DotType, Settings } from '@/lib/types';
import { ColorPicker, Toggle } from './controls';

const DOT_TYPES: DotType[] = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'];

export function PatternPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const p = settings.pattern;
  const patch = (p2: Partial<typeof p>) => dispatch({ type: 'setPattern', patch: p2 });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">QR code pattern</p>
        <div className="flex flex-wrap gap-2">
          {DOT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => patch({ dotType: t })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize ${
                p.dotType === t ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ColorPicker label="Pattern color" value={p.color} onChange={(color) => patch({ color })} />
        <Toggle label="Use gradient pattern" checked={p.gradient} onChange={(gradient) => patch({ gradient })} />
      </div>
      {p.gradient && (
        <div className="flex items-center gap-4">
          <ColorPicker label="Gradient from" value={p.colorFrom} onChange={(colorFrom) => patch({ colorFrom })} />
          <ColorPicker label="Gradient to" value={p.colorTo} onChange={(colorTo) => patch({ colorTo })} />
        </div>
      )}

      <hr className="border-gray-200" />
      <div className="flex flex-wrap items-center gap-4">
        <ColorPicker label="Background color" value={p.bgColor} onChange={(bgColor) => patch({ bgColor })} />
        <Toggle label="Use transparent background" checked={p.transparentBg} onChange={(transparentBg) => patch({ transparentBg })} />
        <Toggle label="Use gradient background" checked={p.transparentBg ? false : p.bgGradient} onChange={(bgGradient) => patch({ bgGradient })} />
      </div>
      {p.bgGradient && !p.transparentBg && (
        <div className="flex items-center gap-4">
          <ColorPicker label="Background from" value={p.bgFrom} onChange={(bgFrom) => patch({ bgFrom })} />
          <ColorPicker label="Background to" value={p.bgTo} onChange={(bgTo) => patch({ bgTo })} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: CornersPanel**

`components/CornersPanel.tsx`:

```tsx
'use client';

import type { Action } from '@/lib/actions';
import type { CornerDotType, CornerSquareType, Settings } from '@/lib/types';
import { ColorPicker } from './controls';

const SQUARE_TYPES: { id: CornerSquareType; glyph: string }[] = [
  { id: 'square', glyph: '□' },
  { id: 'dot', glyph: '⭘' },
  { id: 'extra-rounded', glyph: '▢' },
];

const CORNER_DOT_TYPES: { id: CornerDotType; glyph: string }[] = [
  { id: 'square', glyph: '■' },
  { id: 'dot', glyph: '⬤' },
];

function chip(selected: boolean): string {
  return `flex h-14 w-14 items-center justify-center rounded-xl border text-2xl ${
    selected ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;
}

export function CornersPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const c = settings.corners;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">Frame around corner dots style</p>
          <div className="flex flex-wrap gap-2">
            {SQUARE_TYPES.map(({ id, glyph }) => (
              <button key={id} onClick={() => dispatch({ type: 'setCorners', patch: { squareType: id } })} className={chip(c.squareType === id)} aria-label={`Corner square ${id}`}>
                {glyph}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">Corner dots type</p>
          <div className="flex flex-wrap gap-2">
            {CORNER_DOT_TYPES.map(({ id, glyph }) => (
              <button key={id} onClick={() => dispatch({ type: 'setCorners', patch: { dotType: id } })} className={chip(c.dotType === id)} aria-label={`Corner dot ${id}`}>
                {glyph}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorPicker label="Corner square color" value={c.squareColor} onChange={(squareColor) => dispatch({ type: 'setCorners', patch: { squareColor } })} />
        <ColorPicker label="Corner dots color" value={c.dotColor} onChange={(dotColor) => dispatch({ type: 'setCorners', patch: { dotColor } })} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into BuilderClient**

In `components/BuilderClient.tsx` update the `panels` record and imports:

```tsx
import { PatternPanel } from './PatternPanel';
import { CornersPanel } from './CornersPanel';
```

```tsx
  const panels: Record<Tab, ReactNode> = {
    Content: null, // not rendered as a tab; Content lives in its own Panel (task 7)
    Pattern: <PatternPanel settings={settings} dispatch={dispatch} />,
    Corners: <CornersPanel settings={settings} dispatch={dispatch} />,
    Logo: <PlaceholderTab label="Logo (task 9)" />,
  };
```

and change the `TABS` constant to `['Pattern', 'Corners', 'Logo']` with the initial tab `'Pattern'`. (Content stays in its own numbered panel; the design tabs are the design sub-tabs.)

- [ ] **Step 4: Verify**

Run: `npx next build`
Expected: PASS. Dev check: pattern changes re-render the QR immediately; gradient toggles reveal two pickers; corner chips recolor finder squares.

- [ ] **Step 5: Commit**

```bash
git add components/PatternPanel.tsx components/CornersPanel.tsx components/BuilderClient.tsx
git commit -m "feat: pattern and corners design panels"
```

---

### Task 9: Stickers

**Files:**
- Create: `lib/stickers-impl.ts`
- Modify: `lib/stickers.ts` (remove placeholder, export real registry), `components/StickerPanel.tsx` (new), `components/BuilderClient.tsx`, `components/QrPreview.tsx` (use `thumb`-size-safe frame overlay)

**Interfaces:**
- Consumes: `Sticker`, `QrRect` from `lib/stickers-types.ts`
- Produces: `getSticker(id)` / `listStickers()` backed by 7 real stickers; `StickerPanel({ settings, dispatch })`

- [ ] **Step 1: Write failing sticker tests**

`lib/stickers.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { getSticker, listStickers } from './stickers';

describe('sticker registry', () => {
  it('exposes 7 stickers and resolves by id', () => {
    expect(listStickers()).toHaveLength(7);
    expect(getSticker('phone')?.id).toBe('phone');
    expect(getSticker('nope')).toBeNull();
    expect(getSticker(null)).toBeNull();
  });

  it.each(listStickers().map((s) => [s.id, s] as const))(
    '%s: frame() returns svg markup with a label when given one',
    (_id, s) => {
      const svg = s.frame('SCAN ME');
      expect(svg).toContain('SCAN ME');
      // every frame stays inside the 1000×1000 canvas
      expect(svg).toContain('viewBox="0 0 1000 1000"');
      if (s.label) expect(s.frame('SCAN ME')).toContain(s.label ?? '');
    },
  );

  it('thumbs embed a fake QR area', () => {
    const thumb = getSticker('square')!.thumb(64, 'SCAN ME');
    expect(thumb).toContain('width="64"');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/stickers.test.ts`
Expected: FAIL — stickers still an empty registry (`expect(listStickers()).toHaveLength(7)` fails).

- [ ] **Step 3: Implement stickers**

`lib/stickers-impl.ts`:

```typescript
import type { QrRect, Sticker } from './stickers-types';

const INK = '#111827';

/** Deterministic 8×8 fake QR block used in thumbnails. */
function miniQrDots(rect: QrRect): string {
  const bits = [
    1, 1, 0, 1, 1, 0, 1, 1,
    1, 1, 0, 1, 0, 1, 1, 1,
    0, 1, 0, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 0, 1, 1,
    1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 0, 0, 1, 1, 0, 1,
  ];
  const n = 8;
  const cell = rect.w / n;
  let out = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!bits[r * n + c]) continue;
      out += `<rect x="${(rect.x + c * cell).toFixed(1)}" y="${(rect.y + r * cell).toFixed(1)}" width="${(cell * 0.85).toFixed(1)}" height="${(cell * 0.85).toFixed(1)}" fill="${INK}"/>`;
    }
  }
  return out;
}

function wrap(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${content}</svg>`;
}

function labelBand(label: string, y: number, fontSize = 72): string {
  return `<text x="500" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="${INK}">${label}</text>`;
}

function define(
  id: string, label: string | null, qrRect: QrRect,
  frameArt: (r: QrRect) => string,
): Sticker {
  return {
    id,
    label,
    qrRect,
    frame: (labelText: string) => wrap(`<!-- ${id} -->${frameArt(qrRect)}${label && labelText ? labelBand(labelText) : ''}`),
    thumb: (size: number, labelText: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000">${frameArt(qrRect)}${miniQrDots(qrRect)}${label && labelText ? labelBand(labelText) : ''}</svg>`,
  };
}

export const STICKERS: Sticker[] = [
  define('square', 'SCAN ME', { x: 120, y: 80, w: 760 }, () =>
    `<rect x="30" y="30" width="940" height="940" fill="none" stroke="${INK}" stroke-width="20"/>`),
  define('rounded', 'SCAN ME', { x: 120, y: 80, w: 760 }, () =>
    `<rect x="30" y="30" width="940" height="940" rx="90" fill="none" stroke="${INK}" stroke-width="24"/>`),
  define('circle', 'SCAN ME', { x: 160, y: 130, w: 680 }, () =>
    `<circle cx="500" cy="500" r="470" fill="none" stroke="${INK}" stroke-width="24"/>`),
  define('phone', 'SCAN ME', { x: 150, y: 140, w: 700 }, () =>
    `<rect x="70" y="30" width="860" height="940" rx="90" fill="none" stroke="${INK}" stroke-width="24"/><rect x="360" y="905" width="280" height="18" rx="9" fill="${INK}"/>`),
  define('clipboard', 'SCAN ME', { x: 150, y: 170, w: 700 }, () =>
    `<rect x="90" y="60" width="820" height="900" rx="40" fill="none" stroke="${INK}" stroke-width="24"/><rect x="380" y="20" width="240" height="80" rx="20" fill="none" stroke="${INK}" stroke-width="24"/>`),
  define('bag', 'SCAN ME', { x: 150, y: 170, w: 700 }, () =>
    `<path d="M140 260 h720 l40 660 h-800 Z" fill="none" stroke="${INK}" stroke-width="24"/><path d="M360 260 v-40 a140 140 0 0 1 280 0 v40" fill="none" stroke="${INK}" stroke-width="24"/>`),
  define('topbar', 'SCAN ME', { x: 110, y: 140, w: 780 }, () =>
    `<rect x="20" y="20" width="960" height="960" rx="40" fill="none" stroke="${INK}" stroke-width="20"/><path d="M20 60 a40 40 0 0 1 40 -40 h880 a40 40 0 0 1 40 40 v50 h-960 Z" fill="${INK}"/>`),
];
```

Note: `topbar` draws its label band **above** the QR inside the dark strip, so `labelBand` isn't ideal — but `label` is truthy and the default label text renders with default white fill. Simplest correct version: in `define`, when `id === 'topbar'`, render `<text ... fill="#ffffff" y="75">` — keep the special case in `frame`/`thumb` via a `labelSpec` field. Replace `labelBand(labelText)` in `define` with `labelSpec`:

```typescript
  // inside `define`, replace the two labelBand call sites with:
  const labelSvg = (text: string) =>
    id === 'topbar'
      ? `<text x="500" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="64" fill="#ffffff">${text}</text>`
      : labelBand(text);

// and use `${label && labelText ? labelSvg(labelText) : ''}` in both template strings.
```

Replace placeholder `lib/stickers.ts`:

```typescript
import { STICKERS } from './stickers-impl';
import type { Sticker } from './stickers-types';

export type { Sticker } from './stickers-types';

export function getSticker(id: string | null): Sticker | null {
  return STICKERS.find((s) => s.id === id) ?? null;
}

export function listStickers(): Sticker[] {
  return STICKERS;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Sticker panel + wiring**

`components/StickerPanel.tsx`:

```tsx
'use client';

import type { Action } from '@/lib/actions';
import { listStickers } from '@/lib/stickers';
import type { Settings } from '@/lib/types';

export function StickerPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-500">Sticker frame</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => dispatch({ type: 'setSticker', stickerId: null })}
          className={`flex h-20 w-20 items-center justify-center rounded-xl border text-2xl ${
            settings.stickerId === null ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          aria-label="No sticker"
        >
          ✕
        </button>
        {listStickers().map((s) => (
          <button
            key={s.id}
            onClick={() => dispatch({ type: 'setSticker', stickerId: s.id })}
            className={`rounded-xl border p-1 ${
              settings.stickerId === s.id ? 'border-[#7b5cd6] bg-[#7b5cd6]/10' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            aria-label={`Sticker ${s.id}`}
            dangerouslySetInnerHTML={{ __html: s.thumb(76, 'SCAN ME') }}
          />
        ))}
      </div>
    </div>
  );
}
```

In `components/BuilderClient.tsx`: add `Sticker` to `TABS` (between `'Pattern'` and `'Corners'`), add `import { StickerPanel } from './StickerPanel';` and set the tab record entry `Sticker: <StickerPanel settings={settings} dispatch={dispatch} />`. Remove the `Logo` placeholder in favor of Task 10's panel — leave `Logo` placeholder text "Logo (task 10)".

- [ ] **Step 6: Verify + commit**

Run: `npx next build`
Expected: PASS. Dev check: selecting a sticker shrinks the QR into its `qrRect` and overlays the frame in the preview.

```bash
git add lib/stickers.ts lib/stickers-impl.ts lib/stickers.test.ts components/StickerPanel.tsx components/BuilderClient.tsx
git commit -m "feat: sticker frames with preview overlay"
```

---

### Task 10: Logo panel

**Files:**
- Create: `components/LogoPanel.tsx`
- Modify: `components/BuilderClient.tsx`

**Interfaces:**
- Consumes: `Action`, `LogoSettings`
- Produces: `LogoPanel({ settings, dispatch })` — upload (data URL), size slider 0.1–0.4, `hideBackgroundDots` checkbox, remove button

- [ ] **Step 1: Write LogoPanel**

`components/LogoPanel.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';
import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';
import { Toggle } from './controls';

export function LogoPanel({ settings, dispatch }: {
  settings: Settings;
  dispatch(action: Action): void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logo = settings.logo;

  const onFile = (file: File | undefined) => {
    setUploadError(null);
    if (!file) return;
    if (!/^(image\/(png|jpeg|webp|svg\+xml))$/.test(file.type)) {
      setUploadError('Pick a PNG, JPEG, WEBP or SVG image.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setUploadError('Could not read that file.');
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) dispatch({ type: 'setLogo', patch: { dataUrl: result } });
      else setUploadError('Could not read that file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-[#7b5cd6]"
        >
          Upload logo
        </button>
        {uploadError && <p className="mt-2 text-sm text-red-600" role="alert">{uploadError}</p>}
      </div>

      {logo.dataUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.dataUrl} alt="Logo preview" className="h-16 w-16 rounded border border-gray-200 bg-white object-contain" />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Logo size ({Math.round(logo.size * 100)}%)
            <input
              type="range"
              min={0.1}
              max={0.4}
              step={0.02}
              value={logo.size}
              onChange={(e) => dispatch({ type: 'setLogo', patch: { size: Number(e.target.value) } })}
              className="w-full accent-[#7b5cd6]"
            />
          </label>
          <Toggle
            label="Clear dots behind the logo"
            checked={logo.hideBackgroundDots}
            onChange={(hideBackgroundDots) => dispatch({ type: 'setLogo', patch: { hideBackgroundDots } })}
          />
          <button
            onClick={() => dispatch({ type: 'setLogo', patch: { dataUrl: null } })}
            className="self-start text-sm font-semibold text-red-600 hover:underline"
          >
            Remove logo
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire into BuilderClient**

Replace `Logo: <PlaceholderTab … />` with `<LogoPanel settings={settings} dispatch={dispatch} />`, import `LogoPanel`, delete the `PlaceholderTab` helper (no remaining uses).

- [ ] **Step 3: Verify + commit**

Run: `npx next build`
Expected: PASS. Dev check: uploading a small PNG centers it on the QR; error-correction bumps to H (verify via the preview's finder patterns remaining intact).

```bash
git add components/LogoPanel.tsx components/BuilderClient.tsx
git commit -m "feat: logo upload panel"
```

---

### Task 11: Compose + download

**Files:**
- Create: `lib/compose.ts`, `components/DownloadPanel.tsx`
- Modify: `components/BuilderClient.tsx`
- Test: `lib/compose.test.ts`

**Interfaces:**
- Consumes: `getSticker`, `Settings`, live `QRCodeStyling` instance
- Produces:
  - `composeSvg({ qrSvg, settings }): string` — final `viewBox 0 0 1000 1000` SVG string
  - `rasterize(svg: string, size: number, mimeType: 'image/png' | 'image/jpeg' | 'image/webp'): Promise<Blob>`
  - `saveBlob(blob: Blob, filename: string): void`
  - `downloadQr(settings: Settings, qr: QRCodeStyling): Promise<void>`
  - `DownloadPanel({ settings, dispatch, qr, error })`

- [ ] **Step 1: Failing compose test**

`lib/compose.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { composeSvg } from './compose';
import { DEFAULT_SETTINGS } from './settings';

const QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#fff"/></svg>';

describe('composeSvg', () => {
  it('embeds the QR svg at full size when no sticker is chosen', () => {
    const out = composeSvg({ qrSvg: QR_SVG, settings: DEFAULT_SETTINGS });
    expect(out.startsWith('<svg')).toBe(true);
    expect(out).toContain('viewBox="0 0 1000 1000"');
    expect(out).toContain('fill="#fff"'); // inner content preserved
  });

  it('draws the sticker frame and positions the QR inside its box', () => {
    const s = { ...DEFAULT_SETTINGS, stickerId: 'square' };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain('stroke-width="20"');
    expect(out).toContain('x="120"'); // square sticker qrRect.x
    expect(out).toContain('SCAN ME');
  });

  it('fills the canvas background unless transparent', () => {
    const out = composeSvg({ qrSvg: QR_SVG, settings: DEFAULT_SETTINGS });
    expect(out).toContain(`fill="${DEFAULT_SETTINGS.pattern.bgColor}"`);
    const s = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, transparentBg: true } };
    expect(composeSvg({ qrSvg: QR_SVG, settings: s })).not.toContain('<rect width="1000" height="1000" fill=');
  });

  it('uses one defs gradient for the background when enabled', () => {
    const s = { ...DEFAULT_SETTINGS, pattern: { ...DEFAULT_SETTINGS.pattern, bgGradient: true } };
    const out = composeSvg({ qrSvg: QR_SVG, settings: s });
    expect(out).toContain('stop-color="' + DEFAULT_SETTINGS.pattern.bgFrom + '"');
    expect(out).toContain('stop-color="' + DEFAULT_SETTINGS.pattern.bgTo + '"');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/compose.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement compose**

`lib/compose.ts`:

```typescript
import { getSticker } from './stickers';
import type { Settings } from './types';

export function composeSvg({ qrSvg, settings }: { qrSvg: string; settings: Settings }): string {
  const p = settings.pattern;
  const sticker = getSticker(settings.stickerId);

  const background = p.transparentBg
    ? ''
    : p.bgGradient
      ? `<defs><linearGradient id="bggrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bgFrom}"/><stop offset="1" stop-color="${p.bgTo}"/></linearGradient></defs><rect width="1000" height="1000" fill="url(#bggrad)"/>`
      : `<rect width="1000" height="1000" fill="${p.bgColor}"/>`;

  const inner = qrSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const qrBox = sticker ? sticker.qrRect : { x: 0, y: 0, w: 1000 };
  const frame = sticker ? sticker.frame(sticker.label ?? '') : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">` +
    background +
    `<svg x="${qrBox.x}" y="${qrBox.y}" width="${qrBox.w}" height="${qrBox.w}" viewBox="0 0 1000 1000">${inner}</svg>` +
    frame +
    `</svg>`
  );
}

export async function rasterize(svg: string, size: number, mimeType: 'image/png' | 'image/jpeg' | 'image/webp'): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to rasterize the QR image.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available in this browser.');
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(img, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType));
    if (!blob) throw new Error('Could not encode the image.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: DownloadPanel**

`components/DownloadPanel.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { composeSvg, rasterize, saveBlob } from '@/lib/compose';
import type { Action } from '@/lib/actions';
import type { DownloadFormat, Settings } from '@/lib/types';

const FORMATS: DownloadFormat[] = ['png', 'jpeg', 'svg', 'webp'];
const SIZES: Array<512 | 1024 | 2048> = [512, 1024, 2048];

export function DownloadPanel({ settings, dispatch, qr, error }: {
  settings: Settings;
  dispatch(action: Action): void;
  qr: QRCodeStyling;
  error: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const download = async () => {
    setBusy(true);
    setFailure(null);
    try {
      const raw = await qr.getRawData('svg');
      const text = typeof raw === 'string' ? raw : await new Blob([raw as BlobPart]).text();
      const svg = composeSvg({ qrSvg: text, settings });
      const ext = settings.download.format;
      const filename = `qr-code.${ext}`;
      if (ext === 'svg') {
        saveBlob(new Blob([svg], { type: 'image/svg+xml' }), filename);
      } else {
        const mime = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }[ext];
        saveBlob(await rasterize(svg, settings.download.size, mime), filename);
      }
    } catch (e) {
      setFailure(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Format
          <select
            value={settings.download.format}
            onChange={(e) => dispatch({ type: 'setDownload', patch: { format: e.target.value as DownloadFormat } })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize focus:border-[#7b5cd6] focus:outline-none"
          >
            {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Size
          <select
            value={settings.download.size}
            disabled={settings.download.format === 'svg'}
            onChange={(e) => dispatch({ type: 'setDownload', patch: { size: Number(e.target.value) as 512 | 1024 | 2048 } })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7b5cd6] focus:outline-none disabled:text-gray-400"
          >
            {SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
          </select>
        </label>
      </div>
      <button
        onClick={download}
        disabled={Boolean(error) || busy}
        className="rounded-xl bg-[#23234f] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#7b5cd6] disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Download QR
      </button>
      {failure && <p className="text-sm text-red-600" role="alert">{failure}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Wire into BuilderClient**

In `components/BuilderClient.tsx`, remove the download placeholder and render, inside preview panel under `<QrPreview … />`:

```tsx
<DownloadPanel settings={settings} dispatch={dispatch} qr={qr.current} error={error} />
```

plus `import { DownloadPanel } from './DownloadPanel';`. When `error` is non-null the button is disabled — the QR instance may hold a stale last-good payload, which is fine.

- [ ] **Step 7: Verify + commit**

Run: `npx next build`
Expected: PASS. Dev check: download a PNG of `example.com`, open it, scan it with a phone — decodes to `https://example.com`.

```bash
git add lib/compose.ts lib/compose.test.ts components/DownloadPanel.tsx components/BuilderClient.tsx
git commit -m "feat: sticker-aware export for png jpeg svg webp"
```

---

### Task 12: E2E scan-back test + deploy docs

**Files:**
- Create: `playwright.config.ts`, `e2e/constructor.spec.ts`, `README.md`

**Interfaces:**
- Consumes: everything above (running app)

- [ ] **Step 1: Install Playwright + decoders**

Run:
`npm install -D @playwright/test pngjs jsqr && npx playwright install chromium`
Expected: both install; `@types/react` may warn — ignore.

- [ ] **Step 2: Write config + spec**

`playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

`e2e/constructor.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import * as fs from 'node:fs';

test('constructor downloads a scannable QR of the typed URL', async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  await page.goto('/constructor');
  await page.getByPlaceholder('https://').fill('example.com/hello-e2e');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  const path = testInfo.outputPath('qr.png');
  await download.saveAs(path);

  const png = PNG.sync.read(fs.readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('https://example.com/hello-e2e');
});

test('landing page has the hook and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Create Static QR' })).toBeVisible();
  await expect(page.getByText('No sign-ups. No payments. Just grab your working QR code.')).toBeVisible();
});
```

- [ ] **Step 3: Run e2e**

Run: `npx next build && npm run e2e`
Expected: 2 tests PASS (build once first, since `npm run start` serves the production build).

- [ ] **Step 4: README**

`README.md`:

```markdown
# QR Generator

Free static QR code generator. No logins, no payments — everything runs in the browser; the server serves static assets only.

## Develop

    npm install
    npm run dev      # http://localhost:3000

## Test

    npm run test     # vitest unit tests
    npx next build && npm run e2e   # playwright (serves the production build)

## Deploy (Vercel)

Push to a Git host, then `vercel` (or import at vercel.com/new). Defaults work: framework preset **Next.js**, no env vars, no API routes — both pages are statically rendered and served from the CDN.

    npm run build    # local check: builds the same output Vercel deploys
```

- [ ] **Step 5: Full verification**

Run: `npx next build && npx vitest run && npm run e2e`
Expected: build PASS, unit tests PASS, e2e PASS.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e README.md package.json package-lock.json
git commit -m "test: e2e scan-back verification and deploy docs"
```

---

## Self-Review Notes

- Spec coverage: landing (Task 5), type chips + fields (7), pattern + gradient + bg/transparent (8), corners (8), stickers (9), logo (10), preview (6), download all 4 formats + sizes (11), validation (2), tests (2,3,4,9,11,12), Vercel static-only (1, 12). Corner styling variants intentionally trimmed to library-native sets per spec note.
- Type consistency: `ContentField`/`Action`/`Sticker`/`composeSvg`/`buildQrConfig` signatures are referenced consistently across tasks.
- One wrinkle flagged for implementers: the sticker SVG overlay in `QrPreview` and export path in `composeSvg` must use the same `QR_SVG`-at-1000 convention — both do via `buildQrConfig(settings, 1000)` (export) and scaled `size` (preview only).