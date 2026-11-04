import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1011.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the lower bound to the heaviest package and the upper bound to the total weight.' },
    { id: 'probe', label: 'Probe capacity', description: 'Try the midpoint capacity by packing packages into days in order.' },
    { id: 'narrow', label: 'Narrow', description: 'Keep the half that still contains the least feasible capacity.' },
    { id: 'done', label: 'Complete', description: 'The bounds meet at the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with weights and days (JSON)',
  url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
  complexity: 'O(n log(sum of weights)) time and O(1) auxiliary space: each probe packs the list once.',
  examples: authoredExamples,
}

export default function ShipWithinDays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.state
    const max = Math.max(1, ...s.loads, s.mid ?? 1)
    const total = run.input.weights.reduce((a, b) => a + b, 0)
    return <>
      <AnswerRangeBar title="Capacity search" min={Math.max(...run.input.weights)} max={Math.max(total, Math.max(...run.input.weights) + 1)}
        low={s.lo} high={s.hi} probe={s.mid} verdict={s.needed !== null && s.needed <= run.input.days} />
      <p aria-label="Capacity bounds" style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{`lo ${s.lo} · hi ${s.hi}${s.mid !== null ? ` · mid ${s.mid}` : ''}`}</p>
      <div aria-label="Day loads" role="img" style={{ display: 'grid', gap: 6, maxWidth: 520 }}>
        {s.loads.map((load, day) => <div key={day} data-day={day} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 48px', alignItems: 'center', gap: 8, fontFamily: 'monospace' }}>
          <span>{`Day ${day + 1}`}</span>
          <div style={{ height: 14, width: `${(load / max) * 100}%`, background: s.mid !== null && load > s.mid ? '#fca5a5' : '#93c5fd' }} />
          <span>{load}</span>
        </div>)}
      </div>
      <output aria-label="Days needed">{s.needed === null ? '' : `Days needed at this capacity: ${s.needed} (limit ${run.input.days}).`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Monotone test:</strong> if a capacity works, every larger capacity works too, so binary search can discard half of the interval each probe.</p>
    <p><strong>Greedy packing:</strong> for a fixed capacity, filling each day as much as possible in order gives the fewest days.</p>
  </>} />
}
