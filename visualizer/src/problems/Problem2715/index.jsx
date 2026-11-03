import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'schedule', label: 'Schedule', description: 'Start the timer.' },
    { id: 'cancel', label: 'Cancel', description: 'Clear the timer before it ends.' },
    { id: 'fire', label: 'Fire', description: 'The timer ends and the callback runs.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with delay (ms) and cancelAt (ms, or null for no cancel)',
  url: 'https://leetcode.com/problems/timeout-cancellation/',
  complexity: 'O(1). The visualization models one timer and one cancel request.',
  examples: [
    { label: 'Cancelled early', input: '{"delay":100,"cancelAt":40}' },
    { label: 'Cancel too late', input: '{"delay":100,"cancelAt":150}' },
  ],
}

export default function TimeoutCancellation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const scale = Math.max(run.input.delay, run.input.cancelAt ?? 0, 1)
    const pct = v => `${(v / scale) * 100}%`
    return <div>
      <div style={{ position: 'relative', height: 60, borderBottom: '1px solid currentColor' }}>
        <div title="timer" style={{ position: 'absolute', left: 0, top: 18, width: pct(run.input.delay), height: 22, background: '#2563eb', opacity: 0.5 }} />
        {run.input.cancelAt !== null && <div title="cancel" style={{ position: 'absolute', left: pct(run.input.cancelAt), top: 0, bottom: 0, width: 3, background: '#dc2626' }} />}
      </div>
      <output aria-label="Timer state">{`t = ${step.t} ms · ${step.status}`}</output>
    </div>
  }} renderReasoning={() => <>
    <p>The returned cancel function only clears a timer that has not yet fired. Once the callback has run, cancelling has no visible effect.</p>
  </>} />
}
