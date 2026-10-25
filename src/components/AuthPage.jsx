import { useState } from 'react';
import { EMAIL_RE } from '../lib.js';
import Icon from './Icon.jsx';

const field = 'w-full rounded-md border border-brand-primary/40 bg-white/70 px-3 py-2 text-sm text-text-primary';
const btn = 'w-full rounded-md bg-gradient-to-r from-brand-primary to-[#52516a] px-4 py-2 font-medium text-white';
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

export default function AuthPage({ users, onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // login | signup | verify
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [entered, setEntered] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) return setError('Enter a valid email address.');
    const existing = users.find((u) => u.email === em);
    if (mode === 'login') return existing ? onLogin(existing) : setError("We couldn't find that email. Sign up first?");
    if (!name.trim()) return setError('Enter your name.');
    if (existing) return setError('This email is already signed up and in use. Log in instead.');
    setSentCode(newCode()); setEntered(''); setError(''); setMode('verify');
  }

  function verify(e) {
    e.preventDefault();
    if (entered.trim() !== sentCode) return setError("That code doesn't match. Check it and try again.");
    onSignup({ name: name.trim(), email: email.trim().toLowerCase(), verified: true });
  }

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 font-heading text-2xl font-semibold text-brand-primary">
          <Icon name="monitor" size={26} /> VibeCode
        </div>
        <div className="rounded-md border border-brand-primary/20 bg-surface-card/40 p-6">
          {mode === 'verify' ? (
            <>
              <h1 className="mb-2 font-heading text-base font-semibold uppercase">Verify your email</h1>
              <p className="mb-3 text-xs text-text-muted">Enter the 6-digit code for {email.trim().toLowerCase()}.</p>
              <p className="mb-4 rounded-md bg-due-warning px-3 py-2 text-xs">
                Demo mode: no email is sent. Your code is <strong className="font-mono text-sm">{sentCode}</strong>
              </p>
              <form onSubmit={verify} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="code" className="mb-1 block text-xs text-text-muted">Verification code</label>
                  <input id="code" inputMode="numeric" maxLength={6} autoFocus className={`${field} font-mono tracking-widest`}
                    value={entered} onChange={(e) => setEntered(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" />
                </div>
                {error && <p role="alert" className="rounded-md bg-due-overdue px-3 py-2 text-xs text-text-primary">{error}</p>}
                <button type="submit" className={btn}>Verify and create account</button>
              </form>
              <div className="mt-4 flex justify-between text-xs text-text-muted">
                <button type="button" className="underline" onClick={() => { setSentCode(newCode()); setEntered(''); setError(''); }}>Send a new code</button>
                <button type="button" className="underline" onClick={() => switchMode('signup')}>Change email</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-4 font-heading text-base font-semibold uppercase">{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
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
                <button type="submit" className={btn}>{mode === 'login' ? 'Log in' : 'Continue'}</button>
              </form>
              <button type="button" className="mt-4 text-xs text-text-muted underline" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'New here? Sign up' : 'Already have an account? Log in'}
              </button>
            </>
          )}
        </div>
        {mode === 'login' && <p className="mt-4 text-center text-xs text-text-muted">Demo: log in with alex@example.com</p>}
      </div>
    </main>
  );
}
