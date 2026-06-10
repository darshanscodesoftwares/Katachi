# Katachi — Project Brief

## Current Status

> Living section maintained during development — read this first when resuming a session. Keep it updated after every increment; assume any session can end abruptly.

- **Phase:** 1 — Foundation (in progress)
- **Done:** Brief; workspace; **@katachi/schema** (14 tests); **@katachi/renderer complete for Phase 1** — cascade (17 tests), six sections at one variant each (hero/about/projectsGrid/experienceTimeline/skills/contact) each with props schema + defaults + inspector field manifest, background layers (color/gradient/aurora/sweep/noise) + the five §10 Phase-1 presets, registry, RenderSection/RenderPage, styles.css, purity lint green.
- **In progress:** —
- **Next step:** `apps/web` Next.js shell (TS strict + Tailwind + transpilePackages) with landing page; verify `pnpm build`.
- **Waiting on owner:** Supabase env vars (`apps/web/.env.local`, see §16). Everything must build/test without them; live-DB + auth verification is deferred until they arrive. Never commit secrets.

---

This file is the single source of truth for this project. Read it fully before writing any code. Build strictly in phase order (see **Build Phases**). Do not scaffold future phases early. When a decision is made during development, append it to the **Decisions Log** at the bottom of this file.

---

## 1. What we are building

A **portfolio design ecosystem** with two faces built from one codebase:

1. **The Studio** (`/studio`) — a private admin/customizer where the owner designs everything: pages, sections, blocks, themes, backgrounds, media. Think "mini Webflow scoped to portfolios."
2. **The published portfolio** — the public output, rendered from the Studio's saved configuration. Served live now; static-exportable later.

**Core mental model: one schema, one renderer, two shells.** The entire portfolio (pages → sections → nested blocks → themes) lives as a single JSON document tree. The Studio is an *editor* of that tree; the public site is a *renderer* of it. The same renderer components are used in both places — that is what guarantees true WYSIWYG.

**Trajectory:** personal tool now, SaaS later. Build single-tenant *features* on a multi-tenant *data model* (User → Portfolios → Versions). Do NOT build billing, teams, or marketplace yet.

---

## 2. Non-negotiable principles

1. **Renderer purity.** `packages/renderer` takes config in, returns UI out. It may import only React, the schema package, and its own styles. No database calls, no Next.js imports, no `fetch`, no environment variables. This purity is what makes static export cheap later. Enforce with an ESLint `no-restricted-imports` rule.
2. **Tokens first, escape hatches second.** All styling flows through a cascading token system resolved to CSS variables: `global theme → page override → section override → block style`. Raw `customCss` exists per-node as an escape hatch — never as the primary mechanism.
3. **Heavy for the owner, featherweight for visitors.** The Studio bundle may be large (TipTap, dnd-kit live there). Published pages must be lean: Server Components by default, per-block code splitting, CSS-first animation. Budget: Lighthouse ≥ 95, ≤ ~100 KB JS for a typical portfolio.
4. **Everything is data.** Because the design is a JSON document, we get versioning, rollback, preset import/export, and template sharing without new architecture. Never store design state outside the config tree.
5. **Validate at every boundary.** All config entering the API or database is validated with Zod schemas generated alongside the TypeScript types.

---

## 3. Tech stack (locked — do not substitute without asking)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript (strict)** | One app: Studio + public routes |
| Styling | **Tailwind CSS + CSS variables** | Tokens compile to CSS vars; theme switch = swap var set |
| Drag & drop | **dnd-kit** | Sections and blocks |
| Editor state | **Zustand + zundo** | Undo/redo is mandatory |
| Rich text | **TipTap** (ProseMirror) | Stores JSON; nests into our Block tree natively |
| UI transitions | **Motion (Framer Motion)** | Studio UI + entrance animations; ambient backgrounds stay CSS |
| ORM / DB | **Prisma → Postgres on Supabase (free tier)** | 500 MB free; goes read-only past limit, never surprise-bills |
| Auth | **Supabase Auth** | Email + OAuth; free |
| File storage | **Supabase Storage** now → Cloudflare R2 when media outgrows 1 GB | |
| Image pipeline | **sharp** at upload time | Resize/crop/optimize to AVIF/WebP; serve static URLs (avoids per-request optimization costs) |
| Hosting | **Vercel Hobby (free)** | Non-commercial — fine for the personal phase |
| Static export host (Phase 4) | GitHub Pages / Cloudflare Pages | Free |

