import { useState } from 'react';
import {
  CONTEXT_TEMPLATE, avgCycleDays, buildContextMarkdown, copyText, makeInvites, makeJoinCode, newId, stamp, toISO,
} from '../lib.js';
import AnchorBoard from './AnchorBoard.jsx';
import Avatar from './Avatar.jsx';
import Board from './Board.jsx';
import Icon from './Icon.jsx';
import ManageTeamModal from './ManageTeamModal.jsx';
import TaskModal from './TaskModal.jsx';

export default function TeamPage({ team, user, users, teams, setTeams, tasks, setTasks, invitations, setInvitations, notify }) {
  const [modal, setModal] = useState(null); // { id } | { isNew: true }
  const [manage, setManage] = useState(false);
  const [filter, setFilter] = useState([]); // selected member ids; empty = whole team
  const [flashId, setFlashId] = useState(null);

  const members = team.memberIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const teamTasks = tasks.filter((t) => t.teamId === team.id);
  const visible = filter.length ? teamTasks.filter((t) => filter.includes(t.assignee)) : teamTasks;
  const isCreator = team.creatorId === user.id;
  const cycle = avgCycleDays(teamTasks);
  const nameOf = (id) => members.find((m) => m.id === id)?.name;

  const patchTeam = (patch) => setTeams((ts) => ts.map((t) => (t.id === team.id ? { ...t, ...patch } : t)));
  const toggle = (id) => setFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const copy = async (taskOrText, isMarkdown) => {
    const text = isMarkdown ? taskOrText : buildContextMarkdown(taskOrText, nameOf(taskOrText.assignee));
    notify((await copyText(text)) ? 'Copied.' : "Couldn't copy — check browser permissions.");
  };
  const move = (id, status) =>
    setTasks((ts) => ts.map((t) => (t.id === id && t.status !== status ? stamp(t.status, { ...t, status }) : t)));
  const handoff = (id, userId) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, assignee: userId } : t)));
    setFlashId(id); setTimeout(() => setFlashId(null), 1200);
    notify(`You have assigned this role to ${nameOf(userId)}.`);
  };
  const save = (data) => {
    setTasks((ts) => {
      const prev = ts.find((t) => t.id === data.id);
      const next = stamp(prev?.status, data);
      return prev ? ts.map((t) => (t.id === data.id ? next : t)) : [...ts, next];
    });
    setModal(null);
  };
  const remove = (id) => { setTasks((ts) => ts.filter((t) => t.id !== id)); setModal(null); };

  // Team management (creator only)
  const invite = (raw) => {
    const res = makeInvites(raw, team, users, invitations, user.id);
    if (res.error) return res.error;
    if (!res.invites.length) return res.skipped ? 'Those people are already members or invited.' : 'Enter at least one email.';
    setInvitations((is) => [...is, ...res.invites]);
    notify(`${res.invites.length} invitation${res.invites.length > 1 ? 's' : ''} sent.`);
    return null;
  };
  const removeMember = (id) => {
    patchTeam({ memberIds: team.memberIds.filter((m) => m !== id) });
    setTasks((ts) => ts.map((t) => (t.teamId === team.id && t.assignee === id ? { ...t, assignee: '' } : t)));
    setFilter((f) => f.filter((x) => x !== id));
    notify('Member removed.');
  };

  const modalTask = modal?.isNew
    ? { id: newId(), teamId: team.id, title: '', description: '', type: 'feature', status: 'todo', assignee: user.id, dueDate: null,
        createdDate: toISO(new Date()), context: CONTEXT_TEMPLATE, contextTool: null, contextUpdatedAt: null, completedAt: null }
    : tasks.find((t) => t.id === modal?.id);

  const chip = (active) => `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
    active ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-primary/30 bg-white/60 hover:bg-brand-accent'}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{team.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-text-muted">
            <span>Join code <code className="rounded bg-brand-accent px-1.5 py-0.5 font-mono text-text-primary">{team.joinCode}</code></span>
            {cycle && <span>Avg cycle time {cycle} d</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {isCreator && (
            <button type="button" onClick={() => setManage(true)} className="rounded-md bg-brand-accent px-4 py-2 text-sm hover:bg-brand-accent/70">Manage team</button>
          )}
          <button type="button" onClick={() => setModal({ isNew: true })}
            className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 text-sm font-medium text-white">
            <Icon name="plus" size={16} /> Add Task
          </button>
        </div>
      </div>

      <AnchorBoard anchors={team.anchors || {}} onChange={(id, url) => patchTeam({ anchors: { ...team.anchors, [id]: url } })} />

      <section aria-label="Filter by team member" className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={filter.length === 0} onClick={() => setFilter([])} className={chip(filter.length === 0)}>
          Team <span className="font-mono">{teamTasks.length}</span>
        </button>
        {members.map((m) => {
          const n = teamTasks.filter((t) => t.assignee === m.id && t.status !== 'done').length;
          const on = filter.includes(m.id);
          return (
            <button key={m.id} type="button" aria-pressed={on} onClick={() => toggle(m.id)} className={chip(on)}>
              <Avatar user={m} size="h-5 w-5" text="text-[9px]" /> {m.name}
              <span className="font-mono">{n} active</span>
            </button>
          );
        })}
      </section>

      <Board tasks={visible} members={members} flashId={flashId} onOpen={(id) => setModal({ id })}
        onMove={move} onCopy={copy} onHandoff={handoff} />

      {modal && modalTask && (
        <TaskModal key={modalTask.id} task={modalTask} isNew={!!modal.isNew} members={members}
          onSave={save} onDelete={remove} onCopy={copy} onClose={() => setModal(null)} />
      )}
      {manage && (
        <ManageTeamModal team={team} members={members} creatorId={team.creatorId}
          invites={invitations.filter((i) => i.teamId === team.id)}
          onInvite={invite} onRemove={removeMember}
          onRevoke={(id) => setInvitations((is) => is.filter((i) => i.id !== id))}
          onNewCode={() => { patchTeam({ joinCode: makeJoinCode(teams) }); notify('New code generated.'); }}
          onCopyCode={async () => notify((await copyText(team.joinCode)) ? 'Copied.' : "Couldn't copy.")}
          onClose={() => setManage(false)} />
      )}
    </main>
  );
}
