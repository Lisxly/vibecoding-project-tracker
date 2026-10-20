import { useState } from 'react';
import Icon from './Icon.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';

export default function AuthPage({ members, onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) return setError('Enter a valid email address.');
    if (mode === 'login') {
      const m = members.find((x) => x.email === em);
      return m ? onLogin(m) : setError("We couldn't find that email. Sign up first?");
    }
    if (!name.trim()) return setError('Enter your name.');
    if (members.some((x) => x.email === em)) return setError('That email is already registered. Log in instead.');
    onSignup({ name: name.trim(), email: em });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 font-heading text-2xl font-semibold text-brand-primary">
          <Icon name="monitor" size={26} /> VibeCode
        </div>
        <div className="rounded-md border border-brand-primary/20 bg-surface-card/40 p-6">
          <h1 className="mb-4 font-heading text-base font-semibold uppercase">
            {mode === 'login' ? 'Log in to your team' : 'Join your team'}
          </h1>
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1 block text-xs text-text-muted">Name</label>
                <input id="name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-xs text-text-muted">Email</label>
              <input id="email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            {error && <p role="alert" className="rounded-md bg-due-overdue px-3 py-2 text-xs text-text-primary">{error}</p>}
            <button type="submit" className="w-full rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 font-medium text-white">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>
          <button type="button" className="mt-4 text-xs text-text-muted underline"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'New here? Sign up' : 'Already have an account? Log in'}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">Demo: log in with alex@example.com</p>
      </div>
    </main>
  );
}