Free-tier realities to design around: the database cold-starts ~0.5–2 s after idle (acceptable), and storage caps are hard limits, not overage bills.

---

## 4. Monorepo layout (pnpm workspaces)

```
katachi/
├── CLAUDE.md                 ← this file
├── package.json              ← pnpm workspace root
├── packages/
│   ├── schema/               ← TypeScript types + Zod validators + defaults. Zero deps beyond zod.
│   └── renderer/             ← Pure React components. Imports ONLY react + @katachi/schema.
│       ├── sections/         ← one folder per section type
│       ├── blocks/           ← one folder per block type
│       ├── backgrounds/      ← background layer implementations
│       ├── cascade.ts        ← token resolution → CSS variable map
│       └── registry.ts       ← lazy-loaded type → component maps
└── apps/
    └── web/                  ← Next.js app
        ├── app/studio/       ← the editor (client-heavy, auth-gated)
        ├── app/p/[slug]/     ← public portfolios (RSC, ISR)
        ├── app/api/          ← config CRUD, publish, upload
        └── lib/              ← prisma client, supabase, sharp pipeline
```

---

## 5. Database model (Prisma)

```prisma
model Profile {            // mirrors Supabase auth.users
  id         String      @id            // = auth user id
  email      String      @unique
  name       String?
  portfolios Portfolio[]
  assets     Asset[]
  createdAt  DateTime    @default(now())
}

model Portfolio {
  id                 String   @id @default(cuid())
  userId             String
  user               Profile  @relation(fields: [userId], references: [id])
  name               String
  slug               String   @unique       // public URL: /p/[slug]
  draftVersionId     String?  @unique       // pointer
  publishedVersionId String?  @unique       // pointer — publish = copy draft → new version → move pointer
  versions           PortfolioVersion[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model PortfolioVersion {
  id          String    @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id])
  config      Json      // the entire PortfolioConfig tree (validated by Zod before write)
  label       String?   // "Published 2026-06-10", "Before redesign"
  createdAt   DateTime  @default(now())
}

model Asset {
  id          String   @id @default(cuid())
  userId      String
  user        Profile  @relation(fields: [userId], references: [id])
  portfolioId String?
  kind        String   // image | video | audio | document | font | svg
  url         String
  mime        String
  sizeBytes   Int
  width       Int?
  height      Int?
  alt         String?
  focalX      Float?   // focal point for smart cropping
  focalY      Float?
  createdAt   DateTime @default(now())
}
```

Publishing flow: **draft is mutable** (autosaved into the version row pointed at by `draftVersionId`); **Publish** snapshots the draft into a new immutable `PortfolioVersion` and moves `publishedVersionId`. Rollback = move the pointer. Public routes only ever read the published version.

---

## 6. The schema contract (`packages/schema`)

This tree IS the product. Every feature in this brief is a field here.

