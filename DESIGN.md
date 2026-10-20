# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

`A calm, soft pastel workspace that makes a stressed 11pm task list feel manageable and a little playful.`

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- `https://i.pinimg.com/1200x/a4/d6/89/a4d689ee0f893fde8e738f81f7033513.jpg`
- `https://i.pinimg.com/1200x/af/fb/10/affb10dbe64a4e05d53197e2638873a5.jpg`
- `https://i.pinimg.com/736x/97/e2/cc/97e2cc751d2c0e5a182507fe904f2c56.jpg`

Anti-references — what we are explicitly **not** trying to look like:

- `https://i.pinimg.com/1200x/b6/85/c8/b685c85dbcc202c1ed91f413535537fc.jpg`

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#6f6e80` | Header, "+" button, focus rings |
| `brand-accent` | `#d0d5f7` | Highlights, hover states, links |
| `surface-page` | `#f2f4fc` | Page background |
| `surface-card` | `#fcd9ff` | Card background |
| `text-primary` | `#000000` | Body text |
| `text-muted` | `#4c464d` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#49fcd3` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#fa8cc3` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#b4f084` | More than 2 days out |
| `due-warning` | `#ecf084` | Less than 24 hours |
| `due-overdue` | `#d4555d` | Past due |
| `due-neutral` | `#c9c8d0` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | Space Grotesk (colour `#f5f5fc` on the header) | Geometric and friendly with a techy edge that suits a coding tool. |
| Body | Inter (colour `#000000`) | Highly legible at 14 px on pastel surfaces. |
| Monospace (tags, badges, code) | JetBrains Mono | Clear glyphs for type badges and the Markdown context field. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** `60% transparent, no shadow unless on hover` 
- **Buttons:** `Solid fill, gradient, appropriate padding, rounded-md`
- **Modal:** `Centered, max-width-md, slate-900 backdrop at 50% opacity`
- **Empty states:** `dashed border, muted text`
- **Drag affordance (if used):** `transparent when task is being dragged from one column to the other until dropped into column`

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `Add Task` (e.g. "+ Task" or "Add task" or "New") |
| Empty column placeholder | `Nothing here yet.`  |
| Toast after "Copy as Prompt Context" | `Copied.` |
| Confirm-delete message | `Are you sure you want to delete this task? This can't be undone.` |
| Handoff toast (M7 `task-owner`) | `You have assigned this role to {}.`  |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `VibeCode` 
- **Wordmark style:** `Name in the heading font and colour, computer icon.`

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
