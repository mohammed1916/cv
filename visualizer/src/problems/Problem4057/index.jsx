import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort starts', description: 'Sort every start value once.' },
    { id: 'count', label: 'Disjoint count', description: 'Count the intervals that begin after this one ends.' },
    { id: 'done', label: 'Complete', description: 'Subtract disjoint pairs from all pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals (JSON object with intervals)',
  url: 'https://leetcode.com/problems/number-of-intersecting-interval-pairs-ii/',
  complexity: 'O(n log n) time and O(n) space. The visualization caps input at 12 intervals.',
  examples: [
    { label: 'Example 1', input: '{"intervals":[[1,2],[2,3],[3,4]]}' },
    { label: 'Example 2', input: '{"intervals":[[1,5],[2,4],[3,6]]}' },
  ],
}

export default function IntersectingIntervalPairsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Intervals">
      <tbody>{run.input.intervals.map(([s, e], i) => <tr key={i} data-active={i === step.index ? 'true' : undefined}>
        <td>{i}</td><td>{`[${s}, ${e}]`}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Disjoint">{`Disjoint pairs so far: ${step.disjoint}`}</output>
  </>} renderReasoning={() => <>
    <p>Two intervals are disjoint when one ends before the other starts. Each disjoint pair has exactly one such order.</p>
    <p>Counting starts above each end and subtracting from n(n − 1) / 2 gives the intersecting pairs.</p>
  </>} />
}