```ts
// ---------- tokens ----------
export type FontRef = {
  family: string                    // "Inter" | uploaded family name
  source: 'google' | 'custom'
  url?: string                      // custom .woff2 asset URL
  fallback: string                  // "sans-serif"
}

export type ThemeTokens = {
  colors: {
    background: string; surface: string
    text: string; textMuted: string
    primary: string; secondary: string; accent: string
    border: string
  } & Record<string, string>        // user-defined extra swatches
  fonts: { heading: FontRef; body: FontRef; mono?: FontRef }
  typeScale: { basePx: number; ratio: number }   // sizes = base * ratio^n
  spacing: { unitPx: number }                    // scale = unit × [0.5,1,2,3,4,6,8,12,16]
  radii: { sm: string; md: string; lg: string; full: string }
  shadows: { sm: string; md: string; lg: string }
  motion: { fast: string; base: string; slow: string; easing: string }
}

// Any color-ish value may be a raw CSS value OR a token reference.
// Token refs are what make SVG/CSS backgrounds re-theme automatically.
export type ColorValue = string | { token: string }   // e.g. { token: 'colors.primary' }

// ---------- document tree ----------
export type PortfolioConfig = {
  version: 1                        // schema version for future migrations
  theme: ThemeTokens
  nav: NavConfig                    // links, logo, layout: 'top' | 'side' | 'hidden'
  pages: Page[]
  meta: { title: string; description?: string; faviconAssetId?: string; ogImageAssetId?: string }
}

export type Page = {
  id: string
  slug: string                      // '' = home
  title: string
  hiddenFromNav?: boolean
  seo?: { title?: string; description?: string; ogImageAssetId?: string }
  themeOverride?: DeepPartial<ThemeTokens>      // per-page presets
  sections: Section[]
}

export type Section = {
  id: string
  type: string                      // see Section Library — 'custom' uses raw blocks
  variant: string                   // layout variant within the type
  label?: string                    // shown in Studio tree
  props: Record<string, unknown>    // per-type content, validated by that section's Zod schema (§8)
  themeOverride?: DeepPartial<ThemeTokens>      // section-level themes
  background?: BackgroundLayer[]    // stacked bottom → top
  visibility?: Condition
  responsive?: ResponsiveOverrides
  style?: StyleOverrides
  blocks: Block[]
}

export type Block = {
  id: string
  type: string                      // see Block Library
  props: Record<string, unknown>    // per-type, validated by that block's Zod schema
  style?: StyleOverrides
  responsive?: ResponsiveOverrides
  visibility?: Condition
  children?: Block[]                // recursion = nesting, custom sections, grids
}

// ---------- behavior ----------
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export type Condition =
  | { type: 'always' }
  | { type: 'hidden' }                            // manual toggle in Studio
  | { type: 'breakpoint'; show: Breakpoint[] }
  | { type: 'dateRange'; from?: string; to?: string }

export type ResponsiveOverrides = Partial<Record<Breakpoint, {
  variant?: string
  style?: StyleOverrides
}>>

// ---------- styling ----------
export type Sides<T = string>   = { top?: T; right?: T; bottom?: T; left?: T }
export type Corners<T = string> = { tl?: T; tr?: T; br?: T; bl?: T }

export type StyleOverrides = {
  // box
  padding?: Sides; margin?: Sides
  width?: string; maxWidth?: string; minHeight?: string
  align?: 'start' | 'center' | 'end'
  gap?: string
  // surface
  background?: ColorValue
  border?: Sides<{ width: string; style: string; color: ColorValue }>
  radius?: Corners
  shadow?: string[]                  // stackable, supports inset
  opacity?: number
  backdropBlur?: string              // glassmorphism
  blendMode?: string
  // text
  color?: ColorValue
  fontFamily?: 'heading' | 'body' | 'mono'
  fontSize?: string; fontWeight?: number
  lineHeight?: string; letterSpacing?: string
  textTransform?: 'none' | 'uppercase' | 'capitalize'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textShadow?: string
  gradientText?: { from: ColorValue; to: ColorValue; angle: number }
  // behavior
  hideOn?: Breakpoint[]
  sticky?: boolean
  zIndex?: number
  hover?: { background?: ColorValue; color?: ColorValue; shadow?: string[]
            lift?: boolean; scale?: number; glow?: ColorValue }
  entrance?: { preset: 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'blur-in'
               delayMs?: number; durationMs?: number; easing?: string }
  // escape hatch — scoped to this node's wrapper only
  customCss?: string
}

// ---------- backgrounds ----------
export type BackgroundLayer = {
  id: string
  type: 'color' | 'gradient' | 'image' | 'svgPattern' | 'noise'
      | 'particles' | 'video' | 'shader'
  props: Record<string, unknown>     // colors as ColorValue (token refs!), speed, density, angle…
  opacity?: number
  blendMode?: string
  parallax?: number                  // 0 = fixed with content, 1 = full parallax
}
```

Every type above ships with a matching Zod schema and a `defaultX()` factory in `packages/schema`.

---

## 7. The style cascade (`packages/renderer/cascade.ts`)

One resolver powers theme switching, per-page presets, and section-level themes simultaneously:

```
resolveTokens(theme, page.themeOverride, section.themeOverride)
  → flat CSS-variable map ( --color-primary, --font-heading, --space-4, --radius-md … )
  → applied as inline style on the section wrapper
```

