import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the digits and the swap budget.' },
    { id: 'move', label: 'Move digit', description: 'Bring the smallest reachable digit to this position.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest reachable number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (a string of 1 to 8 digits) and k (0 to 20)',
  url: 'https://leetcode.com/problems/minimum-possible-integer-after-at-most-k-adjacent-swaps-on-digits/',
  complexity: 'O(n * k) time for the visualization, where the window of each position is at most k digits.',
  examples: [
    { label: 'Example 1', input: '{"num":"4321","k":4}' },
    { label: 'Example 2', input: '{"num":"100","k":1}' },
  ],
}

export default function MinimumIntegerAfterSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits" length={step.digits.length} valueAt={i => step.digits[i]} active={step.index} roleAt={i => (i < step.index ? 'fixed' : '')} />
    <output aria-label="Swaps left">{`Swaps left: ${step.left}`}</output>
  </>} renderReasoning={() => <>
    <p>The smallest digit reachable within the remaining budget is brought to the front, then the same idea applies to the next position.</p>
    <p>Taking the earliest copy of a tied digit keeps the cost as low as possible, which leaves the most budget for later positions.</p>
  </>} />
}
