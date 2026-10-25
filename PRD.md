# Vibecoding Project Tracker — PRD

**Status:** Hackathon starter PRD · review and fill in the **`<TODO>`** sections before you tag `prd-done`.

---
Data Requirements
- Names of members for the team
- Email for members
- Unique "Join Team" code

Functional Requirements
- There has to be a Kanban Board with different columns that represent what stage of development you are on for a specific task.
- Tasks need to be addable.
- Tasks should be editable and removable.
- Tasks should have a text field for Members to add the Context of a task.
- Tasks should have a form selection to specify the AI Tool that is being used for the Vibe Code task.
- Tasks should have a selection form to assign the task to a specific user.
- There should be a calendar feature for the task so that users can add a deadline for the task.
- There should be an Anchor that gives the user a text field to enter any relevant URLs for "Git Repository", "Presentation", and others.
- There needs to be a simple sign-up page to include Name and Email, which gets stored and can be used to log in.
- A login page is required, from which you can log in to your team to view your team's Kanban board.
- When signing in, the user's email needs to be unique and verified. If the email is not unique, inform the user that the email is already signed up and in use. Verification is a simulated 6-digit code shown on screen (no email is sent in this version).
- When logged in, the user should see a dashboard on the hero page with a section for "My teams", "Create a team", and "My Profile".
- When clicking on "Create a team", the user should be able to create a new Kanban board with all features and be able to add team members using their emails. They should also be able to generate a unique code so anyone can join a team using it.
- The "My profile" page should include a name, email, option to add a picture, an overview of teams created and teams the user is part of, and a section to review invitations to a team ("My invitations") and a section to join a team by entering the given unique code ("Join a team").
- The creator of a team should be able to remove any team members.
- When a user reviews a Kanban board, they should be able to click on any of the visible team members on the list to filter all tasks to that specific team member and click on "team" to remove the filter. They should be able to select multiple team members at once.


Non-Functional Requirements
- The website should be accessible for colour blind users.
- The website should have alt tags for visually impaired users.
- The website should have logins to keep the data secure.

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.

**Stakeholder persona — Meredith Wilson (35), Senior Software Engineer, remote, London.** Juggles several projects plus life outside work, so she easily loses track of tasks; late work delays treatments for patients. She values her time, prefers simplicity over aesthetics, and measures success by software cycle time. Her team wants tasks done on time, a clear overview of everyone's progress, and better context when picking up a teammate's task.

How the persona shapes the product:

| Persona need | Product answer |
|---|---|
| Loses track across many projects | Dashboard "My teams" + "Due next" list of my tasks across all teams |
| Overview of everyone's progress | Per-member active-task counts and multi-select member filter on the board |
| Picking up a teammate's task | Context field + "Copy Context" briefing + handoff dropdown |
| Success = cycle time | Average cycle time (created → done) shown on each team board |
| Values time, simplicity | Few clicks, plain labels, no decorative extras |

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app. After logging in, the user lands on a **dashboard** ("My teams", "Create a team", "My Profile"). Each team has its own board with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states, filterable by one or more team members.
- An **Anchor Board** above it that pins the final-project links (Git Repository, Presentation, Demo, Report, Documentation).

Teams are joined by email invitation or by a unique join code. The creator of a team manages members.

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Sign up (name + email; the email must be unique), confirm the on-screen verification code, and log in. The dashboard loads from local storage.
2. Create a team (and invite members by email), or accept an invitation / enter a join code in My Profile.
3. Open a team. Click "Add Task" to add a task. Fill in title, type, assignee, due date, prompt context.
4. Move the task across columns as you work. Click a member (or several) to filter the board; click "Team" to clear the filter.
5. When stuck, click "Copy Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
6. Hand off a task to a teammate with one dropdown.
7. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
User = {
  id: string,
  name: string,
  email: string,                 // unique, stored lowercase
  verified: boolean,             // true once the on-screen verification code was entered
  picture: string | null,        // small data-URL; alt text is generated from the name
}

// A team with its own board.
Team = {
  id: string,
  name: string,
  creatorId: string,             // User.id; only the creator can remove members
  memberIds: string[],           // User.id values
  joinCode: string,              // unique 6-character "Join Team" code
  anchors: { [anchorId]: string }, // deliverable links for this team
}

// Pending email invitation, shown under "My invitations" for that email.
Invitation = { id: string, teamId: string, email: string, invitedBy: string }

// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  teamId: string,                // Team.id
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // User.id of a member of the task's team ('' = unassigned)
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'
  completedAt: string | null,    // ISO timestamp set when moved to Done (drives cycle time)

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save
}

// One of five pinned deliverable slots.
Anchor = {
  id: 'git' | 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Known limitation:** localStorage lives in one browser, so accounts, teams, invitations and join codes only work between users of the **same browser** in this version (demo by signing up several accounts there). Email addresses are checked for format and uniqueness, and sign-up includes a **simulated** verification step (a 6-digit code displayed on screen, clearly labelled demo mode) — no real email is sent for verification or invitations. Real cross-device teams and email verification need a backend (M14).

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Fill these in before tagging `prd-done`:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | `<TODO>` | `<TODO>` |
| Teammate B | `<TODO>` | `<TODO>` |
| Teammate C | `<TODO>` | `<TODO>` |

Task assignees are chosen from the members of the task's team (see §5). Log in with the email you signed up with — there are no passwords in this version.

## 9. Milestone ownership

Fill in the owner column. Recommended default in **bold**; change if your team has different strengths.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | `<TODO>` |
| 4 | `data-model` | Task model + board view | **A** | `<TODO>` |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | `<TODO>` |
| 6 | `tag-style` | Feature / bug colors | **B** | `<TODO>` |
| 7 | `task-owner` | Owner indicator + handoff | **A** | `<TODO>` |
| 8 | `due-tint` | Due-date color tinting | **B** | `<TODO>` |
| 9 | `context` | Context field on the task modal | **C** | `<TODO>` |
| 10 | `copy-prompt` | "Copy as Prompt Context" button | **C** | `<TODO>` |
| 11 | `anchors` | Deliverable Anchor Board | **B** | `<TODO>` |
| 12 | `secret-sauce` | The one thing that makes it yours | **C / All** | `<TODO>` |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | `<TODO>` |


Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce. Put your strongest prompter on Track C.

**Dependency note.** M3 (`design-done`) runs **in parallel with M2** — Person B drafts DESIGN.md and pastes the colors into `tailwind.config.js` while the rest of the team reviews the PRD. M6 / M7 / M8 / M11 all depend on M4 + M5 being done first. While Person A builds M4+M5 (first ~60 min of Phase 3), Person C should draft the Markdown template for the "Copy as Prompt Context" output (M10). M12 `secret-sauce` is open-ended — pick whatever makes the tracker uniquely yours; constraint is "must be visible in the demo and must not break anything else."

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M3 (DESIGN.md) — design taste is yours, not the model's.
- M12 (secret-sauce) — the whole point is that AI can't predict it.
- M13 (pitch) — write the script in your own voice.

Keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks — those become part of your Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** `<TODO>`
- **Tagline (one sentence):** `<TODO>`
- **Tracker URL after deploy:** `<TODO>` (Vercel will give it to you)

## 12. Out of scope (do not build)

- Passwords, password reset and *real* email verification (needs a backend; the app only simulates it).
- Sending real emails for invitations.
- Real GitHub integration.
- A real backend / shared database.
- Mobile responsive — desktop only is fine.
- Real-time collaboration.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads on Vercel without errors.
- The "Copy as Prompt Context" demo works on stage.
- 5 min pitch is rehearsed.

---

*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez*
