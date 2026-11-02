import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Zero operations so far.' },
    { id: 'pick', label: 'Pick value', description: 'Choose the next element.' },
    { id: 'check', label: 'Check', description: 'Test the values at distance d below and above.' },
    { id: 'step', label: 'Widen', description: 'Neither side works; try distance d + 1.' },
    { id: 'add', label: 'Add cost', description: 'Add the distance to the total.' },
    { id: 'done', label: 'Result', description: 'Report the total number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (positive integers up to 200)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-binary-palindrome/',
  complexity: 'The search for each value stops at its nearest binary palindrome, so the cost is the gap to that palindrome.',
  examples: [
    { label: 'Mixed', input: '{"nums":[1,2,3,4]}' },
    { label: 'Single', input: '{"nums":[10]}' },
  ],
}

export default function MinimumOperationsBinaryPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at} />
    <output aria-label="Palindrome search">{`distance ${step.d ?? 0}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>An element can move down or up, so its cost is the distance to the nearest positive binary palindrome.</p>
    <p>Trying distances 0, 1, 2, ... in order finds that nearest palindrome first.</p>
  </>} />
}
