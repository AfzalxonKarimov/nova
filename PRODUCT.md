# NOVA — Product Document

> **Your browser, finally organized.**

A Chrome extension that turns Chrome into a beautiful, fast, keyboard-first personal workspace for developers, students, researchers, and creators.

---

## 1. Vision & Philosophy

### Mission

Turn the modern browser into a coherent, calm, and productive interface layer — without replacing Chrome itself.

### Design Principles

| Principle | What it means |
|-----------|---------------|
| **Minimal** | Never show something unless it is useful. |
| **Fast** | Interactions should feel instant. |
| **Keyboard-first** | Power users should rarely need the mouse. |
| **Beautiful** | Typography, spacing, animations, shadows, and hierarchy feel intentional. |
| **Calm** | No visual noise, excessive colors, gradients, giant cards, or glassmorphism. |
| **Functional** | Every beautiful element has a purpose. |

> **Most important rule:** When deciding between adding another feature and making the existing experience 20% more polished, choose polish.

### Aesthetic

**Premium + technical + calm.**

Inspirations: Linear, Raycast, Arc, Apple, Vercel — but NOVA has its own visual identity.

Default aesthetic: monochromatic/neutral, subtle contrast, generous whitespace, rounded corners, restrained shadows, beautiful typography, subtle borders, extremely subtle animations.

---

## 2. Target User

A young technical power user who:

- Codes and researches daily
- Uses GitHub, YouTube, Google, ChatGPT, Drive
- Works on multiple personal projects simultaneously
- Studies and manages university applications
- Has many browser tabs open at once
- Switches between contexts constantly
- Wants to stay productive and hates clutter

**Persona:** Developer + student + creator + internet power user.

---

## 3. Core Experience

NOVA has four major surfaces, built in priority order:

1. **NOVA New Tab** — beautiful dashboard replacing Chrome's new-tab page
2. **Command Palette** — instant search & run any command (`Ctrl+K`)
3. **Workspace / Tab Management** — organize tabs into named, colored workspaces
4. **Quick Side Panel** — compact right-side utility panel

---

## 4. Feature Reference

### 4.1 New Tab Page

Replaces Chrome's default new-tab page via `chrome_url_overrides`.

**Default layout (clean, adaptive):**

```
              11:24

         Wednesday
        September 2

    What are you working on?

         [ Search or type a URL… ]

           GitHub   YouTube   Gmail
          Drive    ChatGPT   Calendar
         (quick links grid)

    Continue where you left off
    ─────────────────────────────
    GitHub — Project NOVA        12 minutes ago
    University Research          Yesterday
    ─────────────────────────────

    Saved pages
    ─────────────────────────────
    Linear docs — Keyboard design
    ─────────────────────────────
```

**Configurable sections (toggle in settings):**

| Section | Purpose |
|---------|---------|
| Clock + Greeting | Centerpiece time display |
| Search bar | Universal search/navigation |
| Quick links | User-defined favorite sites |
| Recent pages | Continue where you left off |
| Saved pages | Previously saved pages |

**Focus Mode** hides everything except the clock, greeting, and search bar.

### 4.2 Universal Search

In the new-tab search bar and the command palette.

Supports:

- **Google search** (default engine, configurable)
- **Direct URL navigation** (`example.com` → auto-completes to `https://example.com`)
- **Intent detection** — distinguishes URLs from search terms intelligently
- **Open-tab search** — find already-open tabs
- **Saved page search** — find previously saved pages
- **Bookmark search** — (planned, subject to permissions)
- **History search** — (planned, subject to `history` permission)

Search feels like Spotlight / Raycast: type, arrow to navigate, `Enter` to open.

### 4.3 Command Palette

`Ctrl+K` (or `Cmd+K` on macOS) opens a centered, modal command palette.

**Command categories:**

| Category | Commands |
|----------|----------|
| **tab** | New Tab, Close Tab, Reload Tab, Duplicate Tab, Search Tabs |
| **navigation** | Go to URL, Search Google, Open Bookmarks |
| **workspace** | Create Workspace, Open Workspace, Switch Workspace |
| **save** | Save Current Page, Open Saved Pages |
| **focus** | Toggle Focus Mode, Enter Focus Mode |
| **tools** | Toggle Side Panel, Open Side Panel, Settings |
| **system** | Extensions, Chrome Settings, Downloads, History |

