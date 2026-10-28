import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Any single number is a chain of length 1.' },
    { id: 'pair', label: 'Pair', description: 'Check this pair’s sum remainder and extend the chains that match it.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (integers 1 to 9) and k (1 to 5)',
  url: 'https://leetcode.com/problems/find-the-maximum-length-of-valid-subsequence-ii/',
  complexity: 'O(n^2) time and O(n * k) space. The visualization caps input at 10 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5],"k":2}' },
    { label: 'Modulo 3', input: '{"nums":[1,2,3],"k":3}' },
  ],
}

export default function ValidSubsequenceII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (step.j === i ? 'pair' : '')} />
    <p aria-label="Remainder">{step.r === null ? 'No pair yet' : `Pair remainder: ${step.r} (modulo ${run.input.k})`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A valid subsequence keeps one remainder for all its neighbouring pair sums. The table remembers, for each end index and remainder, the longest chain that uses that remainder.</p>
  </>} />
}
