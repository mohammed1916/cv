import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The job begins at time zero.' },
    { id: 'step', label: 'Step', description: 'A step finishes before the cancel time.' },
    { id: 'cancel', label: 'Cancel', description: 'The next step would finish too late.' },
    { id: 'done', label: 'Result', description: 'Report the outcome.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with steps (durations in ms) and cancelAt',
  url: 'https://leetcode.com/problems/design-cancellable-function/',
  complexity: 'O(steps) time. The visualization models timing only, not the user callback.',
  examples: [
    { label: 'Cancelled midway', input: '{"steps":[20,30,50,10],"cancelAt":60}' },
    { label: 'Finishes first', input: '{"steps":[20,30],"cancelAt":80}' },
  ],
}

export default function DesignCancellableFunction() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const total = run.input.steps.reduce((a, b) => a + b, 0)
    const scale = Math.max(total, run.input.cancelAt, 1)
    const pct = v => `${(v / scale) * 100}%`
    return <div>
      <div style={{ position: 'relative', height: 60, borderBottom: '1px solid currentColor' }}>
        {step.done.map((t, i) => <div key={i} title={`step ends ${t}`} style={{ position: 'absolute', left: 0, top: 10, width: pct(t), height: 20, background: '#9333ea', opacity: 0.25 + 0.15 * i }} />)}
        <div title="cancel" style={{ position: 'absolute', left: pct(run.input.cancelAt), top: 0, bottom: 0, width: 3, background: '#dc2626' }} />
      </div>
      <output aria-label="Job state">{`t = ${step.t} ms · ${step.status} · finished steps: ${step.done.length}`}</output>
    </div>
  }} renderReasoning={() => <>
    <p>The cancel check happens before each step starts. Work already finished stays finished, and nothing after the cancel time is reported.</p>
  </>} />
}
