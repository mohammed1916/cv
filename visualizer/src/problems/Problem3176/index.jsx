import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequence yet.' },
    { id: 'row', label: 'Row', description: 'Fill the row for this position, one column per allowed change count.' },
    { id: 'done', label: 'Complete', description: 'Report the longest good subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (integers 1 to 4) and k (0 to 3)',
  url: 'https://leetcode.com/problems/find-the-maximum-length-of-a-good-subsequence-i/',
  complexity: 'O(n^2 * k) time and O(n * k) space. The visualization caps input at 10 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1,1,3],"k":2}' },
    { label: 'No changes', input: '{"nums":[1,2,3,4,1],"k":0}' },
  ],
}

export default function GoodSubsequenceI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="dp[i][c]: longest good subsequence ending at i with c changes"
      values={step.dp.map(row => row.map(v => (v === null ? '-' : v)))}
      rowLabels={step.dp.map((_, i) => `${i}:${run.input.nums[i]}`)}
      activeCell={step.index >= 0 ? { row: step.index, column: 0 } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A position with c changes so far can follow any earlier position: the same value keeps the change count, a different value uses one more change.</p>
  </>} />
}
