import { initials } from '../lib.js';

export default function Avatar({ user, size = 'h-6 w-6', text = 'text-[10px]' }) {
  if (!user) {
    return <span aria-hidden="true" className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full border border-dashed border-brand-primary font-mono ${text} text-text-muted`}>?</span>;
  }
  if (user.picture) {
    return <img src={user.picture} alt={`Profile picture of ${user.name}`} className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span role="img" aria-label={`Initials of ${user.name}`}
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-accent font-mono ${text} text-text-primary`}>
      {initials(user.name)}
    </span>
  );
}
