import { useEffect, useState } from 'react';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';
const h3 = 'mb-2 font-heading text-xs font-semibold uppercase';

export default function ManageTeamModal({ team, members, invites, creatorId, onInvite, onRemove, onRevoke, onNewCode, onCopyCode, onClose }) {
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function invite(e) {
    e.preventDefault();
    const err = onInvite(emails);
    setError(err || '');
    if (!err) setEmails('');
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="manage-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-surface-page p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="manage-title" className="font-heading text-base font-semibold uppercase">Manage team</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-brand-accent"><Icon name="x" size={18} /></button>
        </div>

        <section className="mb-5">
          <h3 className={h3}>Join code</h3>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-brand-accent px-3 py-2 font-mono text-sm">{team.joinCode}</code>
            <button type="button" onClick={onCopyCode} className="inline-flex items-center gap-1 rounded-md bg-brand-accent px-3 py-2 text-xs"><Icon name="copy" size={12} /> Copy</button>
            <button type="button" onClick={onNewCode} className="rounded-md bg-white/70 px-3 py-2 text-xs">Generate new code</button>
          </div>
          <p className="mt-1 text-xs text-text-muted">Anyone with this code can join. A new code stops the old one working.</p>
        </section>

        <section className="mb-5">
          <h3 className={h3}>Invite by email</h3>
          <form onSubmit={invite} className="flex gap-2" noValidate>
            <label htmlFor="invite-emails" className="sr-only">Email addresses</label>
            <input id="invite-emails" className={field} placeholder="name@example.com, …" value={emails} onChange={(e) => setEmails(e.target.value)} />
            <button type="submit" className="rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">Invite</button>
          </form>
          {error && <p role="alert" className="mt-2 rounded-md bg-due-overdue px-3 py-2 text-xs">{error}</p>}
          {invites.length > 0 && (
            <ul className="mt-3 space-y-1">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-xs">
                  <span>{i.email} <span className="text-text-muted">· pending</span></span>
                  <button type="button" onClick={() => onRevoke(i.id)} className="rounded-md px-2 py-1 hover:bg-due-overdue/30">Revoke</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className={h3}>Members</h3>
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id}>
                <div className="flex items-center gap-2">
                  <Avatar user={m} size="h-7 w-7" />
                  <span className="min-w-0 flex-1 truncate text-sm">{m.name}{m.id === creatorId && <span className="ml-2 text-xs text-text-muted">Creator</span>}</span>
                  {m.id !== creatorId && (
                    <button type="button" onClick={() => setConfirmId(m.id)} aria-label={`Remove ${m.name}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-due-overdue/30"><Icon name="trash" size={12} /> Remove</button>
                  )}
                </div>
                {confirmId === m.id && (
                  <div role="alertdialog" className="mt-2 rounded-md bg-due-overdue/40 p-3 text-xs">
                    <p className="mb-2">Remove {m.name} from this team? Their tasks will become unassigned.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { onRemove(m.id); setConfirmId(null); }} className="rounded-md bg-due-overdue px-3 py-1.5">Yes, remove</button>
                      <button type="button" onClick={() => setConfirmId(null)} className="rounded-md bg-white/70 px-3 py-1.5">Keep them</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
