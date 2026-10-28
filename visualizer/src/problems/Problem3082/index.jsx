import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'The empty set has sum 0 and no members.' },
    { id: 'item', label: 'Add a value', description: 'Each value either joins a set or does not, and sets are counted by sum and size.' },
    { id: 'done', label: 'Complete', description: 'Weight the sets that sum to k by the subsequences that contain them.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/find-the-sum-of-the-power-of-all-subsequences/',
  complexity: 'O(n * k * n) time and O(k * n) space. The visualization caps nums at 6 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":3}' },
    { label: 'Example 2', input: '{"nums":[2,3,5],"k":5}' },
  ],
}

export default function SumOfPowerSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Sets by sum (rows) and size (columns)" values={step.table} />
    <output aria-label="Result">{step.item === null ? `Sets built from ${run.input.nums.length} values` : `Added ${step.item}`}</output>
  </>} renderReasoning={() => <>
    <p>A subsequence has power equal to the number of its own subsequences that sum to k. Counting those pairs from the other side gives each k-sum set T a weight of 2 to the power of the values outside T.</p>
    <p>The table counts the sets by sum and size, so the weight of each size is one multiplication.</p>
  </>} />
}
