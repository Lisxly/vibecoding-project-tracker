import { useEffect, useRef, useState } from 'react';
import { AI_TOOLS, STAGES, buildContextMarkdown, timeAgo } from '../lib.js';
import Icon from './Icon.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';
const label = 'mb-1 block text-xs text-text-muted';

export default function TaskModal({ task, isNew, members, onSave, onDelete, onCopy, onClose }) {
  const [d, setD] = useState(task);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef(null);
  const set = (k) => (e) => setD((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(e) {
    e.preventDefault();
    if (!d.title.trim()) return setError('Give the task a title.');
    const changed = d.context !== task.context || d.contextTool !== task.contextTool;
    onSave({
      ...d,
      title: d.title.trim(),
      dueDate: d.dueDate || null,
      contextTool: d.contextTool || null,
      contextUpdatedAt: changed ? new Date().toISOString() : task.contextUpdatedAt,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-surface-page p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-heading text-base font-semibold uppercase">{isNew ? 'New task' : 'Edit task'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-brand-accent"><Icon name="x" size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="f-title" className={label}>Title</label>
            <input id="f-title" ref={titleRef} className={field} value={d.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-type" className={label}>Type</label>
              <select id="f-type" className={field} value={d.type} onChange={set('type')}>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>
            <div>
              <label htmlFor="f-status" className={label}>Status</label>
              <select id="f-status" className={field} value={d.status} onChange={set('status')}>
                {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-assignee" className={label}>Assignee</label>
              <select id="f-assignee" className={field} value={d.assignee} onChange={set('assignee')}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-due" className={label}>Due date</label>
              <input id="f-due" type="date" className={field} value={d.dueDate || ''} onChange={set('dueDate')} />
            </div>
          </div>
          <div>
            <label htmlFor="f-desc" className={label}>Description</label>
            <textarea id="f-desc" rows={2} className={field} value={d.description} onChange={set('description')} />
          </div>

          <fieldset className="rounded-md border border-brand-primary/30 p-3">
            <legend className="px-1 font-heading text-xs font-semibold uppercase">Context</legend>
            <div className="mb-2 grid grid-cols-2 items-end gap-3">
              <div>
                <label htmlFor="f-tool" className={label}>AI tool</label>
                <select id="f-tool" className={field} value={d.contextTool || ''} onChange={set('contextTool')}>
                  <option value="">None</option>
                  {AI_TOOLS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <p className="pb-2 text-right text-xs text-text-muted">
                {task.contextUpdatedAt ? `Last updated ${timeAgo(task.contextUpdatedAt)}` : 'Not updated yet'}
              </p>
            </div>
            <label htmlFor="f-context" className="sr-only">Context (Markdown)</label>
            <textarea id="f-context" rows={7} className={`${field} font-mono text-xs`} value={d.context} onChange={set('context')} />
            <button type="button" onClick={() => onCopy(buildContextMarkdown(d, members.find((m) => m.id === d.assignee)?.name), true)}
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-accent px-3 py-1.5 text-xs hover:bg-brand-accent/70">
              <Icon name="copy" size={12} /> Copy Context
            </button>
          </fieldset>

          {error && <p role="alert" className="rounded-md bg-due-overdue px-3 py-2 text-xs">{error}</p>}
          {confirming && (
            <div role="alertdialog" className="rounded-md bg-due-overdue/40 p-3 text-xs">
              <p className="mb-2">Are you sure you want to delete this task? This can't be undone.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onDelete(d.id)} className="rounded-md bg-due-overdue px-3 py-1.5">Yes, delete</button>
                <button type="button" onClick={() => setConfirming(false)} className="rounded-md bg-white/70 px-3 py-1.5">Keep it</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            {!isNew ? (
              <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs text-text-muted hover:bg-due-overdue/30">
                <Icon name="trash" size={14} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm hover:bg-brand-accent">Cancel</button>
              <button type="submit" className="rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
