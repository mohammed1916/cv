import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the given number.' },
    { id: 'advance', label: 'Next arrangement', description: 'Step to the next larger arrangement of the same digits.' },
    { id: 'swap', label: 'Bring digit', description: 'Move the target digit forward by adjacent swaps.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of adjacent swaps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (2 to 10 digits as a string) and k (1 to 30)',
  url: 'https://leetcode.com/problems/minimum-adjacent-swaps-to-reach-the-kth-smallest-number/',
  complexity: 'O(k * n + n^2) time for the steps and the swap count, where n is the number of digits.',
  examples: [
    { label: 'Example 1', input: '{"num":"5489355142","k":4}' },
    { label: 'Example 2', input: '{"num":"11112","k":4}' },
  ],
}

export default function MinimumSwapsKthSmallest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits being rearranged" length={step.digits.length} valueAt={i => step.digits[i]} active={step.index} roleAt={i => (i < step.index ? 'placed' : '')} />
    <output aria-label="Swaps so far">{`Adjacent swaps so far: ${step.swaps}`}</output>
  </>} renderReasoning={() => <>
    <p>The wonderful integers are the arrangements of the digits, listed in increasing order, so the kth one is k next-arrangement steps away.</p>
    <p>Moving each target digit forward to its place is the fewest adjacent swaps, because each swap moves one digit by one position.</p>
  </>} />
}
