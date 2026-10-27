import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import SegtreeView from '../../components/shared/SegtreeView'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No ranges tracked.' },
    { id: 'addRange', label: 'addRange', description: 'Merge overlapping or touching intervals.' },
    { id: 'removeRange', label: 'removeRange', description: 'Split any interval that the removal cuts.' },
    { id: 'queryRange', label: 'queryRange', description: 'A query holds only if one interval covers it.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Operations (JSON array of [name, left, right))',
  url: 'https://leetcode.com/problems/range-module/',
  complexity: 'O(n) per operation for this list version; a balanced ordered set gives O(log n) plus interval work.',
  examples: [
    { label: 'Merge and split', input: '[["addRange",10,20],["removeRange",14,15],["queryRange",10,14],["queryRange",13,16],["queryRange",16,17]]' },
  ],
}

function IntervalViewFor({ run, step }) {
  const op = step.op === null || step.op === undefined ? null : run.input[step.op]
  const role = !op ? null : op[0] === 'addRange' ? 'current' : op[0] === 'removeRange' ? 'rejected' : step.returned ? 'merged' : 'rejected'
  const intervals = [
    ...step.intervals.map(([start, end]) => ({ start, end, group: 'Tracked ranges', role: 'kept' })),
    ...(op ? [{ start: op[1], end: op[2], group: `Operation: ${op[0]}`, role, label: op[0] === 'queryRange' ? (step.returned ? 'fully covered' : 'not fully covered') : undefined }] : []),
  ]
  const { interval } = intervalView({ title: 'Tracked ranges after each operation (half-open)', intervals, note: step.message })
  return interval ? <IntervalView {...interval} /> : null
}

export default function RangeModule() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IntervalViewFor run={run} step={step} />
    {step.seg && <SegtreeView {...step.seg} />}
    <table aria-label="Tracked intervals">
      <thead><tr><th>Interval</th></tr></thead>
      <tbody>{step.intervals.length === 0 ? <tr><td>none</td></tr> : step.intervals.map(([a, b]) => <tr key={`${a}-${b}`}><td>[{a}, {b})</td></tr>)}</tbody>
    </table>
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Half-open:</strong> [l, r) touching at a shared end counts as adjacent, so addRange merges intervals that meet exactly.</p>
  </>} />
}
