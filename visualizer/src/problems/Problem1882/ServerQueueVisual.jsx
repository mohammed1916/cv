import { useTutorialScene } from '../../components/shared/TutorialScene';
import HeapView from '../../components/shared/HeapView';
import TaskSchedulingView from '../../components/shared/TaskSchedulingView';
import './ServerQueueVisual.css';

// Full mode keeps the complete scheduling view. Directed mode renders only the structures named by the current scene's focus.
export default function ServerQueueVisual({ step }) {
  const scene = useTutorialScene();
  const s = step.scheduling;
  const done = step.phase === 'done';
  if (!scene) return <TaskSchedulingView {...s} event={done ? 'All tasks assigned' : s.event} selected={done ? null : s.selected} />;
  const focus = new Set(scene.focus || []);
  return <div className="sq-scene" aria-label="Focused server scheduling state">
    {focus.has('clock') && <ClockFocus s={s} />}
    {focus.has('idle') && <Pool s={s} which="idle" />}
    {focus.has('busy') && <Pool s={s} which="busy" />}
    {focus.has('timeline') && <Timeline s={s} />}
    {focus.has('answer') && <Answer s={s} />}
  </div>;
}

function ClockFocus({ s }) {
  const arriving = s.event === 'Arrive' || s.event === 'Ready';
  return <section className="sq-clock" aria-label="Simulation clock">
    <strong>Clock t = {s.time}</strong>
    {arriving && s.nextTask !== undefined && <span>task arrival i = {s.nextTask} · ts = max(t, i)</span>}
    {s.jumpTo !== null && s.jumpTo !== undefined && <span>jump to earliest finish {s.jumpTo}</span>}
  </section>;
}

function Pool({ s, which }) {
  const idle = which === 'idle';
  const heap = s[which];
  const title = idle ? 'Idle servers · min by weight, then index' : 'Busy servers · min by finish time, then index';
  if (heap?.items) return <HeapView items={heap.items} ops={heap.ops} order={heap.order} title={title} />;
  // Large inputs omit heap cells; show the bounded candidate list or the count instead.
  const count = idle ? s.eligibleCount : s.servers.length - s.eligibleCount;
  return <section className="sq-pool" aria-label={title}>
    <h3>{title}</h3>
    {idle && s.eligible.length > 0
      ? <p>Candidates: {s.eligible.map(id => `S${id}`).join(', ')}</p>
      : <p>{count} server(s) in this pool. Too many to draw as a heap.</p>}
  </section>;
}

function Timeline({ s }) {
  if (!s.assignments) return <section className="sq-timeline"><p>Timeline omitted for large inputs.</p></section>;
  const current = s.event === 'Assign' ? s.nextTask - 1 : null;
  const servers = s.event === 'Return' ? [...new Set(s.assignments.map(a => a.server))].sort((a, b) => a - b) : s.selected === null ? [] : [s.selected];
  const span = Math.max(1, ...s.assignments.map(a => a.end));
  return <section className="sq-timeline" aria-label="Execution intervals of the focused servers">
    <h3>Execution intervals</h3>
    {!servers.length && <p>No task has been assigned yet.</p>}
    {servers.map(server => <div className="sq-row" key={server}>
      <span>S{server}</span>
      <div className="sq-track">
        {s.assignments.filter(a => a.server === server).map(a => <i key={a.task}
          className={a.task === current ? 'is-current' : ''}
          style={{ left: `${(a.start / span) * 100}%`, width: `${Math.max(2, ((a.end - a.start) / span) * 100)}%` }}
          title={`T${a.task}: ${a.start} to ${a.end}`}>T{a.task}</i>)}
      </div>
    </div>)}
    <small>Time 0 to {span}</small>
  </section>;
}

function Answer({ s }) {
  const output = s.output || [];
  const tail = output.slice(-16);
  const offset = output.length - tail.length;
  return <section className="sq-answer" aria-label="Recorded servers">
    <h3>Recorded answer</h3>
    {!output.length ? <p>No task has been recorded yet.</p> : <ol>
      {offset > 0 && <li className="sq-more">{offset} earlier answers</li>}
      {tail.map((server, i) => <li key={i + offset} className={i + offset === output.length - 1 ? 'is-current' : ''}>
        <span>T{i + offset}</span> → <strong>S{server}</strong></li>)}
    </ol>}
  </section>;
}