**Keyboard navigation:**

- `↑` / `↓` — navigate results
- `Enter` — execute
- `Esc` — close
- `/` — jump to search (from new tab)

Commands are registered centrally in `src/commands/registry.ts` as a scalable architecture. New commands are added by registering a new entry — no UI changes required.

### 4.4 Tab Management

An elegant interface for managing browser tabs, working within Chrome Extension API limitations (does **not** replace Chrome's native tab bar).

**Capabilities:**

- Search open tabs across all windows
- Switch to a tab
- Close a tab (from the list)
- Reopen recently closed tabs
- Group tabs (create/move into groups)
- Move tabs into workspaces (save tabs to a workspace)
- See recently used / most relevant tabs first

> Chrome Extensions cannot fully replace the native tab strip. NOVA builds the most capable tab-management layer possible within those constraints.

### 4.5 Workspaces

A defining feature. Users organize their browsing into named, colored workspaces.

**Default workspaces (first run):**

| Workspace | Description | Icon | Use case |
|-----------|-------------|------|----------|
| **Work** | GitHub, docs, tools | 💼 | Professional projects |
| **University** | Applications, research | 🎓 | Studies |
| **Content** | YouTube Studio, analytics | 📺 | Creator work |
| **Personal** | Reddit, leisure | 🏠 | Free time |

**Workspace data model:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (uuid) | Unique identifier |
| `name` | `string` | Display name |
| `description` | `string?` | Optional description |
| `icon` | `WorkspaceIcon` | Emoji/icon identifier |
| `accent` | `string` | HSL color for accents |
| `savedTabs` | `SavedTab[]` | Persisted tabs |
| `activeTabIds` | `number[]` | Currently open tab IDs |
| `isSystem` | `boolean` | Locked (cannot delete) |
| `createdAt` | `number` | Timestamp |
| `updatedAt` | `number` | Timestamp |

**Workspace features:**

- Create / edit / delete (system workspaces are locked)
- Per-workspace accent color
- Saved tabs with drag-to-reorder
- Active tab tracking
- Instant switching via Command Palette or workspace selector

**Architecture note:** Workspaces are designed to scale into a much more powerful system in future versions (cross-device sync, shared workspaces, templates).

### 4.6 Quick Side Panel

A Chrome Side Panel (`chrome.sidePanel` API) that stays open alongside any page.

**Sections:**

| Section | Purpose |
|---------|---------|
| **Current Workspace** | Live tab list for the active workspace |
| **Quick Links** | User-defined favorite links (editable) |
| **Saved** | Recently saved pages with search |
| **Notes** | Lightweight, plain-text notes per workspace |
| **Actions** | Quick command buttons |

The side panel is compact — a utility panel, not a second dashboard.

### 4.7 Save Page

A quick-save feature for content the user wants to return to.

**When a page is saved, NOVA stores:**

| Field | Type | Source |
|-------|------|--------|
| `url` | `string` | Active tab URL |
| `title` | `string` | Active tab title |
| `favicon` | `string?` | Tab favicon |
| `timestamp` | `number` | `Date.now()` |
| `workspaceId` | `string` | Current workspace |
| `note` | `string?` | Optional user note |

**Save triggers:**

- Command Palette: `Save Current Page`
- Keyboard shortcut: `Ctrl+Shift+S` (if Chrome permits)
- Right-click context menu: "Save page to NOVA"
- New-tab search bar quick action

Saved pages are accessible from the new tab "Saved pages" section, the side panel, and the command palette.

### 4.8 Focus Mode

A simple, effective distraction-reduction mode.

**When activated:**

- New Tab page simplifies to clock + greeting + search only
- Quick links, recent pages, and saved pages sections hide
- An obvious "Exit Focus Mode" button appears at the bottom

**Design constraint:** Focus Mode does **not** modify websites in V1. That is a future feature.

Toggle via:
- Command Palette: `Toggle Focus Mode`
- Top-bar button on the new tab page
- Keyboard shortcut (configurable later)

### 4.9 Visual Design System

#### Themes (5)

| Theme | Description |
|-------|-------------|
| **Light** | Clean white/gray |
| **Dark** | Deep neutral dark (default) |
| **AMOLED** | True/near-black |
| **Midnight** | Dark with subtle cool accent |
| **Minimal** | Almost entirely monochrome |

#### Customization

| Setting | Options |
|---------|---------|
| Accent color | 8 presets (Blue, Indigo, Violet, Rose, Green, Teal, Amber, Red) + custom |
| Density | Compact / Normal / Comfortable |
| Animations | On / Off (respects `prefers-reduced-motion`) |

#### Design tokens

- Neutral, grayscale base
- Single accent color for all interactive elements
- Rounded corners (consistent radius scale)
- Subtle shadows (not layered)
- `hsl()` color space for easy light/dark adaptation
- Subtle `transition-duration: 150ms` for all animations

### 4.10 Keyboard Shortcuts

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl+K` | Open Command Palette | Global |
| `Cmd+K` | Open Command Palette | macOS global |
| `Ctrl+Shift+P` | Search open tabs | Global |
| `Cmd+Shift+P` | Search open tabs | macOS global |
| `Ctrl+Shift+S` | Save current page | Global |
| `Cmd+Shift+S` | Save current page | macOS global |
| `Ctrl+Shift+L` | Toggle side panel | Global |
| `Cmd+Shift+L` | Toggle side panel | macOS global |
| `Esc` | Close overlays / exit focus mode | Universal |
| `↑↓` | Navigate results | Context-sensitive |
| `Enter` | Execute / open | Context-sensitive |

Shortcuts are configurable in future versions. The architecture (`keyboardShortcuts: Record<string, string>` in settings) supports this from V1.

### 4.11 Settings

A clean settings page (`chrome.runtime.openOptionsPage()`) with these sections:

| Section | Settings |
|---------|----------|
| **Appearance** | Theme, accent color, density, animations, reduced motion |
| **New Tab** | Show clock, show greeting, show quick links, show recent pages, show saved pages |
| **Search** | Default search engine (Google/DuckDuckGo/Bing/Brave/Custom), search behavior |
| **Workspaces** | Workspace management (create, edit, delete, reorder) |
| **Keyboard** | Shortcut reference (customization coming) |
| **Data** | Export data, import data, clear local data |

### 4.12 Data Architecture

All data is stored locally via `chrome.storage.local`. No backend. No network calls for user data.

**Storage keys:**

| Key | Data |
|-----|------|
| `settings` | `Settings` object |
| `workspaces` | `Workspace[]` array |
| `saved` | `SavedPage[]` array |
| `history` | `HistoryEntry[]` (tab visit history) |
| `notes` | `Note[]` |
| `meta` | Installation metadata (version, install date) |

**Data model:**

```
Settings
  ├── theme: 'dark' | 'light' | 'amoled' | 'midnight' | 'minimal'
  ├── accent: string (HSL)
  ├── density: 'compact' | 'normal' | 'comfortable'
  ├── animations: boolean
  ├── reducedMotion: boolean
  ├── newTab: { showClock, showGreeting, showQuickLinks, showRecentPages, showSavedPages }
  ├── defaultSearchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'custom'
  ├── searchBehavior: 'search' | 'autocomplete' | 'both'
  ├── defaultWorkspace: string | null
  ├── autoSwitchWorkspaces: boolean
  ├── keyboardShortcuts: Record<string, string>
  └── focusMode: { autoDimInactive, hideDistractions }

Workspace
  ├── id: string (uuid)
  ├── name: string
  ├── description?: string
  ├── icon: WorkspaceIcon
  ├── accent: string (HSL)
  ├── savedTabs: SavedTab[]
  ├── activeTabIds: number[]
  ├── isSystem: boolean
  ├── createdAt: number
  └── updatedAt: number

SavedPage
  ├── id: string (uuid)
  ├── url: string
  ├── title: string
  ├── favicon?: string
  ├── workspaceId: string
  ├── note?: string
  ├── createdAt: number
  └── updatedAt: number

Note
  ├── id: string (uuid)
  ├── workspaceId: string
  ├── content: string
  ├── createdAt: number
  └── updatedAt: number
```

**Architecture:** Services pattern (`src/services/`) provides a clean repository layer. In-memory caches (`cachedSettings`, `cachedWorkspaces`) avoid hammering `chrome.storage.local`. Listeners broadcast changes to subscribed UI components.

### 4.13 Extension Surface Architecture

| Surface | Path | Description |
|---------|------|-------------|
| New Tab | `src/newtab/` | Dashboard replacing Chrome's new-tab page |
| Command Palette | `src/components/command-palette/` | Modal command/search interface |
| Side Panel | `src/sidepanel/` | Chrome Side Panel API panel |
| Popup | `src/popup/` | Browser action popup (quick access) |
| Options | `src/options/` | Settings page |
| Background | `src/background/` | MV3 service worker (messaging, shortcuts, context menus) |

---

## 5. Technical Architecture

### Stack

- **Manifest:** V3
- **Language:** TypeScript (strict)
- **UI:** React 18 + React DOM
- **Build:** Vite + custom Rollup config
- **Styling:** Tailwind CSS + custom CSS with HSL design tokens
- **Icons:** SVG-based icon component (`src/components/common/Icon.tsx`)
- **Storage:** `chrome.storage.local` (wrapped in `src/services/storage.ts`)
- **No external dependencies** beyond React/Tailwind tooling

### Project Structure

```
src/
├── background/          # MV3 service worker
├── components/
│   ├── common/          # Favicon, Icon, ThemeToggle, ErrorBoundary
│   ├── clock/           # Clock, Greeting
│   ├── command-palette/ # CommandPalette, CommandList
│   ├── layout/          # Container
│   ├── notes/           # NotesPanel, NoteEditor
│   ├── quicklinks/      # QuickLinkForm, QuickLinkItem
│   ├── recent/          # RecentList, SavedList
│   ├── search/          # SearchBar, SearchResults
│   ├── shortcuts/        # QuickLinks
│   ├── tabs/            # TabList, TabItem
│   ├── workspace/       # QuickActions, WorkspaceSwitcher
│   └── workspaces/      # WorkspaceSelector, WorkspaceForm
├── commands/            # Command registry (palette commands)
├── hooks/               # useSettings, useWorkspaces, useSavedPages, etc.
├── newtab/              # New tab page entry
├── options/             # Settings page entry
├── popup/               # Browser action popup
├── services/            # Storage, settings, workspaces, bookmarks, etc.
├── sidepanel/           # Side panel entry
├── styles/              # base.css, themes.css
├── types/               # All TypeScript types
└── utils/               # uuid, time, url, dom helpers
```

### Key Architectural Decisions

1. **Service worker as message hub** — The background script routes messages between all UI surfaces (new tab, side panel, popup, options). It holds ephemeral state (focus mode, current workspace) in memory since service workers are ephemeral.

2. **Command pattern for actions** — All actions (tab management, navigation, workspace operations) are registered as commands in `src/commands/registry.ts`. This enables the command palette, keyboard shortcuts, and future extensibility with a single source of truth.

3. **Services with caching** — Each domain (settings, workspaces, saved pages) has a service layer with in-memory caching and listener subscriptions. This avoids redundant `chrome.storage.local` reads.

4. **No backend** — V1 is 100% local. Data export/import is designed for potential future sync.

5. **Background script inlining** — The Vite build inlines all ES module imports into a single self-contained `background.js` file to avoid Chrome MV3 service worker module loading issues.

---

## 6. User Flow (Daily)

1. **Install** → First-run setup creates default workspaces and settings
2. **New Tab** → Beautiful dashboard with clock, greeting, search
3. **Type** → Universal search detects URL vs. search intent
4. **Ctrl+K** → Command palette opens with categorized commands
5. **Arrow + Enter** → Execute any command without touching the mouse
6. **Save page** → `Ctrl+Shift+S` saves current page to workspace
7. **Switch workspace** → Command palette or workspace selector for instant switching
8. **Side panel** → `Ctrl+Shift+L` opens compact utility panel
9. **Focus mode** → Hide distractions, focus on search
10. **Settings** → Customize theme, accent, density, new-tab sections

---

## 7. Development Workflow

### Prerequisites

- Node.js 18+
- Google Chrome / Chromium

### Setup

```bash
npm install
npm run dev        # Start Vite dev server (for new tab page on localhost)
```

### Build

```bash
npm run build      # Produces dist/ with manifest.json and all surfaces
```

### Load into Chrome (development)

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory
6. The extension loads with: new-tab override, side panel, popup, options page, and background service worker

### Lint & Type Check

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript strict check
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production extension |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Remove dist directory |

---

## 8. Chrome Extension Constraints & Workarounds

This section documents what Chrome Extensions **cannot** do and NOVA's approach.

| What Chrome forbids | NOVA's approach |
|---------------------|-----------------|
| Redesign the address bar | NOVA's new-tab search serves as the primary navigation entry point |
| Replace the native tab bar | Tab management is done via Command Palette + Side Panel |
| Modify websites from a service worker | (V1 does not modify websites; Focus Mode only simplifies NOVA's own UI) |
| Persist service worker state reliably | Ephemeral state (focus mode) is cached in memory + persisted to storage |
| MV3 service workers can't use ES modules cleanly | Build step inlines all imports into a single `background.js` |
| No cross-device sync without a backend | V1 is local-only; export/import is designed for future migration |

---

## 9. Roadmap

### V1 (Current — In Development)

Core features being built:

- [x] Project scaffold (Vite + React + TypeScript + Tailwind)
- [x] Manifest V3 configuration
- [x] Settings service & data model
- [x] Workspaces service & data model
- [x] Command registry
- [ ] New Tab page (dashboard)
- [ ] Command Palette
- [ ] Side Panel
- [ ] Save Page feature
- [ ] Notes
- [ ] Settings page
- [ ] Focus Mode
- [ ] Themes (5 themes)
- [ ] Keyboard shortcuts
- [ ] Context menus
- [ ] Export/Import data
- [ ] Error handling
- [ ] Empty states
- [ ] Accessibility (ARIA, focus states, reduced motion)
- [ ] Build verification

### V2 (Planned)

- AI-free features:
  - Bookmark search in command palette
  - History search (with `history` permission)
  - Tab grouping management
  - Workspace templates (save/share workspace configurations)
  - Cross-window tab management
  - Custom search engines configuration UI

### V3+ (Future — AI Features)

> NO AI is added in V1. These are for future consideration only.

- AI-powered tab organization
- AI page summarization
- Semantic search (search by meaning, not just title)
- AI-generated workspace names
- Research assistant
- Webpage cleanup / readability mode

---

## 10. Success Metrics

A V1 is successful when:

- ✅ Extension builds without errors
- ✅ Manifest V3 is valid
- ✅ Extension loads as an unpacked Chrome Extension
- ✅ New Tab page works and is beautiful
- ✅ Command Palette opens, searches, and executes commands
- ✅ Workspaces create/edit/delete and persist
- ✅ Side Panel opens and shows current workspace tabs
- ✅ Saving pages works and persists
- ✅ Settings persist across sessions
- ✅ Themes persist across sessions
- ✅ Keyboard navigation works (Ctrl+K, arrow keys, Enter, Esc)
- ✅ Local storage works (no data loss on reload)
- ✅ Errors are handled gracefully (no crashes)
- ✅ No obvious console errors
- ✅ TypeScript passes (`npm run typecheck`)
- ✅ Production build succeeds (`npm run build`)

---

## 11. Brand

| Attribute | Value |
|-----------|-------|
| **Name** | NOVA |
| **Tagline** | Your browser, finally organized. |
| **Logo** | Simple icon (star/sparkle motif), works at 16px |
| **Color palette** | Neutral grayscale base + single accent color |
| **Tone of voice** | Calm, confident, technical, understated |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **New Tab** | The dashboard that replaces Chrome's new-tab page |
| **Command Palette** | Modal overlay for searching and running commands |
| **Workspace** | A named, colored collection of saved tabs and context |
| **Side Panel** | The compact Chrome Side Panel utility |
| **Save Page** | Bookmarking a page into a workspace with optional notes |
| **Focus Mode** | Distraction-reduction mode that simplifies the new tab page |
| **Quick Links** | User-defined favorite websites shown on the new tab page |
| **Saved Pages** | Pages saved via the Save Page feature |
