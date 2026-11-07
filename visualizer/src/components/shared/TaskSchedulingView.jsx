import IndexedSequence from './IndexedSequence';
import IntervalView from './IntervalView';
import './TaskSchedulingView.css';

// A domain view composed from shared sequence and interval primitives.
// Eligibility and ordering are supplied by the problem, never inferred here.
export default function TaskSchedulingView({ time, event, tasks, servers, eligible, assignments, nextTask, selected, jumpTo, output }) {
  const waiting = tasks.filter(t => t.id >= nextTask && t.arrival <= time);
  const future = tasks.filter(t => t.id >= nextTask && t.arrival > time);
  return <section className="task-scheduling" aria-label="Task scheduling">
    <h2>Clock: {time} · {event}</h2>
    {jumpTo !== null && <p className="task-scheduling__wait">All servers busy: clock {time} → {jumpTo}. Waiting tasks keep their order.</p>}
    <h3>Waiting queue · first task goes next</h3>
    <div className="task-scheduling__queue">{waiting.length ? waiting.map((t,i) => <span key={t.id} className={i === 0 ? 'is-selected' : ''}>T{t.id} · duration {t.duration}{i===0 ? ' · HEAD' : ''}</span>) : <p>No waiting tasks.</p>}</div>
    <details><summary>Future arrivals ({future.length})</summary>{future.map(t=><p key={t.id}>T{t.id}: arrives {t.arrival}, duration {t.duration}</p>)}</details>
    <h3>Servers · weight is priority, not processing speed</h3>
    <div className="task-scheduling__servers">{servers.map(s => <article key={s.id} className={s.id===selected ? 'is-selected' : ''}>
      <strong>S{s.id} · weight {s.weight}</strong>
      <p>{s.freeAt<=time ? 'Idle / eligible' : `Busy until ${s.freeAt}`}</p>
      {s.id===selected && <b>{event==='Choose' ? 'Chosen for queue head' : 'Just assigned'}</b>}
    </article>)}</div>
    <p>Eligible order (weight, then index): {eligible.length ? eligible.map(i=>`S${i}`).join(' → ') : 'none'}</p>
    {assignments.length > 0 && <IntervalView title="Execution timeline by server" marker={time} markerLabel={`clock ${time}`} note="Bars are [start, finish): a server is free exactly at finish. The clock stops once all tasks are assigned; running tasks may finish later."
      intervals={assignments.map(a=>({start:a.start,end:a.end,label:`T${a.task} [${a.start}, ${a.end})`,group:`S${a.server}`,role:a.end<=time ? 'kept' : 'active'}))} />}
    <IndexedSequence label="Answer: task index → assigned server index" length={output.length} valueAt={i=>`S${output[i]}`} active={output.length-1} />
  </section>;
}
