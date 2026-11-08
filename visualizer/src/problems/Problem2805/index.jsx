import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Schedule', description: 'Plan the first call after the delay.' },
    { id: 'fire', label: 'Fire', description: 'A call runs and the next wait grows by one period.' },
    { id: 'cancel', label: 'Cancel', description: 'The next call would fall after the cancel time.' },
    { id: 'done', label: 'Result', description: 'The calls that ran before the cancel.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"delay": 50, "period": 20, "cancelTime": 225}',
  url: 'https://leetcode.com/problems/custom-interval/',
  complexity: 'O(k) for k calls before the cancel time. The visualization caps the cancel time at 1000 ms.',
  examples: [
    { label: 'Growing waits', input: '{"delay":50,"period":20,"cancelTime":225}' },
    { label: 'Cancel early', input: '{"delay":30,"period":40,"cancelTime":60}' },
    { label: "Tie: call lands exactly on cancel", input: "{\"delay\":20,\"period\":20,\"cancelTime\":20}" },
    { label: "No call before cancel", input: "{\"delay\":250,\"period\":250,\"cancelTime\":0}" },
    { label: "Largest cancel time", input: "{\"delay\":250,\"period\":250,\"cancelTime\":1000}" },
    { label: "Long run: seeded delay and period", input: "{\"delay\":60,\"period\":46,\"cancelTime\":1000}" },
  ],
}

// Event timeline: each call's time on a shared clock from 0 to the cancel time.
function Timeline({ run, step }) {
  const T = run.input.cancelTime
  const W = 320, P = 16
  const sx = t => P + (t / Math.max(1, T)) * (W - 2 * P)
  return <figure aria-label="Call timeline" style={{ margin: '0 0 12px' }}>
    <svg viewBox="0 0 320 90" width="100%" style={{ maxWidth: 360, display: 'block' }} role="img" aria-label="Times of calls and the cancel time">
      <line x1={P} y1={50} x2={W - P} y2={50} stroke="var(--text)" opacity="0.5" />
      {step.fired.map((t, k) => <g key={k}>
        <circle cx={sx(t)} cy={50} r="6" fill="var(--primary)" stroke="var(--text)" />
        <text x={sx(t)} y={34} fontSize="11" fill="var(--text)" textAnchor="middle">{t}</text>
        <text x={sx(t)} y={70} fontSize="10" fill="var(--text)" textAnchor="middle">{`#${k + 1}`}</text>
      </g>)}
      <line x1={sx(T)} x2={sx(T)} y1={20} y2={80} stroke="var(--text)" strokeDasharray="4 3" />
      <text x={sx(T)} y={14} fontSize="11" fill="var(--text)" textAnchor="end">{`cancel ${T}`}</text>
      <text x={P} y={86} fontSize="10" fill="var(--text)">0 ms</text>
    </svg>
    <figcaption style={{ color: 'var(--text)' }}>{`Wait before call k is delay + period * (k - 1). Shown: the calls that have run so far.`}</figcaption>
  </figure>
}

export default function CustomInterval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Timeline run={run} step={step} />
    <output aria-label="Next wait">{step.wait === null ? `Calls so far: ${step.fired.length}` : `Wait ${step.wait} ms, now at ${step.now} ms, calls so far ${step.fired.length}`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A fixed-period timer cannot express this schedule, because the wait before each call grows by one period. Each call schedules the next one, and the wait for call k is delay + period * (k - 1) after the previous call.</p>
    <p>Clearing the interval cancels the one pending timer, so no later call runs.</p>
  </>} />
}
