// Locked data model from PRD §5 + helpers.
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];
export const ANCHOR_DEFS = [
  { id: 'presentation', label: 'Presentation' },
  { id: 'demo', label: 'Demo' },
  { id: 'report', label: 'Report' },
  { id: 'documentation', label: 'Documentation' },
];
export const CONTEXT_TEMPLATE = `## Background\n\n## Constraints\n\n## Tried so far\n\n## Pick up here\n`;

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

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

// M10: paste-ready briefing for any AI chat.
export function buildContextMarkdown(t) {
  const stage = STAGES.find((s) => s.id === t.status)?.label ?? t.status;
  const ctx = t.context?.trim();
  return [
    `# ${t.title || 'Untitled task'}`,
    `**Type:** ${t.type} · **Status:** ${stage} · **Assignee:** ${t.assignee || 'Unassigned'}${t.dueDate ? ` · **Due:** ${t.dueDate}` : ''}`,
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

export const SEED_MEMBERS = [
  { id: 'm1', name: 'Alex Rivera', email: 'alex@example.com' },
  { id: 'm2', name: 'Sam Patel', email: 'sam@example.com' },
  { id: 'm3', name: 'Jordan Lee', email: 'jordan@example.com' },
];

export const seedTasks = () => {
  const base = { createdDate: addDays(-3), context: CONTEXT_TEMPLATE, contextTool: null, contextUpdatedAt: null };
  return [
    { ...base, id: 't1', title: 'Build the Kanban board', description: 'Four columns rendered from STAGES.', type: 'feature', status: 'done', assignee: 'Alex Rivera', dueDate: addDays(-1),
      context: '## Background\nBoard scaffolded from one prompt.\n\n## Pick up here\nDrag and drop polish.', contextTool: 'Claude', contextUpdatedAt: new Date(Date.now() - 2 * 3600e3).toISOString() },
    { ...base, id: 't2', title: 'Fix modal closing on backdrop drag', description: 'Modal closes when a text selection ends outside it.', type: 'bug', status: 'in-progress', assignee: 'Sam Patel', dueDate: addDays(-1) },
    { ...base, id: 't3', title: 'Copy Context button', description: 'Copy title, description and context as Markdown.', type: 'feature', status: 'review', assignee: 'Jordan Lee', dueDate: addDays(1) },
    { ...base, id: 't4', title: 'Deliverable anchor links', description: 'Four pinned URL cards above the board.', type: 'feature', status: 'todo', assignee: 'Alex Rivera', dueDate: addDays(5) },
  ];
};
