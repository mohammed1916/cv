import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No palindrome has been found yet.' },
    { id: 'center', label: 'Center', description: 'Choose the next center, one or two positions wide.' },
    { id: 'match', label: 'Palindrome', description: 'The ends match, so this subarray is a palindrome.' },
    { id: 'done', label: 'Complete', description: 'Report the largest sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/palindromic-subarray-sum/',
  complexity: 'O(n²) time with prefix sums and O(n) space in this version. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Pair', input: '{"nums":[10,10]}' },
    { label: 'Long', input: '{"nums":[7,1,2,1,7,3,4,3,4]}' },
  ],
}

export default function PalindromicSubarraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.l}
      roleAt={i => (step.r >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Best sum">{`Best so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every palindrome has a center, and it stays a palindrome while its outer ends keep matching.</p>
    <p>Walking outward from each center visits every palindromic subarray, and prefix sums give each one's sum directly.</p>
  </>} />
}
