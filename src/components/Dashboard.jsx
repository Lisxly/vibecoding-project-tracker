import { useState } from 'react';
import { DUE_BG, dueInfo, makeInvites, makeJoinCode, newId } from '../lib.js';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';
const card = 'rounded-md border border-brand-primary/20 bg-surface-card/40 p-4';
const h2 = 'mb-3 font-heading text-base font-semibold uppercase';

export default function Dashboard({ user, users, teams, setTeams, tasks, invitations, setInvitations, go, notify }) {
  const [name, setName] = useState('');
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');

  const myTeams = teams.filter((t) => t.memberIds.includes(user.id));
  const myInvites = invitations.filter((i) => i.email === user.email);
  const due = tasks
    .filter((t) => t.assignee === user.id && t.status !== 'done' && t.dueDate && myTeams.some((tm) => tm.id === t.teamId))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  function create(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Give your team a name.');
    const team = { id: newId(), name: name.trim(), creatorId: user.id, memberIds: [user.id], joinCode: makeJoinCode(teams), anchors: {} };
    const res = makeInvites(emails, team, users, invitations, user.id);
    if (res.error) return setError(res.error);
    setTeams((ts) => [...ts, team]);
    setInvitations((is) => [...is, ...res.invites]);
    setName(''); setEmails(''); setError('');
    notify(res.invites.length ? `Team created. ${res.invites.length} invitation(s) sent.` : 'Team created.');
    go(`team/${team.id}`);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Hi, {user.name.split(' ')[0]}</h1>

      {myInvites.length > 0 && (
        <p className="mb-6 flex items-center justify-between rounded-md bg-due-warning px-4 py-3 text-sm">
          <span>You have {myInvites.length} team invitation{myInvites.length > 1 ? 's' : ''} waiting.</span>
          <button type="button" onClick={() => go('profile')} className="rounded-md bg-white/70 px-3 py-1 text-xs">Review</button>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="my-teams" className="lg:col-span-2">
          <h2 id="my-teams" className={h2}>My teams</h2>
          {myTeams.length === 0 && (
            <p className="rounded-md border-2 border-dashed border-brand-primary/40 p-6 text-center text-xs text-text-muted">
              Nothing here yet. Create a team or join one with a code in My Profile.
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {myTeams.map((t) => {
              const open = tasks.filter((x) => x.teamId === t.id && x.status !== 'done').length;
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => go(`team/${t.id}`)} className={`${card} w-full text-left transition hover:shadow-md`}>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {t.memberIds.length} member{t.memberIds.length > 1 ? 's' : ''} · {open} open task{open === 1 ? '' : 's'}
                    </span>
                    <span className="mt-2 inline-block rounded bg-brand-accent px-1.5 py-0.5 font-mono text-[11px]">
                      {t.creatorId === user.id ? 'Creator' : 'Member'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <h2 className={`${h2} mt-8`}>Due next</h2>
          {due.length === 0 ? (
            <p className="text-xs text-text-muted">Nothing here yet.</p>
          ) : (
            <ul className="space-y-2">
              {due.map((t) => {
                const info = dueInfo(t);
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => go(`team/${t.teamId}`)}
                      className={`${card} flex w-full items-center justify-between gap-3 py-3 text-left`}>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{t.title}</span>
                        <span className="text-xs text-text-muted">{teams.find((x) => x.id === t.teamId)?.name}</span>
                      </span>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs ${DUE_BG[info.state]}`}>
                        <Icon name={info.icon} size={12} /> {info.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="create-team" className={card}>
            <h2 id="create-team" className={h2}>Create a team</h2>
            <form onSubmit={create} className="space-y-3" noValidate>
              <div>
                <label htmlFor="team-name" className="mb-1 block text-xs text-text-muted">Team name</label>
                <input id="team-name" className={field} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="team-emails" className="mb-1 block text-xs text-text-muted">Invite by email (optional, comma separated)</label>
                <textarea id="team-emails" rows={2} className={field} value={emails} onChange={(e) => setEmails(e.target.value)} />
              </div>
              {error && <p role="alert" className="rounded-md bg-due-overdue px-3 py-2 text-xs">{error}</p>}
              <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">
                <Icon name="plus" size={14} /> Create team
              </button>
            </form>
          </section>

          <section aria-labelledby="my-profile" className={card}>
            <h2 id="my-profile" className={h2}>My Profile</h2>
            <button type="button" onClick={() => go('profile')} className="flex w-full items-center gap-3 text-left">
              <Avatar user={user} size="h-10 w-10" text="text-xs" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-text-muted">{user.email}</span>
              </span>
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