Rules:
- Deep-merge in order: global → page → section. Block-level `StyleOverrides` apply on the node itself, referencing variables where possible.
- `ColorValue` token refs resolve to `var(--…)` — never to literal values — so SVG patterns, gradients, and components re-theme instantly when the palette changes.
- `customCss` is scoped by wrapping each node in a unique `data-node` attribute selector. Sanitize: strip `@import`, `position: fixed` on body-level, and any `url()` to non-asset origins.
- Resolver must be a pure function with unit tests (this is the most-reused code in the project).

---

## 8. Section Library (initial registry)

Each section type = folder in `packages/renderer/sections/` with: component, Zod props schema, ≥2 variants, default factory, and a thumbnail for the Studio picker. The Studio "Add section" dropdown is generated from this registry — adding a section type to the registry is ALL that is needed for it to appear in the Studio.

| Type | Variants (min) | Notes |
|---|---|---|
| `hero` | centered, split (text+media), full-bleed | name, tagline, CTA buttons, media slot |
| `about` | text+portrait, two-column, narrative | |
| `projectsGrid` | cards, masonry, list | each project → optional case-study page link |
| `experienceTimeline` | vertical line, alternating, compact | the "timeline mode" |
| `skills` | badge cloud, bars, grouped columns | |
| `gallery` | grid, masonry, carousel + lightbox | the "gallery mode" |
| `caseStudy` | hero+sections, side-nav longform | the "case-study mode" |
| `testimonials` | cards, single rotating quote | |
| `contact` | form, link tiles, split | form posts to API route, stores submissions in DB |
| `resumeEmbed` | inline PDF viewer, download card | the "resume mode" |
| `custom` | — | empty shell: pure Block composition, the user designs from scratch |

Registries use `next/dynamic` / `React.lazy` so visitors download only the section types their portfolio uses.

## 9. Block Library (initial registry)

Containers: `stack` (vertical), `row`, `grid` (responsive columns, gap) — all use `children`.

Content blocks (each with Zod props + inspector panel):

- `richText` — TipTap JSON. Marks: bold, italic, underline, strikethrough, highlight, inline code, sub/superscript, text color, clear formatting. Nodes: H1–H6, paragraph, bullet/numbered/check list, blockquote, pull quote, drop cap, horizontal rule. Links: external URL, mailto, tel, scroll-to-section anchor, internal page, file download, new-tab toggle.
- `image` — asset ref, alt, aspect ratio, object-fit, filters (brightness/contrast/saturation/blur/grayscale/duotone), caption, optional link.
- `video` — uploaded file OR YouTube/Vimeo embed; autoplay/loop/mute/controls, custom poster.
- `audio`, `lottie`, `gifEmbed`
- `button` — label, link (all flavors above), variant (solid/outline/ghost/link), size, leading/trailing icon, hover state.
- `socialLinks` — platform list with auto icons.
- `downloadCard` — file asset (the "Download CV" block) with size/type chip.
- `icon` — library icon (lucide) or uploaded SVG, size, color (token-aware).
- `divider`, `spacer`, `badge`
- `statCounter` — animated count-up number + label.
- `skillBar` — label + percent, animated fill.
- `rating` — stars.
- `accordion` (FAQ), `tabs`, `table`
- `codeBlock` — syntax highlighting (shiki at render time on server; pre-highlighted HTML shipped to client = zero JS).
- `quoteCard` — testimonial: quote, avatar, name, role.
- `logoMarquee` — scrolling logo strip.
- `embed` — generic iframe/oEmbed: Figma, CodePen, GitHub gist, Spotify, X post, map.
- `formField` set — name/email/message inputs for `contact`.
- `countdown`, `qrCode`, `copyChip` (click-to-copy email)
- `timelineItem` — used inside `experienceTimeline`.

## 10. Background preset gallery

Users never pick a technology — they pick a named preset. Each preset is a `BackgroundLayer[]` recipe; implementation tech is internal:

