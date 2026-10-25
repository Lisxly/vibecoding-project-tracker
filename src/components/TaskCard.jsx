import { DUE_BG, dueInfo } from '../lib.js';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';

const TYPE = {
  feature: { label: 'Feature', icon: 'feature', bg: 'bg-type-feature', stripe: 'border-l-type-feature' },
  bug: { label: 'Bug', icon: 'bug', bg: 'bg-type-bug', stripe: 'border-l-type-bug' },
};

export default function TaskCard({ task, members, dragging, flash, onOpen, onCopy, onHandoff, onDragStart, onDragEnd }) {
  const type = TYPE[task.type];
  const due = dueInfo(task);
  const owner = members.find((m) => m.id === task.assignee);
  return (
    <article draggable onDragStart={(e) => onDragStart(e, task.id)} onDragEnd={onDragEnd}
      aria-label={`${type.label}: ${task.title}, assigned to ${owner?.name || 'nobody'}`}
      className={`cursor-grab rounded-md border border-brand-primary/20 border-l-[6px] ${type.stripe} bg-surface-card/40 p-3
        transition hover:shadow-md ${dragging ? 'opacity-0' : ''} ${flash ? 'ring-2 ring-brand-primary' : ''}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] ${type.bg}`}>
          <Icon name={type.icon} size={12} /> {type.label}
        </span>
        {due && (
          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${DUE_BG[due.state]}`}>
            <Icon name={due.icon} size={12} /> {due.label}
          </span>
        )}
      </div>
      <button type="button" onClick={() => onOpen(task.id)} className="block w-full text-left text-sm font-medium hover:underline">
        {task.title}
      </button>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-text-muted">{task.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Avatar user={owner} />
        <span className="min-w-0 flex-1 truncate text-xs text-text-muted">{owner?.name || 'Unassigned'}</span>
        <button type="button" onClick={() => onCopy(task)} aria-label={`Copy context for ${task.title}`}
          className="inline-flex items-center gap-1 rounded-md bg-brand-accent px-2 py-1 text-xs hover:bg-brand-accent/70">
          <Icon name="copy" size={12} /> Copy Context
        </button>
      </div>
      <label className="mt-2 block">
        <span className="sr-only">Hand off {task.title} to</span>
        <select value="" onChange={(e) => e.target.value && onHandoff(task.id, e.target.value)}
          className="w-full rounded-md border border-brand-primary/30 bg-white/60 px-2 py-1 text-xs text-text-muted">
          <option value="">Hand off to…</option>
          {members.filter((m) => m.id !== task.assignee).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
    </article>
  );
}
