import { ANCHOR_DEFS } from '../lib.js';
import Icon from './Icon.jsx';

const href = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

export default function AnchorBoard({ anchors, onChange }) {
  return (
    <section aria-label="Project deliverables" className="mb-6">
      <h2 className="mb-3 font-heading text-base font-semibold uppercase">Deliverables</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ANCHOR_DEFS.map((a) => {
          const url = anchors[a.id] || '';
          return (
            <div key={a.id} className="rounded-md border border-brand-primary/20 bg-surface-card/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={`anchor-${a.id}`} className="text-sm font-medium">{a.label}</label>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full border-2 border-brand-primary ${url ? 'bg-brand-primary' : 'bg-transparent'}`} />
                  {url ? 'Linked' : 'Empty'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input id={`anchor-${a.id}`} type="url" defaultValue={url} placeholder="Paste a link"
                  onBlur={(e) => onChange(a.id, e.target.value.trim())}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className="min-w-0 flex-1 rounded-md border border-brand-primary/30 bg-white/60 px-2 py-1 text-xs" />
                {url && (
                  <a href={href(url)} target="_blank" rel="noreferrer" aria-label={`Open ${a.label} link`}
                    className="rounded-md bg-brand-accent p-1.5"><Icon name="link" size={14} /></a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
