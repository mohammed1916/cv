import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The window length is set.' },
    { id: 'call', label: 'Call', description: 'A call arrives.' },
    { id: 'run', label: 'Run', description: 'The function runs now.' },
    { id: 'queue', label: 'Queue', description: 'The call waits for the window to end.' },
    { id: 'done', label: 'Done', description: 'Every queued call has run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with wait (ms) and calls (sorted list of call times in ms)',
  url: 'https://leetcode.com/problems/throttle/',
  complexity: 'O(calls) time. The model stores one pending call, the latest one.',
  examples: [
    { label: 'Burst then a late call', input: '{"wait":100,"calls":[0,40,90,260]}' },
    { label: 'Spaced calls', input: '{"wait":50,"calls":[0,60,130]}' },
    { label: 'Single call', input: '{"wait":1,"calls":[0]}' },
    { label: 'Calls exactly one wait apart', input: '{"wait":100,"calls":[0,100,200]}' },
    { label: 'Largest: wait 500, eight calls', input: '{"wait":500,"calls":[0,100,200,300,400,500,600,1000]}' },
    { label: 'Long run: 8 calls', input: '{"wait":73,"calls":[24,79,141,225,292,471,650,850]}' },
  ],
}

export default function Throttle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // A time axis: runs are solid markers, the current call is a ring, and the pending run is a dashed marker.
    const end = Math.max(...run.input.calls, step.pendingAt ?? 0, ...run.result, 1)
    const pct = t => `${(t / end) * 100}%`
    const mark = (t, style) => <div key={`${style.key}-${t}`} title={`${t} ms`} style={{ position: 'absolute', left: pct(t), top: style.top, width: 10, height: 10, marginLeft: -5, borderRadius: '50%', ...style.css }} />
    return <section aria-label="Throttle timeline" style={{ display: 'grid', gap: 8 }}>
      <div style={{ position: 'relative', height: 84, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        {run.input.calls.map(t => mark(t, { key: 'call', top: 14, css: { border: '2px solid var(--primary)', background: 'transparent' } }))}
        {step.runs.map(t => mark(t, { key: 'run', top: 40, css: { background: 'var(--success)' } }))}
        {step.pendingAt !== null && step.pendingAt !== undefined && mark(step.pendingAt, { key: 'pending', top: 62, css: { border: '2px dashed var(--warning)', background: 'transparent' } })}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: 13 }}>
        <span>Rings: calls</span><span>Filled: runs</span><span>Dashed: queued run</span><span>Window {run.input.wait} ms</span>
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>{step.message} Runs so far: <code>{JSON.stringify(step.runs)}</code></p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
