// Data model (see PRD §5) + helpers.
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];
export const ANCHOR_DEFS = [
  { id: 'git', label: 'Git Repository' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'demo', label: 'Demo' },
  { id: 'report', label: 'Report' },
  { id: 'documentation', label: 'Documentation' },
];
export const CONTEXT_TEMPLATE = `## Background\n\n## Constraints\n\n## Tried so far\n\n## Pick up here\n`;
export const DUE_BG = { safe: 'bg-due-safe', warning: 'bg-due-warning', overdue: 'bg-due-overdue', neutral: 'bg-due-neutral' };
export const EMAIL_RE = /^\S+@\S+\.\S+$/;

const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d); };
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(y, m - 1, d) - today) / 864e5);
}

// Due-date states (M8). Done always wins. Anything due within 2 days warns.
export function dueInfo(task) {
  if (task.status === 'done') return { state: 'neutral', label: 'Done', icon: 'check' };
  if (!task.dueDate) return null;
  const n = daysUntil(task.dueDate);
  if (n < 0) return { state: 'overdue', label: `Overdue ${-n}d`, icon: 'alert' };
  if (n === 0) return { state: 'warning', label: 'Due today', icon: 'clock' };
  if (n <= 2) return { state: 'warning', label: n === 1 ? 'Due tomorrow' : `Due in ${n}d`, icon: 'clock' };
  return { state: 'safe', label: `Due in ${n}d`, icon: 'calendar' };
}

export function timeAgo(iso) {
  if (!iso) return null;
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

// Persona success metric: software cycle time (created -> done), in days.
export function avgCycleDays(tasks) {
  const done = tasks.filter((t) => t.status === 'done' && t.completedAt);
  if (!done.length) return null;
  const total = done.reduce((sum, t) => {
    const [y, m, d] = t.createdDate.split('-').map(Number);
    return sum + Math.max(0, (new Date(t.completedAt) - new Date(y, m - 1, d)) / 864e5);
  }, 0);
  return (total / done.length).toFixed(1);
}

// Stamp / clear completedAt whenever the status changes.
export const stamp = (prevStatus, t) =>
  t.status === 'done'
    ? { ...t, completedAt: prevStatus === 'done' ? t.completedAt ?? null : new Date().toISOString() }
    : { ...t, completedAt: null };

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

// M10: paste-ready briefing for any AI chat.
export function buildContextMarkdown(t, assigneeName) {
  const stage = STAGES.find((s) => s.id === t.status)?.label ?? t.status;
  const ctx = t.context?.trim();
  return [
    `# ${t.title || 'Untitled task'}`,
    `**Type:** ${t.type} · **Status:** ${stage} · **Assignee:** ${assigneeName || 'Unassigned'}${t.dueDate ? ` · **Due:** ${t.dueDate}` : ''}`,
    '',
    '## Description',
    t.description?.trim() || '_No description._',
    '',
    '## Context',
    ctx || '_No context yet._',
    '',
    t.contextTool ? `_Last worked on with: ${t.contextTool}_\n` : '',
    '---',
    'Read the briefing above and help me continue from where it says to pick up.',
  ].join('\n');
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select();
  const ok = document.execCommand('copy'); ta.remove(); return ok;
}

// Unique "Join Team" code, e.g. K7M2QX (no look-alike characters).
export function makeJoinCode(teams) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (teams.some((t) => t.joinCode === code));
  return code;
}

// Turn "a@x.com, b@y.com" into invitations for a team. Returns { error } or { invites }.
export function makeInvites(raw, team, users, invitations, invitedBy) {
  const emails = [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const bad = emails.filter((e) => !EMAIL_RE.test(e));
  if (bad.length) return { error: `Not a valid email: ${bad.join(', ')}` };
  const memberEmails = team.memberIds.map((id) => users.find((u) => u.id === id)?.email);
  const pending = invitations.filter((i) => i.teamId === team.id).map((i) => i.email);
  const fresh = emails.filter((e) => !memberEmails.includes(e) && !pending.includes(e));
  return { invites: fresh.map((email) => ({ id: newId(), teamId: team.id, email, invitedBy })), skipped: emails.length - fresh.length };
}

// Resize an uploaded image to a small square data URL so it fits in localStorage.
export function fileToAvatar(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = 128, c = document.createElement('canvas');
      c.width = c.height = s;
      const m = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Not an image'));
    img.src = url;
  });
}

// Demo data so the dashboard is not empty on first load.
export function seedData() {
  const users = [
    { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', picture: null },
    { id: 'u2', name: 'Sam Patel', email: 'sam@example.com', picture: null },
    { id: 'u3', name: 'Jordan Lee', email: 'jordan@example.com', picture: null },
  ];
  const teams = [
    { id: 'team1', name: 'Hackathon Squad', creatorId: 'u1', memberIds: ['u1', 'u2', 'u3'], joinCode: 'VIBE24', anchors: {} },
    { id: 'team2', name: 'Persona Research', creatorId: 'u2', memberIds: ['u2'], joinCode: 'RSRCH7', anchors: {} },
  ];
  const invitations = [{ id: 'i1', teamId: 'team2', email: 'alex@example.com', invitedBy: 'u2' }];
  const base = { teamId: 'team1', createdDate: addDays(-3), context: CONTEXT_TEMPLATE, contextTool: null, contextUpdatedAt: null, completedAt: null };
  const tasks = [
    { ...base, id: 't1', title: 'Build the Kanban board', description: 'Four columns rendered from STAGES.', type: 'feature', status: 'done', assignee: 'u1', dueDate: addDays(-1),
      completedAt: new Date(Date.now() - 2 * 3600e3).toISOString(),
      context: '## Background\nBoard scaffolded from one prompt.\n\n## Pick up here\nDrag and drop polish.', contextTool: 'Claude', contextUpdatedAt: new Date(Date.now() - 2 * 3600e3).toISOString() },
    { ...base, id: 't2', title: 'Fix modal closing on backdrop drag', description: 'Modal closes when a text selection ends outside it.', type: 'bug', status: 'in-progress', assignee: 'u2', dueDate: addDays(-1) },
    { ...base, id: 't3', title: 'Copy Context button', description: 'Copy title, description and context as Markdown.', type: 'feature', status: 'review', assignee: 'u3', dueDate: addDays(1) },
    { ...base, id: 't4', title: 'Deliverable anchor links', description: 'Pinned URL cards above the board.', type: 'feature', status: 'todo', assignee: 'u1', dueDate: addDays(5) },
    { ...base, id: 't5', title: 'Interview 3 users about task handoffs', description: 'Capture where context gets lost.', type: 'feature', status: 'todo', assignee: 'u1', dueDate: addDays(2), teamId: 'team2' },
  ];
  return { users, teams, invitations, tasks };
}
