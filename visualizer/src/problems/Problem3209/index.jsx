import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been counted yet.' },
    { id: 'extend', label: 'Extend groups', description: 'Combine the new value with the AND groups ending at the previous index.' },
    { id: 'count', label: 'Count matches', description: 'Subarrays ending here whose AND equals k are added to the total.' },
    { id: 'done', label: 'Complete', description: 'Report the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 20 values, 0 to 63) and k (0 to 63), e.g. {"nums":[1,1,2],"k":1}',
  url: 'https://leetcode.com/problems/number-of-subarrays-with-and-value-of-k/',
  complexity: 'O(n * log V) time and O(log V) space for the AND groups. The visualization caps the input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1],"k":1}' },
    { label: 'Example 2', input: '{"nums":[1,1,2],"k":1}' },
  ],
}

export default function SubarraysWithAndK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <table aria-label="AND groups ending here">
      <thead><tr><th>AND value</th><th>Subarrays</th></tr></thead>
      <tbody>{step.groups.map(([value, count]) => <tr key={value}><td>{value}</td><td>{count}</td></tr>)}</tbody>
    </table>
    <output aria-label="Total">{`Total so far: ${step.total} (target AND ${run.input.k})`}</output>
  </>} renderReasoning={() => <>
    <p>Subarrays ending at one index have AND values that only lose bits as they widen, so there are few distinct values.</p>
    <p>Each group keeps how many subarrays produce its value, and the count for k is added at every index.</p>
  </>} />
}
