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
    { label: 'Four values, k two', input: '{"nums":[2,5,7,4],"k":2}' },
    { label: 'Modulo 3', input: '{"nums":[1,2,3],"k":3}' },
    { label: 'Single value with k one', input: '{"nums":[4],"k":1}' },
    { label: 'Equal values with k five', input: '{"nums":[9,9,9,9],"k":5}' },
    { label: 'Largest list, alternating extremes', input: '{"nums":[1,9,1,9,1,9,1,9,1,9],"k":3}' },
    { label: 'Long run: 10 values', input: '{"nums":[9,5,5,5,8,1,3,4,9,7],"k":4}' },
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
