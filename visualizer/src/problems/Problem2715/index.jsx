import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'schedule', label: 'Schedule', description: 'The timer starts at time 0.' },
    { id: 'cancel', label: 'Cancel', description: 'The cancel comes before the delay, so the callback never runs.' },
    { id: 'fire', label: 'Fire', description: 'The delay ends first, so the callback runs.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with delay (ms) and cancelAt (ms or null for no cancel)',
  url: 'https://leetcode.com/problems/timeout-cancellation/',
  complexity: 'O(1). One timer is set and at most one event decides the outcome.',
  examples: [
    { label: 'Cancelled first', input: '{"delay":40,"cancelAt":15}' },
    { label: 'No cancel', input: '{"delay":25,"cancelAt":null}' },
  ],
}

export default function TimeoutCancellation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // One axis from 0 to the later of delay and cancel. The timer bar fills to its end; the decisive event is marked.
    const { delay, cancelAt } = run.input
    const span = Math.max(delay, cancelAt ?? 0, 1)
    const pct = t => `${(t / span) * 100}%`
    const marked = step.t
    return <section aria-label="Timer timeline" style={{ display: 'grid', gap: 8 }}>
      <div style={{ position: 'relative', height: 40, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <div style={{ position: 'absolute', left: 0, top: 14, height: 12, width: pct(delay), background: step.status === 'fired' ? 'var(--success)' : 'var(--primary)', borderRadius: 6, opacity: 0.6 }} />
        {cancelAt !== null && <div aria-label="Cancel time" title={`cancel at ${cancelAt} ms`} style={{ position: 'absolute', left: pct(cancelAt), top: 0, bottom: 0, width: 2, background: 'var(--error)' }} />}
        <div aria-label="Delay end" title={`delay ends at ${delay} ms`} style={{ position: 'absolute', left: pct(delay), top: 0, bottom: 0, width: 2, background: 'var(--text)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}><span>0 ms</span><span>delay {delay} ms{cancelAt !== null ? `, cancel ${cancelAt} ms` : ', no cancel'}</span></div>
      <p style={{ margin: 0, color: 'var(--text)' }}>Status: <code>{step.status}</code>{marked !== undefined ? ` at ${marked} ms` : ''}. Result: <code>{step.phase === 'done' || step.phase === 'fire' || step.phase === 'cancel' ? run.result : 'pending'}</code></p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
