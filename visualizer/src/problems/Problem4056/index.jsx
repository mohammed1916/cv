import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pair', label: 'Pair', description: 'Check whether this pair of intervals shares a point.' },
    { id: 'done', label: 'Complete', description: 'Report the number of intersecting pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals (JSON object with intervals)',
  url: 'https://leetcode.com/problems/number-of-intersecting-interval-pairs-i/',
  complexity: 'O(n²) time and O(1) extra space. The visualization caps input at 12 intervals.',
  examples: [
    { label: 'Example 1', input: '{"intervals":[[1,2],[2,3],[3,4]]}' },
    { label: 'Example 2', input: '{"intervals":[[1,5],[2,4],[3,6]]}' },
  ],
}

export default function IntersectingIntervalPairsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Intervals">
      <tbody>{run.input.intervals.map(([s, e], i) => <tr key={i} data-active={i === step.i || i === step.j ? 'true' : undefined}>
        <td>{i}</td><td>{`[${s}, ${e}]`}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Count">{`Intersecting pairs so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Two closed intervals intersect exactly when the larger start is at most the smaller end.</p>
    <p>Touching at one endpoint counts, so the comparison uses at most.</p>
  </>} />
}
