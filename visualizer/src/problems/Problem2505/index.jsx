import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SubsetSumStrip from './SubsetSumStrip'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2505',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Only the empty subsequence sum is reachable.' },
    { id: 'item', label: 'Number', description: 'Bring the next number into the choices.' },
    { id: 'mark', label: 'Mark', description: 'A new sum becomes reachable.' },
    { id: 'check', label: 'Check', description: 'Look at the next candidate sum.' },
    { id: 'fold', label: 'OR', description: 'Fold each reachable sum into the result.' },
    { id: 'done', label: 'Result', description: 'Report the OR of every subsequence sum.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (whole numbers from 0 to 9)',
  url: 'https://leetcode.com/problems/bitwise-or-of-all-subsequence-sums/',
  complexity: 'O(n * S) time and O(S) space, where S is the total of nums: each number updates a table of reachable sums. The visualization caps S at 54; the official limits need a different method than this table.',
  examples: [
    { label: 'Consecutive', input: '{"nums":[1,2,3]}' },
    { label: 'Duplicates', input: '{"nums":[4,4,1]}' },
    { label: 'Pair', input: '{"nums":[5,6]}' },
  ],
}

export default function BitwiseOrOfSubsequenceSums() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SubsetSumStrip run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each sum can be reached by choosing or skipping every number, and duplicates are separate choices.</p>}
    />
  )
}
