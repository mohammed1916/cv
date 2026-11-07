import IndexedSequence from './IndexedSequence';
import IntervalView from './IntervalView';
import './SingleCpuScheduleView.css';

// One CPU, shortest-ready-first, non-preemptive. Ordering and selection are supplied by the problem;
// this view only lays out the explicit state it receives.
export default function SingleCpuScheduleView({ time, event, all, future, ready, busy, output, selected, from, jumpTo, arrived = [], rejected = [], running = null, eventLabel }) {
  const readyIds = new Set(ready.map(t => t.id));
  const futureIds = new Set(future.map(t => t.id));
  const doneIds = new Set(output);
  const roleAt = index => {
    const id = all[index].id;
    if (id === selected) return 'selected';
    if (doneIds.has(id)) return 'done';
    if (readyIds.has(id)) return 'ready';
    if (futureIds.has(id)) return 'future';
    return '';
  };
  const intervals = busy.map(b => ({ start: b.start, end: b.end, label: `T${b.task} [${b.start}, ${b.end})`, group: 'CPU', role: running && running.task === b.task && running.start === b.start ? 'active' : 'kept' }));
  return <section className="cpu-schedule" aria-label="Single CPU schedule">
    <h2>Clock {time} · {eventLabel ?? event}</h2>
    {event === 'Idle' && <p className="cpu-schedule__idle">CPU idle from {from} to {jumpTo}: no task has arrived, so the clock jumps to the next arrival instead of stepping through empty time.</p>}
    {arrived.length > 0 && <p className="cpu-schedule__arrivals">Arrived at clock {time}: {arrived.map(id => `T${id}`).join(', ')}</p>}
    <h3>Ready set · shortest duration first, then smaller index</h3>
    <div className="cpu-schedule__ready">{ready.length ? ready.map((t, i) => <span key={t.id} className={i === 0 && event === 'Choose' ? 'is-selected' : ''}>
      T{t.id} · duration {t.duration}{i === 0 && event === 'Choose' ? ' · chosen' : ''}{rejected.includes(t.id) ? ' · waits' : ''}
    </span>) : <p>No ready task. The CPU waits for the next arrival.</p>}</div>
    <details><summary>Future arrivals ({future.length})</summary>{future.map(t => <p key={t.id}>T{t.id}: arrives {t.arrival}, duration {t.duration}</p>)}</details>
    <IndexedSequence label="Tasks by original index: arrival / duration" length={all.length} valueAt={i => `${all[i].arrival}/${all[i].duration}`} active={selected === null ? -1 : selected} roleAt={roleAt} />
    {busy.length > 0 && <IntervalView title="CPU busy intervals" marker={time} markerLabel={`clock ${time}`} note="Each bar is [start, finish). A task runs to completion, so the CPU is free exactly at its finish time. Gaps between bars are idle time."
      intervals={intervals} />}
    <IndexedSequence label="Answer so far: processing order" length={output.length} valueAt={i => `T${output[i]}`} active={output.length - 1} />
  </section>;
}
