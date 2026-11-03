import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the window length.' },
    { id: 'call', label: 'Call', description: 'A caller invokes the throttled function.' },
    { id: 'queue', label: 'Queue', description: 'Inside the window, keep only the latest call.' },
    { id: 'run', label: 'Run', description: 'The function actually executes.' },
    { id: 'done', label: 'Done', description: 'Pending work is flushed.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with wait (ms) and calls (ascending times, at most 8)',
  url: 'https://leetcode.com/problems/throttle/',
  complexity: 'O(calls) time and O(1) extra state: one last-run time and one pending slot.',
  examples: [
    { label: 'Burst then pause', input: '{"wait":100,"calls":[0,40,90,150,260]}' },
    { label: 'Two calls', input: '{"wait":50,"calls":[10,70]}' },
  ],
}

export default function Throttle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const end = Math.max(...run.input.calls, ...step.runs, step.pendingAt ?? 0, 1)
    const pct = v => `${(v / end) * 100}%`
    return <div>
      <div style={{ position: 'relative', height: 90, borderBottom: '1px solid currentColor' }}>
        {run.input.calls.map((t, i) => <div key={`c${i}`} title={`call at ${t}`} style={{ position: 'absolute', left: pct(t), top: 8, width: 2, height: 30, background: '#64748b' }} />)}
        {step.runs.map((t, i) => <div key={`r${i}`} title={`run at ${t}`} style={{ position: 'absolute', left: pct(t), top: 50, width: 10, height: 30, marginLeft: -4, background: '#0f766e', borderRadius: 3 }} />)}
        {step.pendingAt !== null && <div title="pending run" style={{ position: 'absolute', left: pct(step.pendingAt), top: 50, width: 10, height: 30, marginLeft: -4, border: '2px dashed #0f766e', borderRadius: 3 }} />}
      </div>
      <p>Grey ticks are calls. Teal blocks are runs. A dashed block is the pending run.</p>
      <output aria-label="Throttle state">{`runs so far: ${step.runs.join(', ') || 'none'}${step.pendingAt !== null ? ` · pending at ${step.pendingAt} ms` : ''}`}</output>
    </div>
  }} renderReasoning={() => <>
    <p>Only two numbers are needed: when the function last ran and which call is waiting. Each new call either runs or replaces the waiting one.</p>
    <p>Keeping the latest arguments means the final state is never lost, even when the burst is long.</p>
  </>} />
}
