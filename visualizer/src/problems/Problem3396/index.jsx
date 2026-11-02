import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty set at the right end.' },
    { id: 'extend', label: 'Extend', description: 'This value keeps the suffix distinct.' },
    { id: 'repeat', label: 'Repeat', description: 'This value already appears later.' },
    { id: 'done', label: 'Result', description: 'Report the number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 5)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-elements-in-array-distinct/',
  complexity: 'O(n) time and O(n) space for the set of seen values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,2,3,3,5,7]}' },
    { label: 'Example 2', input: '{"nums":[4,5,6,4,4]}' },
  ],
}

export default function MinimumNumberOfOperationsToMakeElementsDistinct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i >= step.start ? 'suffix' : '')} />
    <output aria-label="Distinct suffix">{`suffix starts at ${step.start}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation removes three elements from the front, so only the suffix that remains matters.</p>
    <p>The shortest distinct suffix is found by growing it from the right until a value repeats.</p>
  </>} />
}
