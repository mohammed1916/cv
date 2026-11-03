import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3836,
  phases: [
    { id: 'cell', label: 'Cells', description: 'Each cell takes the better of skipping a number or ending a pair here.' },
    { id: 'done', label: 'Result', description: 'The last cell of the last layer is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, nums2 (1 to 5 integers from -9 to 9 each) and k',
  url: 'https://leetcode.com/problems/maximum-score-using-exactly-k-pairs/',
  complexity: 'O(k * n * m) time and O(k * n * m) space for the full table shown.',
  examples: [
    { label: 'Two pairs', input: '{"nums1":[2,4,1],"nums2":[3,1,5,2],"k":2}' },
    { label: 'Negatives', input: '{"nums1":[-4,1,-2],"nums2":[2,-1,3],"k":2}' },
  ],
}

export default function MaximumScoreExactlyKPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label={`Best score layer ${step.layer}`}>
      <caption>Layer {step.layer}: rows are prefixes of nums1, columns are prefixes of nums2</caption>
      <thead><tr><th>i \ j</th>{step.grid[0].map((_, j) => <th key={j}>{j}</th>)}</tr></thead>
      <tbody>{step.grid.map((row, i) => <tr key={i}><th>{i}</th>{row.map((v, j) => <td key={j}
        data-current={step.i === i && step.j === j ? 'yes' : undefined}>{v === null ? '–' : v}</td>)}</tr>)}</tbody>
    </table>
    <output aria-label="Current cell">{step.message}{step.pair ? ` · pair (${step.pair[0]}, ${step.pair[1]}) taken` : ''}</output>
    <p>Input: nums1 = [{run.input.nums1.join(', ')}], nums2 = [{run.input.nums2.join(', ')}], k = {run.input.k}</p>
  </>} renderReasoning={() => <>
    <p>A chain of pairs with increasing indices in both lists can be built from smaller chains: either a list has no more pairs to use, or the last pair ends exactly at the current indices.</p>
    <p>The layer for t pairs depends only on the layer for t - 1, so each layer is one sweep over the grid.</p>
  </>} />
}
