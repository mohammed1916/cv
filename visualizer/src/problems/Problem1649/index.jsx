import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The sorted array starts empty with cost 0.' },
    { id: 'insert', label: 'Insert', description: 'Count the smaller and larger values, then pay the cheaper side.' },
    { id: 'done', label: 'Complete', description: 'Report the total cost modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with instructions (integers 1-10)',
  url: 'https://leetcode.com/problems/create-sorted-array-through-instructions/',
  complexity: 'O(n^2) time for this scan. A Fenwick tree gives O(n log V). The visualization caps input at 30 instructions.',
  examples: [
    { label: 'Example 1', input: '{"instructions":[1,5,6,2]}' },
    { label: 'Example 3', input: '{"instructions":[1,3,3,3,2,4,2,1,2]}' },
  ],
}

export default function CreateSortedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Instructions" length={run.input.instructions.length} valueAt={i => run.input.instructions[i]}
      active={step.index ?? -1} roleAt={i => (step.index !== null && i < step.index ? 'inserted' : '')} />
    <output aria-label="Running cost">{`Running cost: ${step.cost}${step.less !== null ? ` (less ${step.less}, greater ${step.greater})` : ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each value can be inserted at a position that costs the number of smaller or larger values already present, whichever is fewer.</p>
  </>} />
}
