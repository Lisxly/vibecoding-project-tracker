import { useState } from 'react';
import { STAGES } from '../lib.js';
import TaskCard from './TaskCard.jsx';

export default function Board({ tasks, members, flashId, onOpen, onMove, onCopy, onHandoff }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  function start(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => setDragId(id), 0); // let the browser snapshot the card first
  }
  const end = () => { setDragId(null); setOverCol(null); };

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[960px] grid-cols-4 gap-4">
        {STAGES.map((s) => {
          const items = tasks.filter((t) => t.status === s.id);
          return (
            <section key={s.id} aria-label={s.label}
              onDragOver={(e) => { e.preventDefault(); setOverCol(s.id); }}
              onDragLeave={() => setOverCol((c) => (c === s.id ? null : c))}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) onMove(id, s.id); end(); }}
              className={`min-h-[240px] rounded-md p-3 transition ${overCol === s.id ? 'bg-brand-accent/60' : 'bg-brand-accent/25'}`}>
              <h2 className="mb-3 flex items-center justify-between font-heading text-base font-semibold uppercase">
                {s.label}
                <span className="rounded-full bg-white/70 px-2 py-0.5 font-mono text-xs text-text-muted">{items.length}</span>
              </h2>
              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="rounded-md border-2 border-dashed border-brand-primary/40 p-4 text-center text-xs text-text-muted">
                    Nothing here yet.
                  </p>
                )}
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} members={members} dragging={dragId === t.id} flash={flashId === t.id}
                    onOpen={onOpen} onCopy={onCopy} onHandoff={onHandoff} onDragStart={start} onDragEnd={end} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
