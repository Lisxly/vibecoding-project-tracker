import { useEffect, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import {
  CONTEXT_TEMPLATE, SEED_MEMBERS, STAGES, buildContextMarkdown, copyText, newId, seedTasks, toISO,
} from './lib.js';
import AuthPage from './components/AuthPage.jsx';
import Board from './components/Board.jsx';
import AnchorBoard from './components/AnchorBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import Icon from './components/Icon.jsx';
import { Avatar } from './components/TaskCard.jsx';

export { STAGES };

export default function App() {
  const [members, setMembers] = useLocalStorage('vt:members', SEED_MEMBERS);
  const [sessionId, setSessionId] = useLocalStorage('vt:session', null);
  const [tasks, setTasks] = useLocalStorage('vt:tasks', seedTasks);
  const [anchors, setAnchors] = useLocalStorage('vt:anchors', {});
  const [modal, setModal] = useState(null); // { id } | { isNew: true }
  const [toast, setToast] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [, tick] = useState(0);

  // Re-render every minute so due-date colors update by themselves (M8).
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(i); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const user = members.find((m) => m.id === sessionId);

  if (!user) {
    return (
      <AuthPage members={members} onLogin={(m) => setSessionId(m.id)}
        onSignup={(p) => { const m = { id: newId(), ...p }; setMembers((ms) => [...ms, m]); setSessionId(m.id); }} />
    );
  }

  const notify = (msg) => setToast({ msg, key: Date.now() });
  const copy = async (task, isMarkdown) => {
    const ok = await copyText(isMarkdown ? task : buildContextMarkdown(task));
    notify(ok ? 'Copied.' : "Couldn't copy — check browser permissions.");
  };
  const move = (id, status) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  const handoff = (id, name) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, assignee: name } : t)));
    setFlashId(id); setTimeout(() => setFlashId(null), 1200);
    notify(`You have assigned this role to ${name}.`);
  };
  const save = (data) => {
    setTasks((ts) => (ts.some((t) => t.id === data.id) ? ts.map((t) => (t.id === data.id ? data : t)) : [...ts, data]));
    setModal(null);
  };
  const remove = (id) => { setTasks((ts) => ts.filter((t) => t.id !== id)); setModal(null); };

  const modalTask = modal?.isNew
    ? { id: newId(), title: '', description: '', type: 'feature', status: 'todo', assignee: user.name, dueDate: null,
        createdDate: toISO(new Date()), context: CONTEXT_TEMPLATE, contextTool: null, contextUpdatedAt: null }
    : tasks.find((t) => t.id === modal?.id);

  return (
    <div className="min-h-screen">
      <header className="bg-brand-primary text-[#f5f5fc]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2 font-heading text-2xl font-semibold"><Icon name="monitor" size={24} /> VibeCode</div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setModal({ isNew: true })}
              className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand-accent to-[#e9c8ff] px-4 py-2 font-medium text-text-primary">
              <Icon name="plus" size={16} /> Add Task
            </button>
            <span className="hidden text-sm sm:inline">{user.name}</span>
            <button type="button" onClick={() => setSessionId(null)} aria-label="Log out" className="rounded-md p-2 hover:bg-white/15">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <AnchorBoard anchors={anchors} onChange={(id, url) => setAnchors((a) => ({ ...a, [id]: url }))} />

        <section aria-label="Team" className="mb-4 flex flex-wrap items-center gap-4">
          <h2 className="font-heading text-base font-semibold uppercase">Team</h2>
          {members.map((m) => {
            const n = tasks.filter((t) => t.assignee === m.name && t.status !== 'done').length;
            return (
              <span key={m.id} className="inline-flex items-center gap-2 text-xs text-text-muted">
                <Avatar name={m.name} /> {m.name} · {n} active
              </span>
            );
          })}
        </section>

        <Board tasks={tasks} members={members} flashId={flashId} onOpen={(id) => setModal({ id })}
          onMove={move} onCopy={copy} onHandoff={handoff} />
      </main>

      {modal && modalTask && (
        <TaskModal key={modalTask.id} task={modalTask} isNew={!!modal.isNew} members={members}
          onSave={save} onDelete={remove} onCopy={copy} onClose={() => setModal(null)} />
      )}
      {toast && (
        <div key={toast.key} role="status" aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade rounded-md bg-brand-primary px-4 py-2 text-sm text-[#f5f5fc] shadow-lg">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
