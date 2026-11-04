import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python,
  phases: [
    { id: 'start', label: 'First array', description: 'Track the range of the first array.' },
    { id: 'compare', label: 'Compare', description: 'Pair the current array with the earlier extremes.' },
    { id: 'update', label: 'Update range', description: 'Widen the tracked extremes.' },
    { id: 'done', label: 'Complete', description: 'Return the best distance.' },
  ],
  inputLabel: 'Arrays (JSON array of arrays)',
  url: 'https://leetcode.com/problems/maximum-distance-in-arrays/',
  complexity: 'O(total length) time and O(1) extra space: only the running minimum and maximum are kept.',
  examples: [
    { label: 'Two arrays', input: '[[1,2,3],[4,5],[1,2,3]]' },
    { label: 'Negative', input: '[[1],[-1]]' },
    { label: 'Three arrays', input: '[[1,4],[0,5],[-3,6]]' },
  ],
}

const W = 560
const ROW = 34

// One row per array as a bar from its minimum to its maximum, on a shared value axis.
function RangeChart({ arrays, current, lo, hi }) {
  const all = arrays.flat()
  const min = Math.min(...all), max = Math.max(...all)
  const span = Math.max(1, max - min)
  const x = v => 70 + ((v - min) / span) * (W - 100)
  const height = arrays.length * ROW + 40
  return <svg role="img" aria-label="Value range of each array" viewBox={`0 0 ${W} ${height}`} width="100%" style={{ maxWidth: W, display: 'block' }}>
    {arrays.map((a, i) => {
      const y = 20 + i * ROW
      const isCur = i === current
      return <g key={i} data-array={i}>
        <text x={8} y={y + 12} fill="var(--text)" fontSize={13} fontFamily="monospace">array {i}</text>
        <line x1={x(Math.min(...a))} x2={x(Math.max(...a))} y1={y + 8} y2={y + 8} stroke={isCur ? 'var(--primary)' : 'var(--text)'} strokeWidth={isCur ? 8 : 4} strokeLinecap="round" />
        <text x={x(Math.min(...a)) - 4} y={y + 2} textAnchor="end" fill="var(--text)" fontSize={11}>{Math.min(...a)}</text>
        <text x={x(Math.max(...a)) + 4} y={y + 2} fill="var(--text)" fontSize={11}>{Math.max(...a)}</text>
      </g>
    })}
    {lo !== null && <g aria-label="Earlier minimum and maximum">
      <line x1={x(lo)} x2={x(lo)} y1={12} y2={height - 16} stroke="var(--primary)" strokeDasharray="4 3" />
      <line x1={x(hi)} x2={x(hi)} y1={12} y2={height - 16} stroke="var(--primary)" strokeDasharray="4 3" />
      <text x={x(lo)} y={height - 4} textAnchor="middle" fill="var(--text)" fontSize={11}>lo {lo}</text>
      <text x={x(hi)} y={height - 4} textAnchor="middle" fill="var(--text)" fontSize={11}>hi {hi}</text>
    </g>}
  </svg>
}

export default function MaxDistanceArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RangeChart arrays={run.input} current={step.array} lo={step.lo ?? null} hi={step.hi ?? null} />
    <output aria-label="Tracked range" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>
      Earlier range: [{step.lo}, {step.hi}] · best {step.best ?? '—'}{step.pair ? ` · pair ${step.pair.join(' and ')}` : ''}
    </output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why extremes suffice:</strong> for a fixed later value, the farthest earlier value is either the smallest or the largest, so two numbers capture every earlier array.</p>
  </>} />
}
