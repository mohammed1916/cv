import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequence yet.' },
    { id: 'value', label: 'Value', description: 'Compute the best chains ending at this number, then store them under its value.' },
    { id: 'done', label: 'Complete', description: 'Report the longest good subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (integers 1 to 4) and k (0 to 3)',
  url: 'https://leetcode.com/problems/find-the-maximum-length-of-a-good-subsequence-ii/',
  complexity: 'O(n * k * V) time for V distinct values here, and O(V * k) space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1,1,3],"k":2}' },
    { label: 'No changes', input: '{"nums":[1,2,3,4,1],"k":0}' },
  ],
}

export default function GoodSubsequenceII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i < step.index ? 'seen' : '')} />
    <p aria-label="Row">{step.row ? `Chains ending at ${step.value} by change count: ${step.row.map(v => v ?? '-').join(', ')}` : 'No chains yet'}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Instead of checking every earlier position, the chains are grouped by value. A new number only needs the best chain of its own value, and the best chain of any other value with one fewer change.</p>
  </>} />
}
