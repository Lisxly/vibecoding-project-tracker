import { useEffect, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import { STAGES, newId, seedData } from './lib.js';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Header from './components/Header.jsx';
import Profile from './components/Profile.jsx';
import TeamPage from './components/TeamPage.jsx';

export { STAGES };

const SEED = seedData();

// Tiny hash router: #/ (dashboard), #/profile, #/team/<id>
function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}
const go = (path) => { window.location.hash = `/${path}`; window.scrollTo(0, 0); };

export default function App() {
  const [users, setUsers] = useLocalStorage('vt2:users', () => SEED.users);
  const [sessionId, setSessionId] = useLocalStorage('vt2:session', null);
  const [teams, setTeams] = useLocalStorage('vt2:teams', () => SEED.teams);
  const [tasks, setTasks] = useLocalStorage('vt2:tasks', () => SEED.tasks);
  const [invitations, setInvitations] = useLocalStorage('vt2:invitations', () => SEED.invitations);
  const [toast, setToast] = useState(null);
  const [, tick] = useState(0);
  const route = useRoute();

  // Re-render every minute so due-date colors update by themselves (M8).
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(i); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const user = users.find((u) => u.id === sessionId);
  const notify = (msg) => setToast({ msg, key: Date.now() });

  if (!user) {
    return (
      <AuthPage users={users} onLogin={(u) => { setSessionId(u.id); go(''); }}
        onSignup={(p) => { const u = { id: newId(), picture: null, ...p }; setUsers((us) => [...us, u]); setSessionId(u.id); go(''); }} />
    );
  }

  const shared = { user, users, setUsers, teams, setTeams, tasks, setTasks, invitations, setInvitations, notify, go };
  let page;
  if (route[0] === 'profile') {
    page = <Profile {...shared} />;
  } else if (route[0] === 'team') {
    const team = teams.find((t) => t.id === route[1]);
    page = team && team.memberIds.includes(user.id)
      ? <TeamPage key={team.id} team={team} {...shared} />
      : (
        <main className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="mb-4 text-sm">You don't have access to that team, or it no longer exists.</p>
          <button type="button" onClick={() => go('')} className="rounded-md bg-brand-accent px-4 py-2 text-sm">Back to dashboard</button>
        </main>
      );
  } else {
    page = <Dashboard {...shared} />;
  }

  return (
    <div className="min-h-screen">
      <Header user={user} go={go} onLogout={() => { setSessionId(null); go(''); }} />
      {page}
      {toast && (
        <div key={toast.key} role="status" aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade rounded-md bg-brand-primary px-4 py-2 text-sm text-[#f5f5fc] shadow-lg">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
