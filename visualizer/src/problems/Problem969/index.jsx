import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Unsorted', description: 'Start with the given order.' },
    { id: 'find', label: 'Find largest', description: 'Locate the largest value that is not yet in place.' },
    { id: 'flip', label: 'Reverse prefix', description: 'Reverse the first k values.' },
    { id: 'done', label: 'Sorted', description: 'Every value is in place.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Permutation (JSON array)',
  url: 'https://leetcode.com/problems/pancake-sorting/',
  complexity: 'O(n^2) time to find and flip. At most 2n flips are used. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '[3,2,4,1]' },
    { label: 'Sorted', input: '[1,2,3]' },
  ],
}

export default function PancakeSorting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Array" length={step.array.length} active={step.flip === null ? -1 : step.flip - 1} valueAt={i => step.array[i]} />
    <output aria-label="Flips">{step.flip === null ? step.message : `Flip the first ${step.flip}`}</output>
  </>} renderReasoning={() => <>
    <p>Each step places one value at its final position. Reverse the prefix up to the largest value so it reaches the front, then reverse the prefix up to its place, which moves it to the end of the unsorted part.</p>
    <p>Two flips per value bound the total at 2n.</p>
  </>} />
}
