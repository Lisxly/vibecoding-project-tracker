import { useRef, useState } from 'react';
import { fileToAvatar } from '../lib.js';
import Avatar from './Avatar.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';
const card = 'rounded-md border border-brand-primary/20 bg-surface-card/40 p-4';
const h2 = 'mb-3 font-heading text-base font-semibold uppercase';

export default function Profile({ user, setUsers, teams, setTeams, invitations, setInvitations, go, notify }) {
  const [name, setName] = useState(user.name);
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const fileRef = useRef(null);

  const update = (patch) => setUsers((us) => us.map((u) => (u.id === user.id ? { ...u, ...patch } : u)));
  const created = teams.filter((t) => t.creatorId === user.id);
  const joined = teams.filter((t) => t.memberIds.includes(user.id) && t.creatorId !== user.id);
  const invites = invitations.filter((i) => i.email === user.email);

  async function pickPicture(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { update({ picture: await fileToAvatar(file) }); notify('Picture updated.'); }
    catch { notify('That file is not an image.'); }
    e.target.value = '';
  }
  function saveName(e) {
    e.preventDefault();
    if (!name.trim()) return;
    update({ name: name.trim() }); notify('Saved.');
  }
  function accept(inv) {
    setTeams((ts) => ts.map((t) => (t.id === inv.teamId && !t.memberIds.includes(user.id) ? { ...t, memberIds: [...t.memberIds, user.id] } : t)));
    setInvitations((is) => is.filter((i) => i.id !== inv.id));
    notify(`You joined ${teams.find((t) => t.id === inv.teamId)?.name}.`);
  }
  const decline = (inv) => setInvitations((is) => is.filter((i) => i.id !== inv.id));
  function join(e) {
    e.preventDefault();
    const team = teams.find((t) => t.joinCode === code.trim().toUpperCase());
    if (!team) return setJoinError("That code doesn't match any team.");
    if (team.memberIds.includes(user.id)) return setJoinError("You're already in that team.");
    setTeams((ts) => ts.map((t) => (t.id === team.id ? { ...t, memberIds: [...t.memberIds, user.id] } : t)));
    setInvitations((is) => is.filter((i) => !(i.teamId === team.id && i.email === user.email)));
    setCode(''); setJoinError(''); notify(`You joined ${team.name}.`);
    go(`team/${team.id}`);
  }

  const TeamList = ({ list }) => list.length === 0
    ? <p className="text-xs text-text-muted">Nothing here yet.</p>
    : <ul className="space-y-2">{list.map((t) => (
        <li key={t.id}><button type="button" onClick={() => go(`team/${t.id}`)} className="text-sm underline">{t.name}</button>
          <span className="ml-2 text-xs text-text-muted">{t.memberIds.length} member{t.memberIds.length > 1 ? 's' : ''}</span></li>
      ))}</ul>;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-6">
      <h1 className="font-heading text-2xl font-semibold">My Profile</h1>

      <section aria-label="Details" className={`${card} flex flex-wrap items-center gap-6`}>
        <div className="flex flex-col items-center gap-2">
          <Avatar user={user} size="h-24 w-24" text="text-2xl" />
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPicture} className="sr-only" id="picture" />
          <label htmlFor="picture" className="cursor-pointer rounded-md bg-brand-accent px-3 py-1.5 text-xs hover:bg-brand-accent/70">
            {user.picture ? 'Change picture' : 'Add picture'}
          </label>
          {user.picture && <button type="button" onClick={() => update({ picture: null })} className="text-xs text-text-muted underline">Remove</button>}
        </div>
        <form onSubmit={saveName} className="min-w-[220px] flex-1 space-y-3">
          <div>
            <label htmlFor="p-name" className="mb-1 block text-xs text-text-muted">Name</label>
            <input id="p-name" className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-text-muted">Email</p>
            <p className="text-sm">{user.email}</p>
          </div>
          <button type="submit" className="rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">Save</button>
        </form>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="created" className={card}><h2 id="created" className={h2}>Teams I created</h2><TeamList list={created} /></section>
        <section aria-labelledby="joined" className={card}><h2 id="joined" className={h2}>Teams I'm part of</h2><TeamList list={joined} /></section>
      </div>

      <section aria-labelledby="invites" className={card}>
        <h2 id="invites" className={h2}>My invitations</h2>
        {invites.length === 0 ? <p className="text-xs text-text-muted">Nothing here yet.</p> : (
          <ul className="space-y-2">
            {invites.map((i) => {
              const t = teams.find((x) => x.id === i.teamId);
              return (
                <li key={i.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{t?.name ?? 'A team'}</span>
                  <span className="flex gap-2">
                    <button type="button" onClick={() => accept(i)} className="rounded-md bg-due-safe px-3 py-1 text-xs">Accept</button>
                    <button type="button" onClick={() => decline(i)} className="rounded-md bg-white/70 px-3 py-1 text-xs">Decline</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="join" className={card}>
        <h2 id="join" className={h2}>Join a team</h2>
        <form onSubmit={join} className="flex flex-wrap items-end gap-3" noValidate>
          <div className="min-w-[180px] flex-1">
            <label htmlFor="join-code" className="mb-1 block text-xs text-text-muted">Team code</label>
            <input id="join-code" className={`${field} font-mono uppercase`} value={code} onChange={(e) => setCode(e.target.value)} maxLength={10} />
          </div>
          <button type="submit" className="rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">Join</button>
        </form>
        {joinError && <p role="alert" className="mt-3 rounded-md bg-due-overdue px-3 py-2 text-xs">{joinError}</p>}
      </section>
    </main>
  );
}
