import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start the best distance at zero.' },
    { id: 'corner', label: 'Corner', description: 'Pick one diagonal corner to aim for.' },
    { id: 'walk', label: 'Walk', description: 'Count helpful and hurting moves in the prefix.' },
    { id: 'reach', label: 'Changes', description: 'Spend up to k changes on hurting moves.' },
    { id: 'record', label: 'Record', description: 'Keep the largest distance seen.' },
    { id: 'done', label: 'Result', description: 'Report the best distance.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Moves JSON with s and k',
  url: 'https://leetcode.com/problems/maximum-manhattan-distance-after-k-changes/',
  complexity: 'O(n) time and O(1) extra space for n moves per corner. The visualization caps s at 12 moves.',
  examples: [
    { label: 'Short walk', input: '{"s":"NNEW","k":1}' },
    { label: 'Mixed walk', input: '{"s":"SWSEN","k":2}' },
    { label: 'Straight line', input: '{"s":"EEEEN","k":0}' },
  ],
}

export default function MaximumManhattanDistanceAfterKChanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Moves" length={step.moves.length} valueAt={index => step.moves[index]}
      active={Math.max(0, step.steps - 1)}
      roleAt={index => {
        if (index >= step.steps || !step.corner) return ''
        return step.moves[index] === step.corner[0] || step.moves[index] === step.corner[1] ? 'toward' : 'away'
      }} />
    <svg viewBox="-120 -120 240 240" role="img" aria-label="Walk path from the origin" style={{ width: 240, maxWidth: '100%', background: 'var(--surface2)', borderRadius: 8 }}>
      <line x1={-110} y1={0} x2={110} y2={0} stroke="var(--text-muted)" />
      <line x1={0} y1={-110} x2={0} y2={110} stroke="var(--text-muted)" />
      {(() => {
        const pts = [[0, 0]]
        let x = 0, y = 0
        for (const ch of run.input.s.slice(0, step.steps)) {
          if (ch === 'N') y += 1; else if (ch === 'S') y -= 1; else if (ch === 'E') x += 1; else x -= 1
          pts.push([x, y])
        }
        const scale = 16
        const d = pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px * scale} ${-py * scale}`).join(' ')
        return <>
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth={3} />
          {pts.map(([px, py], i) => <circle key={i} cx={px * scale} cy={-py * scale} r={4} fill={i === pts.length - 1 ? 'var(--primary)' : 'var(--text-muted)'} />)}
        </>
      })()}
      <text x={-112} y={-100} fill="var(--text)" fontSize="12">{step.corner ? `corner ${step.corner[0]}${step.corner[1]}` : 'no corner yet'}</text>
    </svg>
    <p>Corner: {step.corner ? `${step.corner[0]}${step.corner[1]}` : 'none yet'} · Helpful {step.helpful} · Hurting {step.harmful} · Best {step.best}</p>
    <p>Input: {run.input.s} with k = {run.input.k}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each change can turn one hurting move into a helpful one, which moves the reachable point two steps farther from the origin in that corner's direction.</p>
  </>} />
}
