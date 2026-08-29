# RepoLens — Engineering & UI Source of Truth

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product Purpose

RepoLens is an AI-powered GitHub issue investigation tool. It connects to GitHub, selects a repository and issue, then traces the relevant code, identifies root cause, and generates an actionable patch.

## Application Flow

```
Landing Page
    ↓
GitHub Authentication (/auth/github)
    ↓
Dashboard (/dashboard)
    ↓
New Analysis (/analysis/new)
    ↓
Repository Selection (state in analysis flow)
    ↓
Issue Selection (state in analysis flow)
    ↓
Investigation Workspace (/analysis/[id])
    ↓
Root Cause → Evidence → Solution → Patch
```

### First Iteration Scope (Current)

- Landing Page (/)
- GitHub Authentication (/auth/github)
- Dashboard (/dashboard)
- Investigation Workspace (/analysis/new)

### Future Iterations (Not Yet)

- Analysis history
- Repository details
- Settings
- Separate root-cause/evidence/solution/patch pages
- Billing
- Team management
- Notifications
- Real AI analysis
- Real code patch generation
- Repository mutation/write-back

## UI Architecture

### Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (primitives, customized to design system)
- Inter (headings, UI)
- JetBrains Mono (code, technical metadata)

### File Organization

```
app/
    page.tsx                    # Landing Page
    layout.tsx                  # Root layout
    globals.css                 # Design tokens + Tailwind
    auth/
        github/
            page.tsx            # GitHub Auth Page
    dashboard/
        page.tsx                # Dashboard
    analysis/
        new/
            page.tsx            # New Analysis (repo/issue selection)
        [id]/
            page.tsx            # Investigation Workspace

components/
    layout/                     # App shell components
        AppShell.tsx
        Sidebar.tsx
        TopBar.tsx
    landing/                    # Landing page components
        Hero.tsx
        ProductPreview.tsx
        FeatureSteps.tsx
    auth/                       # Auth page components
        AuthCard.tsx
    dashboard/                  # Dashboard components
        DashboardHeader.tsx
        StatsGrid.tsx
        RecentAnalyses.tsx
    analysis/                   # Investigation workspace components
        AnalysisStepper.tsx
        AnalysisHeader.tsx
        RepositorySelector.tsx
        IssueSelector.tsx
        RelevantFilesPanel.tsx
        RootCausePanel.tsx
        EvidencePanel.tsx
        SolutionPanel.tsx
        PatchViewer.tsx
    code/                       # Code presentation components
        CodeViewer.tsx
        DiffViewer.tsx
    ui/                         # Shared UI primitives (shadcn-based)
        Button.tsx
        Badge.tsx
        Card.tsx
        Input.tsx
        Separator.tsx
        Tooltip.tsx

lib/
    mock/                       # Centralized mock data
        repositories.ts
        issues.ts
        analyses.ts
    utils.ts                    # Utility functions (cn, etc.)

types/
    index.ts                    # Shared TypeScript types
```

### Component Size Limit

Every React component must remain below 350–400 lines. If a component exceeds this, split it into smaller components.

## Design System — Technical Precision System

### Visual Personality

- Corporate / Modern
- Systematic Minimalism
- Technical / Professional
- High information density
- Quiet and focused
- Developer-tool aesthetic

### Avoid

- Generic SaaS dashboard styling
- Excessive gradients
- Excessive glassmorphism
- Giant rounded cards
- Large decorative illustrations
- Cartoon AI graphics
- Chatbot-style UI
- Excessive shadows
- Unnecessary animations
- Oversized typography
- Marketing-heavy layouts inside the application

## Color Tokens

```css
surface: #0b141c
surface-dim: #0b141c
surface-bright: #313a43

surface-container-lowest: #060f16
surface-container-low: #141c24
surface-container: #182028
surface-container-high: #222b33
surface-container-highest: #2d363e

on-surface: #dae3ee
on-surface-variant: #c0c7d4

outline: #8b919d
outline-variant: #414752

primary: #a2c9ff
on-primary: #00315c
primary-container: #58a6ff
on-primary-container: #003a6b

secondary: #c2c7d0
secondary-container: #42474f

tertiary: #ffba42
tertiary-container: #da9600

error: #ffb4ab
error-container: #93000a

background: #0b141c
```

### Tonal Layering

- Main background: `#0b141c`
- Lowest surface: `#060f16`
- Cards / sidebar: `#141c24`
- Elevated surfaces: `#182028`, `#222b33`
- Highest surface: `#2d363e`
- Borders: `#414752`
- Primary interactive: `#a2c9ff`
- Primary filled action: `#58a6ff`

## Typography

- **Inter**: headings, navigation, buttons, labels, descriptions, general UI
- **JetBrains Mono**: file paths, repository names, issue IDs, commit hashes, technical metadata, code, code snippets

