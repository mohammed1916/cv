import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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

export default function RangeModule() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
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
