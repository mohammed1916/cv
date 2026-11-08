import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Unsorted', description: 'Start with the given order.' },
    { id: 'find', label: 'Find largest', description: 'Locate the largest value that is not yet in place.' },
    { id: 'flip', label: 'Reverse prefix', description: 'Reverse the first k values.' },
    { id: 'done', label: 'Sorted', description: 'Every value is in place.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Permutation (JSON array)',
  url: 'https://leetcode.com/problems/pancake-sorting/',
  complexity: 'O(n^2) time to find and flip. At most 2n flips are used. The visualization caps input at 12 values.',
  examples: [
    { label: 'Own case 1', input: '[1,4,2,3]' },
    { label: 'Sorted', input: '[1,2,3]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Reversed permutation', input: '[12,11,10,9,8,7,6,5,4,3,2,1]' },
    { label: 'Two swapped', input: '[2,1,3]' },
    { label: 'Long run: shuffled 12', input: '[9,1,11,3,12,4,8,10,7,2,5,6]' },
  ],
}

export default function PancakeSorting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Array (values already in final place are marked)" length={step.array.length} active={step.flip === null ? -1 : step.flip - 1} valueAt={i => step.array[i]} roleAt={i => (step.array[i] === i + 1 ? 'in place' : '')} />
    <output aria-label="Flips">{step.flip === null ? step.message : `Flip the first ${step.flip}`}</output>
  </>} renderReasoning={() => <>
    <p>Each step places one value at its final position. Reverse the prefix up to the largest value so it reaches the front, then reverse the prefix up to its place, which moves it to the end of the unsorted part.</p>
    <p>Two flips per value bound the total at 2n.</p>
  </>} />
}
