import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the task and the timer together.' },
    { id: 'wait', label: 'Wait', description: 'Neither has settled yet.' },
    { id: 'resolve', label: 'Resolve', description: 'The task wins the race.' },
    { id: 'reject', label: 'Reject', description: 'The limit wins the race.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with delay, limit and value (milliseconds)',
  url: 'https://leetcode.com/problems/promise-time-limit/',
  complexity: 'O(1) bookkeeping. The visualization only models the timing race, not the user function.',
  examples: [
    { label: 'Finishes in time', input: '{"delay":30,"limit":80,"value":"ready"}' },
    { label: 'Too slow', input: '{"delay":120,"limit":50,"value":"late"}' },
  ],
}

export default function PromiseTimeLimit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const scale = Math.max(run.input.delay, run.input.limit, 1)
    const pct = v => `${(v / scale) * 100}%`
    return <div>
      <div style={{ position: 'relative', height: 90, borderBottom: '1px solid currentColor' }}>
        <div title="Task" style={{ position: 'absolute', left: 0, top: 10, width: pct(run.input.delay), height: 22, background: '#0ea5e9', opacity: 0.75 }} />
        <div title="Limit" style={{ position: 'absolute', left: 0, top: 50, width: pct(run.input.limit), height: 22, background: '#f97316', opacity: 0.75 }} />
        <div style={{ position: 'absolute', left: pct(step.t), top: 0, bottom: 0, width: 2, background: 'currentColor' }} />
      </div>
      <p>Blue bar: task finishes at {run.input.delay} ms. Orange bar: limit at {run.input.limit} ms.</p>
      <output aria-label="Race state">{`t = ${step.t} ms · ${step.outcome ?? 'pending'}`}</output>
    </div>
  }} renderReasoning={() => <>
    <p>The wrapper races two settlements. Whichever happens first decides the promise, and the other is ignored.</p>
    <p>Comparing the delay with the limit decides the winner, because both start at the same moment.</p>
  </>} />
}
