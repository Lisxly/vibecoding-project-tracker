import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';

export default function Header({ user, go, onLogout }) {
  return (
    <header className="bg-brand-primary text-[#f5f5fc]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <button type="button" onClick={() => go('')} className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Icon name="monitor" size={24} /> VibeCode
        </button>
        <nav aria-label="Main" className="flex items-center gap-2">
          <button type="button" onClick={() => go('')} className="rounded-md px-3 py-2 text-sm hover:bg-white/15">Dashboard</button>
          <button type="button" onClick={() => go('profile')} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-white/15">
            <Avatar user={user} size="h-7 w-7" /> <span className="hidden sm:inline">{user.name}</span>
          </button>
          <button type="button" onClick={onLogout} aria-label="Log out" className="rounded-md p-2 hover:bg-white/15">
            <Icon name="logout" size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