### Type Scale

| Name          | Font          | Size | Weight | Line Height | Letter Spacing |
|---------------|---------------|------|--------|-------------|----------------|
| Display       | Inter         | 32px | 600    | 1.2         | -0.02em        |
| Headline      | Inter         | 24px | 600    | 1.3         | -              |
| Title         | Inter         | 16px | 600    | 1.4         | -              |
| Body          | Inter         | 14px | 400    | 1.5         | -              |
| Small         | Inter         | 12px | 400    | 1.5         | -              |
| Code          | JetBrains Mono| 13px | 400    | 1.6         | -              |
| Small Code    | JetBrains Mono| 11px | 400    | 1.6         | -              |
| Tech Label    | Inter         | 11px | 600    | -           | 0.05em (uppercase) |

Default application body text: 14px Inter.

## Spacing (4px base)

| Token | Value |
|-------|-------|
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |

- Small component internal spacing: 8px
- Related content: 12px
- Major sections: 32px
- Avoid arbitrary spacing values unless required by layout.

## Border Radius

| Token | Value |
|-------|-------|
| sm    | 2px   |
| default| 4px  |
| md    | 6px   |
| lg    | 8px   |
| xl    | 12px  |
| full  | pill  |

Most UI elements: 4px–6px rounding. Do NOT make every element heavily rounded.

## Layout

### Desktop

- Sidebar: 240px
- Main content: fluid
- Maximum content width: 1440px

```
┌───────────────┬─────────────────────────────────────┐
│               │                                     │
│   Sidebar     │           Main Workspace            │
│   240px       │           Fluid                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

For analysis screens, a contextual right panel may be used.

### Tablet

- Collapse sidebar to icons
- Context panel becomes a drawer
- Preserve workspace usability

### Mobile

- Single-column layout
- Collapsible navigation
- Context panel becomes a drawer/sheet
- Code viewer supports horizontal scrolling
- Buttons remain accessible
- No clipped content
- No horizontal page overflow

## Component Rules

- Use shared components from `components/ui/`
- Use shadcn/ui primitives where useful (Button, Input, Badge, Card, Dialog, Tabs, Tooltip, Separator)
- Do NOT blindly use shadcn components everywhere
- Final visual appearance must follow the RepoLens design system
- Do not duplicate buttons, badges, cards, status indicators, search inputs, code containers, repository rows, issue rows, navigation, or analysis progress indicators

## Accessibility

- Use semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible button labels
- Sufficient color contrast
- ARIA labels where appropriate
- Dialogs/drawers are keyboard accessible
- Code areas are readable
- Status information is not communicated through color alone

## Animation

### Allowed

- Subtle hover transitions
- Button loading state
- Progress transitions
- Small fade/slide transitions
- Copy success feedback

### Avoid

- Excessive page animations
- Distracting background animations
- Flashy AI animations

The application should feel fast.

## Coding Conventions

- TypeScript with strict typing
- Reusable React components
- Clear props interfaces/types
- Server/client boundaries intentional
- Semantic naming
- Small components (max 350–400 lines)
- No `any` unless unavoidable
- No giant components
- No duplicated markup or styling
- No unnecessary abstraction
- No premature architecture
- No unnecessary dependencies

## Mock Data

Use centralized mock data in `lib/mock/`. Do NOT scatter mock objects throughout components. Mock data should resemble real GitHub repositories and issues. Keep mock data clearly separated from future API/database code.

## State Design

Create UI state models that map to backend analysis stages:

### Analysis Status

- `idle`
- `indexing`
- `analyzing`
- `completed`
- `failed`

### Analysis Stages

- `REPOSITORY`
- `ISSUE`
- `RELEVANT_FILES`
- `ROOT_CAUSE`
- `EVIDENCE`
- `SOLUTION`
- `PATCH`

Keep the analysis UI driven by structured state so it can later consume backend events.

## GitHub OAuth Architecture

The eventual flow:

```
User → Continue with GitHub → GitHub OAuth → Authorization → Callback → Session → Dashboard
```

- GitHub authorization/token handling must remain server-side
- Do NOT expose GitHub OAuth secrets or access tokens in client-side code
- Create correct buttons, routes, loading states, error states, and callback boundaries
- Do NOT pretend OAuth is already working if it is not implemented

## Supabase Direction

The project should be architected so Supabase can be used as the application database/backend infrastructure. Expected future data model:

- users
- repositories
- repository_indexes
- repository_files
- issues
- analyses
- analysis_stages
- evidence
- solutions
- patches

Do NOT implement the full database layer during this first UI iteration. Keep components ready to consume server/database data later.

## Dependencies

- Prefer lightweight dependencies
- Do not introduce large frameworks or unnecessary libraries
- Do not modify unrelated application code