| Preset | Tech | Phase |
|---|---|---|
| Solid / Gradient (linear, radial, conic, multi-stop) | CSS | 1 |
| Aurora (drifting blurred orbs) | CSS keyframes on blurred divs | 1 |
| Gradient Sweep (animated background-position) | CSS | 1 |
| Grain Overlay | inline SVG `feTurbulence` data-URI | 1 |
| Wave Divider (section top/bottom edges) | SVG, fills = token refs | 3 |
| Floating Blobs | SVG paths + CSS animation | 3 |
| Dot Grid / Line Grid Drift | SVG pattern | 3 |
| Cursor Spotlight | CSS radial gradient tracking pointer | 3 |
| Parallax Image | scroll-linked transform | 3 |
| Particle Field / Constellation (cursor-reactive) | canvas | 3 |
| Starfield | canvas | 3 |
| Shader Gradient | WebGL (lazy-loaded) | 3 (stretch) |

Hard rules for ALL backgrounds: animate only `transform`/`opacity`; pause when offscreen (IntersectionObserver) or tab hidden; max ONE canvas/WebGL layer per page; every animated preset goes still under `prefers-reduced-motion`.

---

## 11. The Studio (`/studio`) — editor spec

Three-pane layout:

1. **Left panel** — page switcher; section tree (drag to reorder via dnd-kit); "Add section" library dropdown (generated from registry, with thumbnails); per-section context menu: duplicate, delete, hide, save-as-preset.
2. **Center canvas** — live preview rendering the draft config through `packages/renderer` (the REAL renderer) wrapped in editing chrome: selection outlines, drag handles, insertion indicators, empty-state hints. Device toggles: mobile / tablet / desktop widths. Click selects a node; double-click enters text editing.
3. **Right inspector** — context-sensitive panels for the selected node, Figma-style tabs: **Content · Typography · Fill · Border · Effects · Layout · Animation**. Every field maps 1:1 to `StyleOverrides` / block props. Per-side padding/margin control with link/unlink toggle. Per-corner radius. Breakpoint switch shows/edits `responsive` overrides.

Editing behaviors:
- Floating toolbar on text selection (Notion-style) for rich-text marks + link insertion.
- Slash commands inside rich text (`/image`, `/button`, `/divider`…) inserting blocks.
- Format painter (copy/paste `StyleOverrides` between nodes), multi-select, right-click context menu, keyboard shortcuts (⌘Z/⌘⇧Z, ⌘D duplicate, Del, ⌘S force-save).
- Undo/redo via zundo on the config tree (history of ≥100 steps).
- Autosave: debounced 1.5 s after last change → PATCH draft version. Save indicator in top bar.
- Top bar: portfolio switcher, device toggles, undo/redo, "Preview" (opens public route with `?draft=token`), **Publish** button, version history drawer (list versions, preview, one-click rollback).

### Theme editor (left panel, global tab)
- **Palette**: color picker (HEX/RGB/HSL + alpha), eyedropper (EyeDropper API where available), saved brand swatches, recently used, full gradient builder, **palette extraction from an uploaded image**, live **contrast checker** (WCAG AA badge on text/background pairs).
- **Typography**: Google Fonts search + preview, custom `.woff2` upload (stored as font Asset), heading/body/mono assignment, base size + scale ratio with live specimen.
- **Spacing / radii / shadows / motion** token controls with visual previews.
- **Theme presets**: ship 6–8 starter themes; one-click apply; export/import any theme or section preset as JSON.

### Media manager
Upload via drag-drop, clipboard paste, or URL import → server pipeline: validate → `sharp` (resize to 3 widths, AVIF/WebP, strip EXIF) → Supabase Storage → Asset row. Per-asset: alt text (required nudge), crop + focal point editor, filters. Documents (PDF) and fonts pass through untouched. Browseable grid with search, reuse across portfolio.

---

## 12. Publishing & delivery

- **Public route now**: `app/p/[slug]/[[...page]]` — RSC, reads ONLY `publishedVersionId` config, renders via `packages/renderer`. ISR with on-demand revalidation: the Publish action calls `revalidatePath`. Per-page SEO meta + OG tags from config; sitemap + robots generated.
- **Draft preview**: same route with signed `?draft=` token renders the draft (no caching).
- **Subdomains (Phase 4)**: middleware reads `Host`, maps `slug.domain.tld` → rewrite to `/p/[slug]`. Local dev via `slug.localhost:3000`.
- **Static export (Phase 4)**: `pnpm export --slug=<slug>` script — fetches published config, feeds the SAME renderer, emits a static bundle (`/export/<slug>/`): HTML per page, resolved CSS variables inlined, hashed assets copied, and a small JS runtime ONLY for the interactive blocks/backgrounds that page actually uses. Output deployable as-is to GitHub Pages / Cloudflare Pages. Document the limitation: the contact form in static mode posts to the hosted API URL or falls back to `mailto`.

---

## 13. Performance & accessibility budget (enforced, not aspirational)

- Published pages: **Lighthouse ≥ 95** (performance + accessibility), **≤ ~100 KB JS** for a typical portfolio. Check with `next build` output + a Lighthouse run before closing each phase.
- Server Components by default on public routes; client islands only where interaction demands it.
- Per-type lazy loading in section/block/background registries — unused types must not ship.
- Images: responsive `srcset` from the 3 generated widths, lazy-loaded below the fold, dimensions always set (no CLS).
- Animations: `transform`/`opacity` only; `prefers-reduced-motion` respected globally.
- A11y: semantic landmarks per section, focus-visible styles, alt text surfaced in Studio, contrast checker in theme editor, keyboard-navigable Studio.

---

## 14. Build Phases — work strictly in order

Within a phase: propose a short plan first, then implement, then verify against the acceptance list. Do not start the next phase until every box checks.

### Phase 1 — Foundation
Scope: pnpm monorepo; `packages/schema` (all types in §6 + Zod + defaults); `packages/renderer` with cascade resolver and SIX sections (`hero`, `about`, `projectsGrid`, `experienceTimeline`, `skills`, `contact`) at one variant each; Prisma schema (§5) + Supabase project wiring; Supabase Auth (email magic link is enough); Studio shell: three panes, section tree (no drag yet — up/down buttons fine), inspector with Content + basic Typography/Fill/Layout, global theme editor (palette + Google Fonts + spacing); autosave to draft; Publish pointer flow; public `/p/[slug]` (RSC + ISR); background presets: solid, gradient, aurora, gradient sweep, grain.
**Done when:** sign in → edit hero text and see it live in canvas → change primary color and the whole preview re-themes instantly → reload and the draft persisted → Publish → `/p/[slug]` shows the published version server-rendered → editing the draft again does NOT change the public page until next publish → cascade resolver has unit tests passing.

### Phase 2 — Editor power (daily-driver features)
Scope: dnd-kit drag-reorder for sections AND blocks (with insertion indicators); Add-section dropdown from registry with thumbnails; duplicate/delete/hide; `richText` block via TipTap with floating toolbar, full marks list (§9), all link flavors, slash commands; media manager + sharp pipeline + alt/crop/focal; `image`, `video`, `button`, `socialLinks`, `downloadCard`, `icon`, `divider`, `spacer` blocks; undo/redo (zundo) + keyboard shortcuts; version history drawer + rollback; device preview toggles; remaining variants for the six Phase 1 sections.
**Done when:** a complete real portfolio (yours) can be built start-to-finish in the Studio without touching code: reordered sections, rich text with links, uploaded images with alt text, working Download-CV button, undo survives 50+ steps, rollback to an older version works.

### Phase 3 — Deep customization
Scope: full inspector (every `StyleOverrides` field: per-side borders, per-corner radius, stacked shadows, opacity, backdrop blur, blend modes, hover states, entrance animations, gradient text, `customCss` escape hatch with sanitizer); section-level `themeOverride` + per-page presets UI; full background gallery (§10) with layer stacking panel (reorder layers, opacity, blend, parallax); responsive overrides per breakpoint; conditional visibility UI; the `custom` section + block composer (containers + any block, nestable) + "save as reusable preset"; preset/theme import-export JSON; color tools (gradient builder, eyedropper, palette-from-image, contrast checker); remaining sections (`gallery`, `caseStudy`, `testimonials`, `resumeEmbed`) and remaining blocks (§9); format painter + multi-select.
**Done when:** a section can be built from a blank `custom` shell into a novel layout, saved as a preset, and reused; a portfolio can look radically different per page; backgrounds layer (gradient + grain + particles) and go still under reduced-motion; exported preset JSON re-imports cleanly into a fresh portfolio.

### Phase 4 — Shipping modes
Scope: subdomain middleware + custom slug management; SEO pass (per-page meta, OG image, favicon upload, sitemap, robots); the static export script (§12) with per-page HTML, asset copying, and minimal runtime; Lighthouse/bundle budget verification wired into CI or a `pnpm check` script; contact-form fallback strategy for static mode.
**Done when:** `pnpm export --slug=mine` produces a folder that deploys to Cloudflare Pages and scores ≥95 Lighthouse; the hosted version revalidates within seconds of Publish; both outputs are pixel-equivalent for a non-interactive page.

### Phase 5 — SaaS layer (LATER — do not build now)
Multi-user onboarding, plans/billing, template marketplace, custom domains, teams. The data model already supports it; the features wait.

---

## 15. Working conventions for Claude Code

1. **Plan before code** within each phase; list the files you'll touch.
2. **Never violate renderer purity** (§2.1). If a renderer component needs data, the data arrives as props from the shell.
3. **Registry-driven everything**: adding a section/block/background = one folder + one registry entry. No switch statements scattered through the app.
4. **Zod at boundaries**: API routes parse with schema package validators; never trust client JSON.
5. **No new heavy dependencies without asking.** Current dep budget is the table in §3.
6. **Small commits, one feature each**, message format `phase1: section tree reordering`.
7. **Tests where they pay**: cascade resolver, Zod schemas, publish/rollback pointer logic, export script. Skip UI snapshot churn.
8. **Update this file**: append every notable decision to the Decisions Log below; if scope changes, edit the phase lists.
9. If something in this brief conflicts with reality (API changed, library renamed), say so and propose the fix — don't silently substitute.

---

## 16. Environment & setup

```
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=            # Supabase Postgres connection string (pooled)
DIRECT_URL=              # direct connection for Prisma migrations
DRAFT_PREVIEW_SECRET=    # signs ?draft= tokens
```

Free-stack checklist (owner does once): create Supabase project (DB + Auth + Storage bucket `media`), create Vercel Hobby project, paste env vars. Everything in this brief runs at $0; the only optional cost is a custom domain.

---

## 17. Decisions Log

> Append entries as `YYYY-MM-DD — decision — why`. Never delete entries; strike through reversals.

- 2026-06-10 — Stack locked per §3; brief authored. — Project start.
- 2026-06-10 — Project renamed **Katachi**; workspace packages are `@katachi/schema` and `@katachi/renderer`; monorepo root dir reflects repo name. — Owner request at kickoff.
- 2026-06-10 — Supabase env vars not yet available. All Phase 1 code, Prisma migrations, and tests must work without a live database (`.env.example` committed, migrations generated offline via `prisma migrate diff`, env-guarded clients, `/setup` page when unconfigured). Live verification of auth/persist/publish deferred until `.env.local` arrives. — Owner constraint at kickoff.
- 2026-06-10 — Added `props: Record<string, unknown>` to `Section` (§6). — §8 already mandates a per-section Zod props schema + default factory; §6 omitted the field. Sections need first-class content (hero name/tagline) in Phase 1, before the Phase 2 `richText` block exists. Mirrors `Block.props`.
- 2026-06-10 — `NavConfig` defined as `{ layout: 'top'|'side'|'hidden'; logoText?; logoAssetId?; links: { id, label, pageId?, href? }[] }`. — Referenced in §6 but never specified.
- 2026-06-10 — `@katachi/schema` re-exports `z` from zod. — Lets renderer section folders define their props schemas (§8) while importing only react + the schema package, keeping the §2.1 purity rule literal and lintable.
- 2026-06-10 — Section registry is a static map for now; per-type lazy loading (§8) starts when the first client-interactive section lands. — Phase 1 sections are zero-JS server components, so laziness would save visitors nothing today; the registry shape already isolates the change.
- 2026-06-10 — Gradient Sweep animates an oversized strip via `transform`, not `background-position` as §10's table says. — The §10 hard rule (animate only transform/opacity) wins over the table's implementation note; visual result identical.
- 2026-06-10 — Aurora/sweep are `kind`s of the `gradient` layer type; Grain is the `noise` type. — §6's BackgroundLayer type union is closed; presets are recipes over those primitives (§10 "implementation tech is internal").
- 2026-06-10 — Animated background stacks mount a ~0.5 KB client island (IntersectionObserver + visibilitychange) to satisfy §10's pause-offscreen rule; static stacks ship zero JS. — Cheapest way to honor the hard rule without a global script.
